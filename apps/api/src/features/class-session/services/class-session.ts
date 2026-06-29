import rrulePkg, { type Options as RRuleOptions } from 'rrule';
import { z } from 'zod';

import type { Prisma } from '@tutorhub/database';
import type {
  classSessionOverrideCreateSchema,
  classSessionOverrideListQuerySchema,
  classSessionOverrideUpdateSchema,
} from '@tutorhub/schema';

import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';

const { RRule } = rrulePkg;

export const classSessionOverrideService = {
  async list(query: z.infer<typeof classSessionOverrideListQuerySchema>, userId: string) {
    const take = query.limit;
    const skip = query.offset ?? 0;

    const where: Prisma.ClassSessionOverrideWhereInput = {
      userId,
    };

    if (query.classRuleId) where.classRuleId = query.classRuleId;
    if (query.state) where.state = query.state;

    const [dbItems, total] = await Promise.all([
      prisma.classSessionOverride.findMany({
        where,
        orderBy: { originalDate: 'desc' },
        take,
        skip,
        include: {
          classRule: { select: { startTime: true, endTime: true } },
        },
      }),
      prisma.classSessionOverride.count({ where }),
    ]);

    const lastItem = dbItems.at(-1);
    const hasMore = skip + take < total;

    return {
      items: dbItems,
      nextCursor: hasMore && lastItem ? lastItem.id : null,
      total,
    };
  },

  async getById(id: string, userId: string) {
    const override = await prisma.classSessionOverride.findFirst({
      where: { id, userId },
      include: {
        classRule: {
          select: { startTime: true, endTime: true, intervalDays: true, courseId: true },
        },
      },
    });

    if (!override) {
      throw new ApiError(404, 'OVERRIDE_NOT_FOUND', 'Class session override not found');
    }

    return override;
  },

  async create(input: z.infer<typeof classSessionOverrideCreateSchema>, userId: string) {
    // 校验规则归属
    const classRule = await prisma.classRule.findFirst({
      where: { id: input.classRuleId },
      include: { course: { select: { userId: true } } },
    });
    if (!classRule || classRule.course.userId !== userId) {
      throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');
    }

    const override = await prisma.classSessionOverride.upsert({
      where: {
        classRuleId_originalDate: {
          classRuleId: input.classRuleId,
          originalDate: input.originalDate,
        },
      },
      update: {
        state: input.state,
        rescheduledDate: input.rescheduledDate ?? null,
        rescheduledStartTime: input.rescheduledStartTime
          ? new Date(`1970-01-01T${input.rescheduledStartTime}`)
          : null,
        rescheduledEndTime: input.rescheduledEndTime
          ? new Date(`1970-01-01T${input.rescheduledEndTime}`)
          : null,
        priceOverride: input.priceOverride ?? null,
        reason: input.reason ?? null,
      },
      create: {
        classRuleId: input.classRuleId,
        userId,
        originalDate: input.originalDate,
        state: input.state,
        rescheduledDate: input.rescheduledDate ?? null,
        rescheduledStartTime: input.rescheduledStartTime
          ? new Date(`1970-01-01T${input.rescheduledStartTime}`)
          : null,
        rescheduledEndTime: input.rescheduledEndTime
          ? new Date(`1970-01-01T${input.rescheduledEndTime}`)
          : null,
        priceOverride: input.priceOverride ?? null,
        reason: input.reason ?? null,
      },
    });

    return override;
  },

  async update(
    id: string,
    input: z.infer<typeof classSessionOverrideUpdateSchema>,
    userId: string,
  ) {
    const existing = await prisma.classSessionOverride.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new ApiError(404, 'OVERRIDE_NOT_FOUND', 'Class session override not found');
    }

    const updateData: Record<string, unknown> = {};
    if (input.state !== undefined) updateData.state = input.state;
    if (input.rescheduledDate !== undefined) updateData.rescheduledDate = input.rescheduledDate;
    if (input.rescheduledStartTime !== undefined)
      updateData.rescheduledStartTime = input.rescheduledStartTime
        ? new Date(`1970-01-01T${input.rescheduledStartTime}`)
        : null;
    if (input.rescheduledEndTime !== undefined)
      updateData.rescheduledEndTime = input.rescheduledEndTime
        ? new Date(`1970-01-01T${input.rescheduledEndTime}`)
        : null;
    if (input.priceOverride !== undefined) updateData.priceOverride = input.priceOverride;
    if (input.reason !== undefined) updateData.reason = input.reason;

    const override = await prisma.classSessionOverride.update({
      where: { id },
      data: updateData,
    });

    return override;
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.classSessionOverride.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new ApiError(404, 'OVERRIDE_NOT_FOUND', 'Class session override not found');
    }

    const override = await prisma.classSessionOverride.delete({
      where: { id },
    });

    return override;
  },

  async checkConflicts(
    classRuleId: string,
    originalDate: Date,
    newStartTime: string,
    newEndTime: string,
    userId: string,
  ): Promise<{ hasConflict: boolean; conflicts: import('@tutorhub/schema').ConflictItem[] }> {
    function toMinutes(t: string): number {
      const parts = t.split(':').map(Number);
      return parts[0] * 60 + (parts[1] ?? 0);
    }
    const newStartMin = toMinutes(newStartTime);
    const newEndMin = toMinutes(newEndTime);

    function isTimeOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
      return s1 < e2 && s2 < e1;
    }

    const dateStr = originalDate.toISOString().slice(0, 10);

    // 先查询该用户所有课程下的 ClassRule
    const rules = await prisma.classRule.findMany({
      where: { userId },
      include: { course: { select: { name: true } } },
    });

    const allRuleIds = rules.map((r) => r.id);

    // 查询所有相关的 ClassSessionOverride（跨所有课程，找出已调课的记录）
    const overrides = await prisma.classSessionOverride.findMany({
      where: {
        classRuleId: { in: allRuleIds },
        state: 'RESCHEDULED',
      },
    });

    // 按 (classRuleId_date) 构建调课时间映射
    const rescheduledMap = new Map<
      string,
      { startTime: string; endTime: string; courseName: string }
    >();
    for (const ov of overrides) {
      const key = `${ov.classRuleId}_${ov.originalDate.toISOString().slice(0, 10)}`;
      if (ov.rescheduledStartTime && ov.rescheduledEndTime) {
        rescheduledMap.set(key, {
          startTime: `${ov.rescheduledStartTime.getHours().toString().padStart(2, '0')}:${ov.rescheduledStartTime.getMinutes().toString().padStart(2, '0')}`,
          endTime: `${ov.rescheduledEndTime.getHours().toString().padStart(2, '0')}:${ov.rescheduledEndTime.getMinutes().toString().padStart(2, '0')}`,
          courseName: '',
        });
      }
    }

    // 已取消的日期集合
    const cancelledOverrides = await prisma.classSessionOverride.findMany({
      where: {
        classRuleId: { in: allRuleIds },
        state: 'CANCELLED',
      },
    });
    const cancelledSet = new Set(
      cancelledOverrides.map(
        (ov) => `${ov.classRuleId}_${ov.originalDate.toISOString().slice(0, 10)}`,
      ),
    );

    // 预取学生名称
    const courseIds = [...new Set(rules.map((r) => r.courseId))];
    const enrollments = await prisma.studentCourse.findMany({
      where: { courseId: { in: courseIds }, deletedAt: null },
      include: { student: { select: { name: true } } },
    });
    const courseStudentMap = new Map<string, string[]>();
    for (const enrollment of enrollments) {
      const names = courseStudentMap.get(enrollment.courseId) ?? [];
      names.push(enrollment.student.name);
      courseStudentMap.set(enrollment.courseId, names);
    }

    const conflicts: import('@tutorhub/schema').ConflictItem[] = [];

    for (const rule of rules) {
      // 跳过当天已取消的 session
      const ruleKey = `${rule.id}_${dateStr}`;
      if (cancelledSet.has(ruleKey)) continue;

      // 跳过正在被覆盖的 session（避免自己与自己冲突）
      if (rule.id === classRuleId) continue;

      // 检查该规则当天是否有课
      if (rule.intervalDays === null) {
        // 单次上课：只检查日期是否匹配 startDate
        const ruleStartStr = rule.startDate.toISOString().slice(0, 10);
        if (dateStr !== ruleStartStr) continue;
      } else {
        // 循环上课：用 rrule 判断
        const rruleOptions: Partial<RRuleOptions> = {
          freq: RRule.DAILY,
          interval: rule.intervalDays,
          dtstart: new Date(
            Date.UTC(
              rule.startDate.getFullYear(),
              rule.startDate.getMonth(),
              rule.startDate.getDate(),
            ),
          ),
        };
        if (rule.endDate) {
          rruleOptions.until = new Date(
            Date.UTC(rule.endDate.getFullYear(), rule.endDate.getMonth(), rule.endDate.getDate()),
          );
        }
        const rrule = new RRule(rruleOptions);
        const ruleDates = rrule.between(originalDate, originalDate, true);
        if (ruleDates.length === 0) continue;
      }

      // 检查该规则该日期是否被调课
      const override = rescheduledMap.get(ruleKey);
      const ruleStartStr =
        override?.startTime ??
        `${rule.startTime.getHours().toString().padStart(2, '0')}:${rule.startTime.getMinutes().toString().padStart(2, '0')}`;
      const ruleEndStr =
        override?.endTime ??
        `${rule.endTime.getHours().toString().padStart(2, '0')}:${rule.endTime.getMinutes().toString().padStart(2, '0')}`;

      const ruleStartMin = toMinutes(ruleStartStr);
      const ruleEndMin = toMinutes(ruleEndStr);

      if (!isTimeOverlap(newStartMin, newEndMin, ruleStartMin, ruleEndMin)) continue;

      const courseName =
        (('course' in rule
          ? ((rule as Record<string, unknown>).course as Record<string, unknown>)
          : undefined
        )?.name as string) ?? 'Unknown';
      const studentNames = courseStudentMap.get(rule.courseId) ?? [];

      conflicts.push({
        date: dateStr,
        startTime: ruleStartStr,
        endTime: ruleEndStr,
        ruleId: rule.id,
        courseName,
        studentNames,
        type: 'resource',
        description: 'This time slot is already occupied by another session',
      });
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  },
};
