import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import type { studentCreateSchema, studentListSchema, studentUpdateSchema } from '@tutorhub/schema';
import { z } from 'zod';
import { getEnv } from '@/shared/getEnv';

const AVATAR_BASE_URL = getEnv('AVATAR_BASE_URL', 'http://localhost:9000/tutorhub');

function addAvatarUrl<T extends { avatarKey: string | null }>(item: T) {
  return {
    ...item,
    avatarUrl: item.avatarKey ? `${AVATAR_BASE_URL}/${item.avatarKey}` : null,
  };
}

function addAvatarUrlToList<T extends { avatarKey: string | null }>(items: T[]) {
  return items.map(addAvatarUrl);
}

export const studentService = {
  async list(query: z.infer<typeof studentListSchema>, userId: string) {
    const take = query.limit + 1;

    // offset 分页 — 直接跳过前 N 条
    if (query.offset !== undefined) {
      const [dbItems, total] = await Promise.all([
        prisma.student.findMany({
          where: { userId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: query.limit,
          skip: query.offset,
        }),
        prisma.student.count({ where: { userId, deletedAt: null } }),
      ]);

      const items = addAvatarUrlToList(dbItems);
      const lastItem = items.at(-1);
      const hasMore = query.offset + query.limit < total;

      return {
        items,
        nextCursor: hasMore && lastItem ? lastItem.id : null,
        total,
      };
    }

    // cursor 分页
    const [dbItems, total] = await Promise.all([
      prisma.student.findMany({
        where: { userId, deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      }),
      prisma.student.count({ where: { userId, deletedAt: null } }),
    ]);

    const hasMore = dbItems.length > query.limit;
    const result = hasMore ? dbItems.slice(0, query.limit) : dbItems;
    const items = addAvatarUrlToList(result);
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, total };
  },

  async getById(id: string, userId: string) {
    const student = await prisma.student.findFirst({ where: { id, userId, deletedAt: null } });

    if (!student) {
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found');
    }

    return addAvatarUrl(student);
  },

  async create(input: z.infer<typeof studentCreateSchema>, userId: string) {
    const { avatarKey, ...rest } = input;

    const data: Record<string, unknown> = { ...rest, userId };
    if (avatarKey) {
      data.avatarKey = avatarKey;
    }

    const student = await prisma.student.create({
      data: data as Parameters<typeof prisma.student.create>[0]['data'],
    });

    return addAvatarUrl(student);
  },

  async update(id: string, input: z.infer<typeof studentUpdateSchema>, userId: string) {
    const { avatarKey, ...rest } = input;

    const data: Record<string, unknown> = { ...rest };
    if (avatarKey) {
      data.avatarKey = avatarKey;
    }

    const student = await prisma.student.update({
      where: { id, userId },
      data: data as Parameters<typeof prisma.student.update>[0]['data'],
    });

    return addAvatarUrl(student);
  },

  async delete(id: string, userId: string) {
    const student = await prisma.student.update({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });

    return addAvatarUrl(student);
  },
};
