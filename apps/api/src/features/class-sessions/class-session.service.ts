import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import { translatePrismaWriteError } from '@/shared/prisma-errors';
import { assertNonEmpty, stripUndefined } from '@/shared/request';
import type {
  ClassSessionCreateInput,
  ClassSessionListQuery,
  ClassSessionUpdateInput,
} from './class-session.schema';

const classSessionSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  studentCourseId: true,
  classDate: true,
  startTime: true,
  endTime: true,
} as const;

const ensureStudentCourseExists = async (studentCourseId: string) => {
  const studentCourse = await prisma.studentCourse.findUnique({
    where: { id: studentCourseId },
    select: { id: true },
  });

  if (!studentCourse) {
    throw new ApiError(404, 'STUDENT_COURSE_NOT_FOUND', 'Student course not found');
  }
};

export const classSessionService = {
  async list(query: ClassSessionListQuery) {
    const where = {
      ...(query.studentCourseId ? { studentCourseId: query.studentCourseId } : {}),
      ...(query.classDate ? { classDate: query.classDate } : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.classSession.count({ where }),
      prisma.classSession.findMany({
        where,
        select: classSessionSelect,
        orderBy: [{ classDate: 'desc' }, { startTime: 'desc' }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return { data: items, page: query.page, pageSize: query.pageSize, total };
  },

  async getById(id: string) {
    const classSession = await prisma.classSession.findUnique({
      where: { id },
      select: classSessionSelect,
    });

    if (!classSession) {
      throw new ApiError(404, 'CLASS_SESSION_NOT_FOUND', 'Class session not found');
    }

    return classSession;
  },

  async create(input: ClassSessionCreateInput) {
    await ensureStudentCourseExists(input.studentCourseId);

    try {
      return await prisma.classSession.create({ data: input, select: classSessionSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'CLASS_SESSION');
    }
  },

  async update(id: string, input: ClassSessionUpdateInput) {
    const data = stripUndefined(input);

    assertNonEmpty(data);

    if (data.studentCourseId) {
      await ensureStudentCourseExists(data.studentCourseId);
    }

    try {
      return await prisma.classSession.update({ where: { id }, data, select: classSessionSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'CLASS_SESSION');
    }
  },

  async delete(id: string) {
    try {
      return await prisma.classSession.delete({ where: { id }, select: classSessionSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'CLASS_SESSION');
    }
  },
};
