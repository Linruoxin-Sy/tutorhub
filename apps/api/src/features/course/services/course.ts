import { z } from 'zod';

import type { courseCreateSchema, courseListSchema, courseUpdateSchema } from '@tutorhub/schema';

import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';

export const courseService = {
  async list(query: z.infer<typeof courseListSchema>) {
    const take = query.limit + 1;

    // 基础 where 条件：名称模糊匹配 + 状态筛选
    const baseWhere: NonNullable<Parameters<typeof prisma.course.findMany>[0]>['where'] = {
      ...(query.name ? { name: { contains: query.name, mode: 'insensitive' } } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.studentId ? { studentCourses: { some: { studentId: query.studentId } } } : {}),
    };

    // offset 分页
    if (query.offset !== undefined) {
      const [dbItems, total] = await Promise.all([
        prisma.course.findMany({
          where: baseWhere,
          orderBy: { createdAt: 'desc' },
          take: query.limit,
          skip: query.offset,
        }),
        prisma.course.count({ where: baseWhere }),
      ]);

      const lastItem = dbItems.at(-1);
      const hasMore = query.offset + query.limit < total;

      return {
        items: dbItems,
        nextCursor: hasMore && lastItem ? lastItem.id : null,
        total,
      };
    }

    // cursor 分页
    const [dbItems, total] = await Promise.all([
      prisma.course.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      }),
      prisma.course.count({ where: baseWhere }),
    ]);

    const hasMore = dbItems.length > query.limit;
    const result = hasMore ? dbItems.slice(0, query.limit) : dbItems;
    const nextCursor = hasMore ? result[result.length - 1].id : null;

    return { items: result, nextCursor, total };
  },

  async getById(id: string) {
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new ApiError(404, 'COURSE_NOT_FOUND', 'Course not found');
    }

    return course;
  },

  async create(input: z.infer<typeof courseCreateSchema>) {
    const course = await prisma.course.create({
      data: input,
    });

    return course;
  },

  async update(id: string, input: z.infer<typeof courseUpdateSchema>) {
    // 先检查课程是否存在
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'COURSE_NOT_FOUND', 'Course not found');
    }

    const course = await prisma.course.update({
      where: { id },
      data: input,
    });

    return course;
  },

  async delete(id: string) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'COURSE_NOT_FOUND', 'Course not found');
    }

    const course = await prisma.course.delete({ where: { id } });

    return course;
  },
};
