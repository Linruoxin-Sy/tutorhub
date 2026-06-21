import rrulePkg, { type Options as RRuleOptions } from 'rrule';
import { z } from 'zod';

import type { ClassRule } from '@tutorhub/database';
import type {
  classRuleConflictCheckSchema,
  classRuleCreateSchema,
  ClassRuleListItem,
  classRuleListQuerySchema,
  classRuleUpdateSchema,
  ConflictItem,
} from '@tutorhub/schema';

import { ApiError } from '@/shared/api-error';
import { getEnv } from '@/shared/getEnv';
import { prisma } from '@/shared/prisma';

const { RRule } = rrulePkg;

const AVATAR_BASE_URL = getEnv('AVATAR_BASE_URL', 'http://localhost:9000/tutorhub');

function addAvatarUrlToStudent(
  item: ClassRule & {
    studentCourse: {
      student: { avatarKey: string | null };
      course: unknown;
    };
  },
): ClassRuleListItem {
  const { avatarKey, ...rest } = item.studentCourse.student;
  return {
    ...item,
    studentCourse: {
      ...item.studentCourse,
      student: {
        ...rest,
        avatarUrl: avatarKey ? `${AVATAR_BASE_URL}/${avatarKey}` : null,
      },
    },
  } as ClassRuleListItem;
}

export const classRuleService = {
  async list(
    studentCourseId: string,
    query: Omit<z.infer<typeof classRuleListQuerySchema>, 'studentCourseId'>,
    userId: string,
  ) {
    // 校验选课关系归属
    const enrollment = await prisma.studentCourse.findFirst({
      where: { id: studentCourseId, deletedAt: null },
      include: { student: { select: { userId: true } } },
    });

    if (!enrollment || enrollment.student.userId !== userId) {
      throw new ApiError(404, 'ENROLLMENT_NOT_FOUND', 'Enrollment not found');
    }

    const take = query.limit;
    const skip = query.offset ?? 0;

    const baseWhere = {
      studentCourseId,
      deletedAt: null,
    };

    const [dbItems, total] = await Promise.all([
      prisma.classRule.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          studentCourse: {
            include: {
              student: true,
              course: true,
            },
          },
        },
      }),
      prisma.classRule.count({ where: baseWhere }),
    ]);

    const items = dbItems.map(addAvatarUrlToStudent);

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
        studentCourse: {
          include: {
            student: { select: { userId: true, name: true, avatarKey: true } },
            course: { select: { name: true } },
          },
        },
      },
    });

    if (!classRule || classRule.studentCourse.student.userId !== userId) {
      throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');
    }

    // 转换 avatarUrl
    const { avatarKey, ...studentRest } = classRule.studentCourse.student;
    return {
      ...classRule,
      studentCourse: {
        ...classRule.studentCourse,
        student: {
          ...studentRest,
          avatarUrl: avatarKey ? `${AVATAR_BASE_URL}/${avatarKey}` : null,
        },
      },
    };
  },

  async create(input: z.infer<typeof classRuleCreateSchema>, userId: string) {
    // 校验选课关系归属
    const enrollment = await prisma.studentCourse.findFirst({
      where: { id: input.studentCourseId, deletedAt: null },
      include: { student: { select: { userId: true } } },
    });

    if (!enrollment || enrollment.student.userId !== userId) {
      throw new ApiError(404, 'ENROLLMENT_NOT_FOUND', 'Enrollment not found');
    }

    const classRule = await prisma.classRule.create({
      data: input,
    });

    return classRule;
  },

  async update(id: string, input: z.infer<typeof classRuleUpdateSchema>, userId: string) {
    // 校验存在和归属
    const existing = await prisma.classRule.findFirst({
      where: { id, deletedAt: null },
      include: {
        studentCourse: {
          include: {
            student: { select: { userId: true } },
          },
        },
      },
    });

    if (!existing || existing.studentCourse.student.userId !== userId) {
      throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');
    }

    const classRule = await prisma.classRule.update({
      where: { id },
      data: input,
    });

    return classRule;
  },

  async delete(id: string, userId: string) {
    // 校验存在和归属
    const existing = await prisma.classRule.findFirst({
      where: { id, deletedAt: null },
      include: {
        studentCourse: {
          include: {
            student: { select: { userId: true } },
          },
        },
      },
    });

    if (!existing || existing.studentCourse.student.userId !== userId) {
      throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');
    }

    // 软删除
    const classRule = await prisma.classRule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return classRule;
  },

  async checkConflicts(
    studentCourseId: string,
    input: z.infer<typeof classRuleConflictCheckSchema>,
    userId: string,
  ): Promise<{ hasConflict: boolean; conflicts: ConflictItem[] }> {
    // 校验选课关系归属
    const enrollment = await prisma.studentCourse.findFirst({
      where: { id: studentCourseId, deletedAt: null },
      include: { student: { select: { userId: true } } },
    });
    if (!enrollment || enrollment.student.userId !== userId) {
      throw new ApiError(404, 'ENROLLMENT_NOT_FOUND', 'Enrollment not found');
    }

    // 将时间段转为分钟数以便比较
    function toMinutes(t: string): number {
      const parts = t.split(':').map(Number);
      return parts[0] * 60 + (parts[1] ?? 0);
    }
    const newStartMin = toMinutes(input.startTime);
    const newEndMin = toMinutes(input.endTime);

    // 时间是否重叠
    function isTimeOverlap(s1: number, e1: number, s2: number, e2: number): boolean {
      return s1 < e2 && s2 < e1;
    }

    // 查询同一选课关系下可能冲突的规则
    const existingRules = await prisma.classRule.findMany({
      where: {
        studentCourseId,
        deletedAt: null,
        id: input.excludeId ? { not: input.excludeId } : undefined,
      },
    });

    const conflicts: ConflictItem[] = [];

    for (const rule of existingRules) {
      const ruleStartMin = toMinutes(
        `${rule.startTime.getHours().toString().padStart(2, '0')}:${rule.startTime.getMinutes().toString().padStart(2, '0')}`,
      );
      const ruleEndMin = toMinutes(
        `${rule.endTime.getHours().toString().padStart(2, '0')}:${rule.endTime.getMinutes().toString().padStart(2, '0')}`,
      );

      if (!isTimeOverlap(newStartMin, newEndMin, ruleStartMin, ruleEndMin)) {
        continue;
      }

      // 时间有重叠 → 检查日期是否重叠
      const ruleDates = generateOccurrenceDates(
        rule.startDate,
        rule.intervalDays ?? undefined,
        rule.endDate ?? undefined,
      );
      const inputDates = generateOccurrenceDates(
        input.startDate,
        input.intervalDays ?? undefined,
        input.endDate ?? undefined,
      );

      const inputDateSet = new Set(inputDates.map((d) => d.toISOString().slice(0, 10)));
      for (const rd of ruleDates) {
        const dateStr = rd.toISOString().slice(0, 10);
        if (inputDateSet.has(dateStr)) {
          conflicts.push({
            date: dateStr,
            startTime: `${rule.startTime.getHours().toString().padStart(2, '0')}:${rule.startTime.getMinutes().toString().padStart(2, '0')}`,
            endTime: `${rule.endTime.getHours().toString().padStart(2, '0')}:${rule.endTime.getMinutes().toString().padStart(2, '0')}`,
            ruleId: rule.id,
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

  async getOverrides(classRuleId: string, userId: string) {
    // 校验规则存在和归属
    const classRule = await prisma.classRule.findFirst({
      where: { id: classRuleId, deletedAt: null },
      include: {
        studentCourse: {
          include: {
            student: { select: { userId: true } },
          },
        },
      },
    });

    if (!classRule || classRule.studentCourse.student.userId !== userId) {
      throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');
    }

    const overrides = await prisma.classSessionOverride.findMany({
      where: { classRuleId, deletedAt: null },
      orderBy: { occurrenceDate: 'asc' },
    });

    return overrides;
  },
};

/** 生成上课日期列表（最多 365 条） */
function generateOccurrenceDates(
  startDate: Date,
  intervalDays?: number,
  endDate?: Date | null,
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
  return rule.between(
    startDate,
    endDate ?? new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000),
    true,
  );
}
