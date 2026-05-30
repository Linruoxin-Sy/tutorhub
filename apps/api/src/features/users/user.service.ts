import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import { translatePrismaWriteError } from '@/shared/prisma-errors';
import { assertNonEmpty, stripUndefined } from '@/shared/request';
import type { UserCreateInput, UserListQuery, UserUpdateInput } from './user.schema';

const userSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
} as const;

export const userService = {
  async list(query: UserListQuery) {
    const where = query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: 'insensitive' as const } },
            { email: { contains: query.q, mode: 'insensitive' as const } },
            { phone: { contains: query.q, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [total, items] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: userSelect,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return {
      data: items,
      page: query.page,
      pageSize: query.pageSize,
      total,
    };
  },

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return user;
  },

  async create(input: UserCreateInput) {
    try {
      const user = await prisma.user.create({
        data: input,
        select: userSelect,
      });

      return user;
    } catch (error) {
      translatePrismaWriteError(error, 'USER');
    }
  },

  async update(id: string, input: UserUpdateInput) {
    const data = stripUndefined(input);

    assertNonEmpty(data);

    try {
      const user = await prisma.user.update({
        where: { id },
        data,
        select: userSelect,
      });

      return user;
    } catch (error) {
      translatePrismaWriteError(error, 'USER');
    }
  },

  async delete(id: string) {
    try {
      const user = await prisma.user.delete({
        where: { id },
        select: userSelect,
      });

      return user;
    } catch (error) {
      translatePrismaWriteError(error, 'USER');
    }
  },
};
