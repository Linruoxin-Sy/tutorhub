import { z } from 'zod';

import type {
  classRuleCreateSchema,
  classRuleListQuerySchema,
  classRuleUpdateSchema,
} from '@tutorhub/schema';

import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';

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
      }),
      prisma.classRule.count({ where: baseWhere }),
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
    const classRule = await prisma.classRule.findFirst({
      where: { id, deletedAt: null },
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

    return classRule;
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
};
