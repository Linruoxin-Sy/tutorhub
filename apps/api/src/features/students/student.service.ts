import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import { translatePrismaWriteError } from '@/shared/prisma-errors';
import { assertNonEmpty, stripUndefined } from '@/shared/request';
import type { StudentCreateInput, StudentListQuery, StudentUpdateInput } from './student.schema';

const studentSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  userId: true,
  name: true,
  avatarUrl: true,
  email: true,
  phone: true,
  grade: true,
  description: true,
} as const;

const ensureUserExists = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });

  if (!user) {
    throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
  }
};

export const studentService = {
  async list(query: StudentListQuery) {
    const where = {
      ...(query.userId ? { userId: query.userId } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { email: { contains: query.q, mode: 'insensitive' as const } },
              { phone: { contains: query.q, mode: 'insensitive' as const } },
              { grade: { contains: query.q, mode: 'insensitive' as const } },
              { description: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.student.count({ where }),
      prisma.student.findMany({
        where,
        select: studentSelect,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return { data: items, page: query.page, pageSize: query.pageSize, total };
  },

  async getById(id: string) {
    const student = await prisma.student.findUnique({ where: { id }, select: studentSelect });

    if (!student) {
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found');
    }

    return student;
  },

  async create(input: StudentCreateInput) {
    await ensureUserExists(input.userId);

    try {
      return await prisma.student.create({ data: input, select: studentSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'STUDENT');
    }
  },

  async update(id: string, input: StudentUpdateInput) {
    const data = stripUndefined(input);

    assertNonEmpty(data);

    if (data.userId) {
      await ensureUserExists(data.userId);
    }

    try {
      return await prisma.student.update({ where: { id }, data, select: studentSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'STUDENT');
    }
  },

  async delete(id: string) {
    try {
      return await prisma.student.delete({ where: { id }, select: studentSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'STUDENT');
    }
  },
};
