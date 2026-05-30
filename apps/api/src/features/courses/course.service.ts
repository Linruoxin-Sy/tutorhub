import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import { translatePrismaWriteError } from '@/shared/prisma-errors';
import { assertNonEmpty, stripUndefined } from '@/shared/request';
import type { CourseCreateInput, CourseListQuery, CourseUpdateInput } from './course.schema';

const courseSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  description: true,
  status: true,
} as const;

export const courseService = {
  async list(query: CourseListQuery) {
    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { description: { contains: query.q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        select: courseSelect,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return { data: items, page: query.page, pageSize: query.pageSize, total };
  },

  async getById(id: string) {
    const course = await prisma.course.findUnique({ where: { id }, select: courseSelect });

    if (!course) {
      throw new ApiError(404, 'COURSE_NOT_FOUND', 'Course not found');
    }

    return course;
  },

  async create(input: CourseCreateInput) {
    try {
      return await prisma.course.create({ data: input, select: courseSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'COURSE');
    }
  },

  async update(id: string, input: CourseUpdateInput) {
    const data = stripUndefined(input);

    assertNonEmpty(data);

    try {
      return await prisma.course.update({ where: { id }, data, select: courseSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'COURSE');
    }
  },

  async delete(id: string) {
    try {
      return await prisma.course.delete({ where: { id }, select: courseSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'COURSE');
    }
  },
};
