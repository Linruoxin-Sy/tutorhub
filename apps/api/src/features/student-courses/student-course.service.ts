import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import { translatePrismaWriteError } from '@/shared/prisma-errors';
import { assertNonEmpty, stripUndefined } from '@/shared/request';
import type {
  StudentCourseCreateInput,
  StudentCourseListQuery,
  StudentCourseUpdateInput,
} from './student-course.schema';

const studentCourseSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  studentId: true,
  courseId: true,
} as const;

const ensureStudentExists = async (studentId: string) => {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true },
  });

  if (!student) {
    throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found');
  }
};

const ensureCourseExists = async (courseId: string) => {
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });

  if (!course) {
    throw new ApiError(404, 'COURSE_NOT_FOUND', 'Course not found');
  }
};

export const studentCourseService = {
  async list(query: StudentCourseListQuery) {
    const where = {
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.studentCourse.count({ where }),
      prisma.studentCourse.findMany({
        where,
        select: studentCourseSelect,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return { data: items, page: query.page, pageSize: query.pageSize, total };
  },

  async getById(id: string) {
    const studentCourse = await prisma.studentCourse.findUnique({
      where: { id },
      select: studentCourseSelect,
    });

    if (!studentCourse) {
      throw new ApiError(404, 'STUDENT_COURSE_NOT_FOUND', 'Student course not found');
    }

    return studentCourse;
  },

  async create(input: StudentCourseCreateInput) {
    await ensureStudentExists(input.studentId);
    await ensureCourseExists(input.courseId);

    try {
      return await prisma.studentCourse.create({ data: input, select: studentCourseSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'STUDENT_COURSE');
    }
  },

  async update(id: string, input: StudentCourseUpdateInput) {
    const data = stripUndefined(input);

    assertNonEmpty(data);

    if (data.studentId) {
      await ensureStudentExists(data.studentId);
    }

    if (data.courseId) {
      await ensureCourseExists(data.courseId);
    }

    try {
      return await prisma.studentCourse.update({
        where: { id },
        data,
        select: studentCourseSelect,
      });
    } catch (error) {
      translatePrismaWriteError(error, 'STUDENT_COURSE');
    }
  },

  async delete(id: string) {
    try {
      return await prisma.studentCourse.delete({ where: { id }, select: studentCourseSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'STUDENT_COURSE');
    }
  },
};
