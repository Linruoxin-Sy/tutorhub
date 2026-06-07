import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import type { studentCreateSchema, studentListSchema, studentUpdateSchema } from '@tutorhub/schema';
import { z } from 'zod';

export const studentService = {
  async list(query: z.infer<typeof studentListSchema>, userId: string) {
    const take = query.limit + 1;

    // offset 分页 — 直接跳过前 N 条
    if (query.offset !== undefined) {
      const [items, total] = await Promise.all([
        prisma.student.findMany({
          where: { userId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: query.limit,
          skip: query.offset,
        }),
        prisma.student.count({ where: { userId, deletedAt: null } }),
      ]);

      const lastItem = items.at(-1);
      const hasMore = query.offset + query.limit < total;

      return {
        items,
        nextCursor: hasMore && lastItem ? lastItem.id : null,
        total,
      };
    }

    // cursor 分页
    const [items, total] = await Promise.all([
      prisma.student.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      }),
      prisma.student.count({ where: { userId, deletedAt: null } }),
    ]);

    const hasMore = items.length > query.limit;
    const result = hasMore ? items.slice(0, query.limit) : items;
    const nextCursor = hasMore ? result[result.length - 1].id : null;

    return { items: result, nextCursor, total };
  },

  async getById(id: string, userId: string) {
    const student = await prisma.student.findFirst({ where: { id, userId, deletedAt: null } });

    if (!student) {
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found');
    }

    return student;
  },

  async create(input: z.infer<typeof studentCreateSchema>, userId: string) {
    return await prisma.student.create({ data: { ...input, userId } });
  },

  async update(id: string, input: z.infer<typeof studentUpdateSchema>, userId: string) {
    return await prisma.student.update({ where: { id, userId }, data: input });
  },

  async delete(id: string, userId: string) {
    return await prisma.student.update({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });
  },
};
