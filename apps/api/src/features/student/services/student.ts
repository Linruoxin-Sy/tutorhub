import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import type { studentCreateSchema, studentListSchema, studentUpdateSchema } from '@tutorhub/schema';
import { z } from 'zod';

export const studentService = {
  async list(query: z.infer<typeof studentListSchema>) {
    const take = query.limit + 1;

    const items = await prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    });

    const hasMore = items.length > query.limit;
    const result = hasMore ? items.slice(0, query.limit) : items;
    const nextCursor = hasMore ? result[result.length - 1].id : null;

    return { items: result, nextCursor, hasMore };
  },

  async getById(id: string) {
    const student = await prisma.student.findUnique({ where: { id } });

    if (!student) {
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found');
    }

    return student;
  },

  async create(input: z.infer<typeof studentCreateSchema>, userId: string) {
    return await prisma.student.create({ data: { ...input, userId } });
  },

  async update(id: string, input: z.infer<typeof studentUpdateSchema>) {
    return await prisma.student.update({ where: { id }, data: input });
  },

  async delete(id: string) {
    return await prisma.student.delete({ where: { id } });
  },
};
