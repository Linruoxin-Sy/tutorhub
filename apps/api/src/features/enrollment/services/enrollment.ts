import { z } from 'zod';

import type { enrollmentListQuerySchema } from '@tutorhub/schema';

import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';

export const enrollmentService = {
  async listByStudent(
    studentId: string,
    query: z.infer<typeof enrollmentListQuerySchema>,
    userId: string,
  ) {
    // 校验学生归属
    const student = await prisma.student.findFirst({
      where: { id: studentId, userId, deletedAt: null },
    });

    if (!student) {
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found');
    }

    const take = query.limit + 1;

    const baseWhere: NonNullable<Parameters<typeof prisma.studentCourse.findMany>[0]>['where'] = {
      studentId,
      ...(query.name ? { course: { name: { contains: query.name, mode: 'insensitive' } } } : {}),
      ...(query.status ? { course: { status: query.status } } : {}),
    };

    // offset 分页
    if (query.offset !== undefined) {
      const [dbItems, total] = await Promise.all([
        prisma.studentCourse.findMany({
          where: baseWhere,
          include: { course: true },
          orderBy: { createdAt: 'desc' },
          take: query.limit,
          skip: query.offset,
        }),
        prisma.studentCourse.count({ where: baseWhere }),
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
      prisma.studentCourse.findMany({
        where: baseWhere,
        include: { course: true },
        orderBy: { createdAt: 'desc' },
        take,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      }),
      prisma.studentCourse.count({ where: baseWhere }),
    ]);

    const hasMore = dbItems.length > query.limit;
    const result = hasMore ? dbItems.slice(0, query.limit) : dbItems;
    const nextCursor = hasMore ? result[result.length - 1].id : null;

    return { items: result, nextCursor, total };
  },

  async listByCourse(
    courseId: string,
    query: z.infer<typeof enrollmentListQuerySchema>,
    userId: string,
  ) {
    const take = query.limit + 1;

    // 只返回当前用户的学生的 enrollment
    const baseWhere: NonNullable<Parameters<typeof prisma.studentCourse.findMany>[0]>['where'] = {
      courseId,
      student: {
        userId,
        deletedAt: null,
        ...(query.name ? { name: { contains: query.name, mode: 'insensitive' } } : {}),
      },
    };

    // offset 分页
    if (query.offset !== undefined) {
      const [dbItems, total] = await Promise.all([
        prisma.studentCourse.findMany({
          where: baseWhere,
          include: { student: true },
          orderBy: { createdAt: 'desc' },
          take: query.limit,
          skip: query.offset,
        }),
        prisma.studentCourse.count({ where: baseWhere }),
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
      prisma.studentCourse.findMany({
        where: baseWhere,
        include: { student: true },
        orderBy: { createdAt: 'desc' },
        take,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      }),
      prisma.studentCourse.count({ where: baseWhere }),
    ]);

    const hasMore = dbItems.length > query.limit;
    const result = hasMore ? dbItems.slice(0, query.limit) : dbItems;
    const nextCursor = hasMore ? result[result.length - 1].id : null;

    return { items: result, nextCursor, total };
  },
};
