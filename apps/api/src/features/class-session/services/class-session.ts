import { z } from 'zod';

import type { Prisma } from '@tutorhub/database';
import type {
  classSessionOverrideCreateSchema,
  classSessionOverrideListQuerySchema,
  classSessionOverrideUpdateSchema,
} from '@tutorhub/schema';

import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';

export const classSessionOverrideService = {
  async list(query: z.infer<typeof classSessionOverrideListQuerySchema>, userId: string) {
    const take = query.limit;
    const skip = query.offset ?? 0;

    const where: Prisma.ClassSessionOverrideWhereInput = {
      deletedAt: null,
      classRule: { course: { userId } },
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
      where: { id, deletedAt: null },
      include: {
        classRule: {
          select: { startTime: true, endTime: true, intervalDays: true, courseId: true },
        },
      },
    });

    if (!override) {
      throw new ApiError(404, 'OVERRIDE_NOT_FOUND', 'Class session override not found');
    }

    // 校验归属
    const course = await prisma.course.findFirst({
      where: { id: override.classRule.courseId, userId, deletedAt: null },
    });
    if (!course) {
      throw new ApiError(404, 'OVERRIDE_NOT_FOUND', 'Class session override not found');
    }

    return override;
  },

  async create(input: z.infer<typeof classSessionOverrideCreateSchema>, userId: string) {
    // 校验规则归属
    const classRule = await prisma.classRule.findFirst({
      where: { id: input.classRuleId, deletedAt: null },
      include: { course: { select: { userId: true } } },
    });
    if (!classRule || classRule.course.userId !== userId) {
      throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');
    }

    const override = await prisma.classSessionOverride.create({
      data: {
        classRuleId: input.classRuleId,
        originalDate: input.originalDate,
        state: input.state,
        rescheduledDate: input.rescheduledDate ?? null,
        rescheduledStartTime: input.rescheduledStartTime ?? null,
        rescheduledEndTime: input.rescheduledEndTime ?? null,
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
      where: { id, deletedAt: null },
      include: { classRule: { include: { course: { select: { userId: true } } } } },
    });

    if (!existing || existing.classRule.course.userId !== userId) {
      throw new ApiError(404, 'OVERRIDE_NOT_FOUND', 'Class session override not found');
    }

    const override = await prisma.classSessionOverride.update({
      where: { id },
      data: input,
    });

    return override;
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.classSessionOverride.findFirst({
      where: { id, deletedAt: null },
      include: { classRule: { include: { course: { select: { userId: true } } } } },
    });

    if (!existing || existing.classRule.course.userId !== userId) {
      throw new ApiError(404, 'OVERRIDE_NOT_FOUND', 'Class session override not found');
    }

    const override = await prisma.classSessionOverride.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return override;
  },
};
