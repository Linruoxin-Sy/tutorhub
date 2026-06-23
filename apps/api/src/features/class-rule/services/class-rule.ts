import rrulePkg, { type Options as RRuleOptions } from 'rrule';
import { z } from 'zod';

import type {
  classRuleConflictCheckSchema,
  classRuleCreateSchema,
  ClassRuleListItem,
  classRuleListQuerySchema,
  classRuleUpdateSchema,
  ConflictItem,
} from '@tutorhub/schema';

import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';

const { RRule } = rrulePkg;

/** 生成未来 Session 的天数 */
const SESSION_GENERATION_DAYS = 180;

export const classRuleService = {
  async list(
    courseId: string,
    query: Omit<z.infer<typeof classRuleListQuerySchema>, 'courseId'>,
    userId: string,
  ) {
    // 校验课程归属
    const course = await prisma.course.findFirst({
      where: { id: courseId, userId, deletedAt: null },
    });
    if (!course) {
      throw new ApiError(404, 'COURSE_NOT_FOUND', 'Course not found');
    }

    const take = query.limit;
    const skip = query.offset ?? 0;

    const baseWhere = { courseId, deletedAt: null };

    const [dbItems, total] = await Promise.all([
      prisma.classRule.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          course: { select: { id: true, name: true, status: true } },
        },
      }),
      prisma.classRule.count({ where: baseWhere }),
    ]);

    const items = dbItems as unknown as ClassRuleListItem[];
    const lastItem = dbItems.at(-1);
    const hasMore = skip + take < total;

    return {
      items,
      nextCursor: hasMore && lastItem ? lastItem.id : null,
      total,
    };
  },

  async getById(id: string, userId: string) {
    const classRule = await prisma.classRule.findFirst({
      where: { id, deletedAt: null },
      include: {
        course: { select: { id: true, name: true, userId: true } },
      },
    });

    if (!classRule || classRule.course.userId !== userId) {
      throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');
    }

    const { userId: _omit, ...courseInfo } = classRule.course;
    void _omit;
    return {
      ...classRule,
      course: courseInfo,
    };
  },

  async create(input: z.infer<typeof classRuleCreateSchema>, userId: string) {
    // 校验课程归属
    const course = await prisma.course.findFirst({
      where: { id: input.courseId, userId, deletedAt: null },
    });
    if (!course) {
      throw new ApiError(404, 'COURSE_NOT_FOUND', 'Course not found');
    }

    // 创建规则
    const classRule = await prisma.classRule.create({
      data: {
        courseId: input.courseId,
        startDate: input.startDate,
        intervalDays: input.intervalDays ?? null,
        endDate: input.endDate ?? null,
        startTime: new Date(`1970-01-01T${input.startTime}`),
        endTime: new Date(`1970-01-01T${input.endTime}`),
        room: input.room ?? null,
      },
    });

    // 生成未来 SESSION_GENERATION_DAYS 天的 Session
    const sessions = await this._generateSessionsForRule(classRule.id, input);

    // 为每个 Session 添加参与者（使用选中的学生）
    if (input.studentIds && input.studentIds.length > 0 && sessions.length > 0) {
      const participantData = sessions.flatMap((session) =>
        input.studentIds!.map((studentId: string) => ({
          classSessionId: session.id,
          studentId,
        })),
      );
      await prisma.sessionParticipant.createMany({ data: participantData });
    }

    return classRule;
  },

  async update(id: string, input: z.infer<typeof classRuleUpdateSchema>, userId: string) {
    const existing = await prisma.classRule.findFirst({
      where: { id, deletedAt: null },
      include: { course: { select: { userId: true } } },
    });

    if (!existing || existing.course.userId !== userId) {
      throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');
    }

    const updateData: Record<string, unknown> = {};
    if (input.startDate !== undefined) updateData.startDate = input.startDate;
    if (input.startTime !== undefined)
      updateData.startTime = new Date(`1970-01-01T${input.startTime}`);
    if (input.endTime !== undefined) updateData.endTime = new Date(`1970-01-01T${input.endTime}`);
    if (input.intervalDays !== undefined) updateData.intervalDays = input.intervalDays;
    if (input.endDate !== undefined) updateData.endDate = input.endDate;
    if (input.room !== undefined) updateData.room = input.room;

    const classRule = await prisma.classRule.update({
      where: { id },
      data: updateData,
    });

    return classRule;
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.classRule.findFirst({
      where: { id, deletedAt: null },
      include: { course: { select: { userId: true } } },
    });

    if (!existing || existing.course.userId !== userId) {
      throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');
    }

    // 软删除规则
    const classRule = await prisma.classRule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // 软删除关联的未来 Session
    const now = new Date();
    await prisma.classSession.updateMany({
      where: {
        classRuleId: id,
        occurrenceDate: { gte: now },
        deletedAt: null,
      },
      data: { deletedAt: now },
    });

    return classRule;
  },

  async checkConflicts(
    courseId: string,
    input: z.infer<typeof classRuleConflictCheckSchema>,
    userId: string,
  ): Promise<{ hasConflict: boolean; conflicts: ConflictItem[] }> {
    // 校验课程归属
    const course = await prisma.course.findFirst({
      where: { id: courseId, userId, deletedAt: null },
    });
    if (!course) {
      throw new ApiError(404, 'COURSE_NOT_FOUND', 'Course not found');
    }

    function toMinutes(t: string): number {
      const parts = t.split(':').map(Number);
      return parts[0] * 60 + (parts[1] ?? 0);
    }
    const newStartMin = toMinutes(input.startTime);
    const newEndMin = toMinutes(input.endTime);

    function isTimeOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
      return s1 < e2 && s2 < e1;
    }

    // 查询该用户所有课程下的 ClassSession（跨所有课程，未来日期）
    const existingSessions = await prisma.classSession.findMany({
      where: {
        course: { userId, deletedAt: null },
        deletedAt: null,
        occurrenceDate: { gte: input.startDate },
        ...(input.excludeId ? { classRuleId: { not: input.excludeId } } : {}),
      },
      include: {
        classRule: { select: { id: true, room: true } },
      },
    });

    const conflicts: ConflictItem[] = [];
    const inputDates = generateOccurrenceDates(
      input.startDate,
      input.intervalDays ?? undefined,
      input.endDate ?? undefined,
    );
    const inputDateSet = new Set(inputDates.map((d) => d.toISOString().slice(0, 10)));

    for (const session of existingSessions) {
      const sessionDateStr = session.occurrenceDate.toISOString().slice(0, 10);

      if (!inputDateSet.has(sessionDateStr)) continue;

      const sessionStartMin = session.startTime.getHours() * 60 + session.startTime.getMinutes();
      const sessionEndMin = session.endTime.getHours() * 60 + session.endTime.getMinutes();
      if (!isTimeOverlap(newStartMin, newEndMin, sessionStartMin, sessionEndMin)) continue;

      // 资源冲突（同一教师跨所有课程）
      conflicts.push({
        date: sessionDateStr,
        startTime: `${session.startTime.getHours().toString().padStart(2, '0')}:${session.startTime.getMinutes().toString().padStart(2, '0')}`,
        endTime: `${session.endTime.getHours().toString().padStart(2, '0')}:${session.endTime.getMinutes().toString().padStart(2, '0')}`,
        ruleId: session.classRuleId,
        type: 'resource',
        description: '该时间段已有其他课程安排',
      });

      // 如果指定了 room，检测同一 room 冲突
      if (input.room && session.classRule.room === input.room) {
        conflicts.push({
          date: sessionDateStr,
          startTime: `${session.startTime.getHours().toString().padStart(2, '0')}:${session.startTime.getMinutes().toString().padStart(2, '0')}`,
          endTime: `${session.endTime.getHours().toString().padStart(2, '0')}:${session.endTime.getMinutes().toString().padStart(2, '0')}`,
          ruleId: session.classRuleId,
          type: 'room',
          description: `教室 "${input.room}" 在该时间段已被占用`,
        });
      }

      if (conflicts.length >= 20) break;
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  },

  /**
   * 预览规则变更影响
   */
  async previewChanges(id: string, input: z.infer<typeof classRuleUpdateSchema>, userId: string) {
    const existing = await prisma.classRule.findFirst({
      where: { id, deletedAt: null },
      include: { course: { select: { userId: true } } },
    });

    if (!existing || existing.course.userId !== userId) {
      throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');
    }

    // 计算将删除的 Session（当前规则未来尚未发生的）
    const now = new Date();
    const toDelete = await prisma.classSession.count({
      where: {
        classRuleId: id,
        occurrenceDate: { gte: now },
        deletedAt: null,
      },
    });

    // 计算将创建的 Session
    const newStartDate = input.startDate ?? existing.startDate;
    const newEndDate = input.endDate !== undefined ? input.endDate : existing.endDate;
    const newIntervalDays =
      input.intervalDays !== undefined ? input.intervalDays : existing.intervalDays;
    const toCreateDates = generateOccurrenceDates(
      newStartDate,
      newIntervalDays ?? undefined,
      newEndDate ?? undefined,
    );
    const toCreate = toCreateDates.length;

    // 检查冲突
    const conflictInput = {
      excludeId: id,
      courseId: existing.courseId,
      startDate: newStartDate,
      intervalDays: newIntervalDays,
      endDate: newEndDate,
      startTime:
        input.startTime ??
        `${existing.startTime.getHours().toString().padStart(2, '0')}:${existing.startTime.getMinutes().toString().padStart(2, '0')}`,
      endTime:
        input.endTime ??
        `${existing.endTime.getHours().toString().padStart(2, '0')}:${existing.endTime.getMinutes().toString().padStart(2, '0')}`,
      room: input.room ?? existing.room,
    };

    const conflictResult = await this.checkConflicts(
      existing.courseId,
      conflictInput as unknown as z.infer<typeof classRuleConflictCheckSchema>,
      userId,
    );

    return {
      toDelete,
      toCreate,
      hasConflict: conflictResult.hasConflict,
      conflicts: conflictResult.conflicts,
    };
  },

  /**
   * 应用规则变更 — 删除未来 Session 并重新生成
   */
  async applyChanges(id: string, input: z.infer<typeof classRuleUpdateSchema>, userId: string) {
    // 先更新规则
    const updated = await this.update(id, input, userId);

    // 获取更新后的规则完整数据
    const rule = await prisma.classRule.findFirst({
      where: { id, deletedAt: null },
      include: { course: { select: { id: true } } },
    });
    if (!rule) throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');

    // 删除未来 Session
    const now = new Date();
    await prisma.classSession.updateMany({
      where: {
        classRuleId: id,
        occurrenceDate: { gte: now },
        deletedAt: null,
      },
      data: { deletedAt: now },
    });

    // 重新生成未来 Session
    const createPayload = {
      courseId: rule.courseId,
      startDate: rule.startDate,
      intervalDays: rule.intervalDays,
      endDate: rule.endDate,
      startTime: `${rule.startTime.getHours().toString().padStart(2, '0')}:${rule.startTime.getMinutes().toString().padStart(2, '0')}`,
      endTime: `${rule.endTime.getHours().toString().padStart(2, '0')}:${rule.endTime.getMinutes().toString().padStart(2, '0')}`,
      room: rule.room ?? null,
    };

    const sessions = await this._generateSessionsForRule(id, createPayload);

    // 为每个 Session 添加参与者（优先使用传入的 studentIds，否则使用课程已选课学生）
    const studentIds = input.studentIds?.length
      ? input.studentIds
      : (
          await prisma.studentCourse.findMany({
            where: { courseId: rule.courseId, deletedAt: null },
            select: { studentId: true },
          })
        ).map((es) => es.studentId);

    if (studentIds.length > 0 && sessions.length > 0) {
      const participantData = sessions.flatMap((session) =>
        studentIds.map((studentId: string) => ({
          classSessionId: session.id,
          studentId,
        })),
      );
      await prisma.sessionParticipant.createMany({ data: participantData });
    }

    return updated;
  },

  /**
   * 为规则生成未来 SESSION_GENERATION_DAYS 天的 ClassSession 记录
   */
  async _generateSessionsForRule(
    classRuleId: string,
    input: {
      courseId: string;
      startDate: Date;
      intervalDays?: number | null;
      endDate?: Date | null;
      startTime: string;
      endTime: string;
      room?: string | null;
    },
  ) {
    const dates = generateOccurrenceDates(
      input.startDate,
      input.intervalDays ?? undefined,
      input.endDate ?? undefined,
      SESSION_GENERATION_DAYS,
    );

    if (dates.length === 0) return [];

    const startTime = new Date(`1970-01-01T${input.startTime}`);
    const endTime = new Date(`1970-01-01T${input.endTime}`);

    // 批量创建
    await prisma.classSession.createMany({
      data: dates.map((d) => ({
        classRuleId,
        courseId: input.courseId,
        occurrenceDate: d,
        startTime,
        endTime,
        state: 'SCHEDULED',
        room: input.room ?? null,
      })),
    });

    // 返回创建的 sessions
    return prisma.classSession.findMany({
      where: {
        classRuleId,
        deletedAt: null,
        occurrenceDate: { gte: dates[0] },
      },
      orderBy: { occurrenceDate: 'asc' },
      take: dates.length,
    });
  },
};

/** 生成上课日期列表（最多 maxDays 天） */
function generateOccurrenceDates(
  startDate: Date,
  intervalDays?: number,
  endDate?: Date | null,
  maxDays = 365,
): Date[] {
  if (!intervalDays) {
    return [startDate];
  }

  const rruleOptions: Partial<RRuleOptions> = {
    freq: RRule.DAILY,
    interval: intervalDays,
    dtstart: new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())),
  };

  if (endDate) {
    rruleOptions.until = new Date(
      Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
    );
  }

  const rule = new RRule(rruleOptions);
  const maxDate = endDate ?? new Date(startDate.getTime() + maxDays * 24 * 60 * 60 * 1000);
  return rule.between(startDate, maxDate, true);
}
