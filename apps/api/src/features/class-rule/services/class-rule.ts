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

    // 软删除规则（关联的 ClassSessionOverride 由 onDelete Cascade 自动处理）
    const classRule = await prisma.classRule.update({
      where: { id },
      data: { deletedAt: new Date() },
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

    // 查询该用户所有课程下的 ClassRule（跨所有课程），用 rrule 生成日期来检测冲突
    const otherRules = await prisma.classRule.findMany({
      where: {
        course: { userId, deletedAt: null },
        deletedAt: null,
        ...(input.excludeId ? { id: { not: input.excludeId } } : {}),
      },
    });

    const inputDates = generateOccurrenceDates(
      input.startDate,
      input.intervalDays ?? undefined,
      input.endDate ?? undefined,
    );
    const inputDateSet = new Set(inputDates.map((d) => d.toISOString().slice(0, 10)));

    // 查询所有相关的 ClassSessionOverride（跨所有课程，找出已调课的记录）
    const overrides = await prisma.classSessionOverride.findMany({
      where: {
        classRule: { course: { userId }, deletedAt: null },
        deletedAt: null,
        state: 'RESCHEDULED',
      },
    });
    const overrideMap = new Map<string, { startTime: string; endTime: string }>();
    for (const ov of overrides) {
      const key = `${ov.classRuleId}_${ov.originalDate.toISOString().slice(0, 10)}`;
      if (ov.rescheduledStartTime && ov.rescheduledEndTime) {
        overrideMap.set(key, {
          startTime: `${ov.rescheduledStartTime.getHours().toString().padStart(2, '0')}:${ov.rescheduledStartTime.getMinutes().toString().padStart(2, '0')}`,
          endTime: `${ov.rescheduledEndTime.getHours().toString().padStart(2, '0')}:${ov.rescheduledEndTime.getMinutes().toString().padStart(2, '0')}`,
        });
      }
    }

    // 已取消的日期集合（这些日期不参与冲突检测）
    const cancelledOverrides = await prisma.classSessionOverride.findMany({
      where: {
        classRule: { course: { userId }, deletedAt: null },
        deletedAt: null,
        state: 'CANCELLED',
      },
    });
    const cancelledSet = new Set(
      cancelledOverrides.map(
        (ov) => `${ov.classRuleId}_${ov.originalDate.toISOString().slice(0, 10)}`,
      ),
    );

    const conflicts: ConflictItem[] = [];

    for (const rule of otherRules) {
      const ruleDates = generateOccurrenceDates(
        rule.startDate,
        rule.intervalDays ?? undefined,
        rule.endDate ?? undefined,
      );

      for (const ruleDate of ruleDates) {
        const dateStr = ruleDate.toISOString().slice(0, 10);
        const ruleKey = `${rule.id}_${dateStr}`;

        // 跳过已取消的 session
        if (cancelledSet.has(ruleKey)) continue;

        // 只检查日期重合的
        if (!inputDateSet.has(dateStr)) continue;

        // 检查该规则该日期是否被调课
        const override = overrideMap.get(ruleKey);
        const ruleStartStr =
          override?.startTime ??
          `${rule.startTime.getHours().toString().padStart(2, '0')}:${rule.startTime.getMinutes().toString().padStart(2, '0')}`;
        const ruleEndStr =
          override?.endTime ??
          `${rule.endTime.getHours().toString().padStart(2, '0')}:${rule.endTime.getMinutes().toString().padStart(2, '0')}`;

        const ruleStartMin = toMinutes(ruleStartStr);
        const ruleEndMin = toMinutes(ruleEndStr);

        if (!isTimeOverlap(newStartMin, newEndMin, ruleStartMin, ruleEndMin)) continue;

        // 资源冲突
        conflicts.push({
          date: dateStr,
          startTime: ruleStartStr,
          endTime: ruleEndStr,
          ruleId: rule.id,
          type: 'resource',
          description: '该时间段已有其他课程安排',
        });

        // 教室冲突
        if (input.room && rule.room === input.room) {
          conflicts.push({
            date: dateStr,
            startTime: ruleStartStr,
            endTime: ruleEndStr,
            ruleId: rule.id,
            type: 'room',
            description: `教室 "${input.room}" 在该时间段已被占用`,
          });
        }

        if (conflicts.length >= 20) break;
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
  async previewChanges(id: string, _input: z.infer<typeof classRuleUpdateSchema>, userId: string) {
    const existing = await prisma.classRule.findFirst({
      where: { id, deletedAt: null },
      include: { course: { select: { userId: true } } },
    });

    if (!existing || existing.course.userId !== userId) {
      throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');
    }

    // 规则更新后不再预生成 Session 到数据库，预览仅返回影响信息
    return {
      toDelete: 0,
      toCreate: 0,
      hasConflict: false,
      conflicts: [],
    };
  },

  /**
   * 应用规则变更 — 更新 ClassRule 本身，不再生成 Session 记录
   */
  async applyChanges(id: string, input: z.infer<typeof classRuleUpdateSchema>, userId: string) {
    const updated = await this.update(id, input, userId);
    return updated;
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
