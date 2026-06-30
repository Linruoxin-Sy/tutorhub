import { z } from 'zod';

import type { Prisma } from '@tutorhub/database';
import type {
  availableCoursesQuerySchema,
  availableStudentsQuerySchema,
  enrollmentCreateSchema,
  enrollmentListQuerySchema,
} from '@tutorhub/schema';

import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import { translatePrismaWriteError } from '@/shared/prisma-errors';

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
      deletedAt: null,
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
      deletedAt: null,
      courseId,
      userId,
      ...(query.name ? { student: { name: { contains: query.name, mode: 'insensitive' } } } : {}),
      ...(query.status ? { student: { status: query.status } } : {}),
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

  async getById(id: string, userId: string) {
    const enrollment = await prisma.studentCourse.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        student: true,
        course: true,
      },
    });

    if (!enrollment) {
      throw new ApiError(404, 'ENROLLMENT_NOT_FOUND', 'Enrollment not found');
    }

    return enrollment;
  },

  async deleteById(id: string, userId: string) {
    // 校验 enrollment 的 userId 匹配当前用户
    const enrollment = await prisma.studentCourse.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!enrollment) {
      throw new ApiError(404, 'ENROLLMENT_NOT_FOUND', 'Enrollment not found');
    }

    try {
      // 软删除：更新 deletedAt 而非真正删除
      const updated = await prisma.studentCourse.update({
        where: { id },
        data: { deletedAt: new Date() },
        include: { student: true, course: true },
      });
      return updated;
    } catch (error) {
      translatePrismaWriteError(error, 'ENROLLMENT');
    }
  },

  async listAvailableCourses(
    studentId: string,
    query: z.infer<typeof availableCoursesQuerySchema>,
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

    // 查出该学生所有已选课程 ID（含软删除，避免重复添加）
    const enrolledCourseIds = (
      await prisma.studentCourse.findMany({
        where: { studentId },
        select: { courseId: true },
      })
    ).map((e) => e.courseId);

    const baseWhere: Prisma.CourseWhereInput = {
      userId,
      deletedAt: null,
      id: enrolledCourseIds.length > 0 ? { notIn: enrolledCourseIds } : undefined,
      ...(query.name ? { name: { contains: query.name, mode: 'insensitive' } } : {}),
      ...(query.status ? { status: query.status } : {}),
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

  async listAvailableStudents(
    courseId: string,
    query: z.infer<typeof availableStudentsQuerySchema>,
    userId: string,
  ) {
    const take = query.limit + 1;

    // 查出该课程所有已选学生 ID（含软删除）
    const enrolledStudentIds = (
      await prisma.studentCourse.findMany({
        where: { courseId },
        select: { studentId: true },
      })
    ).map((e) => e.studentId);

    const baseWhere: Prisma.StudentWhereInput = {
      userId,
      deletedAt: null,
      id: enrolledStudentIds.length > 0 ? { notIn: enrolledStudentIds } : undefined,
      ...(query.name ? { name: { contains: query.name, mode: 'insensitive' } } : {}),
    };

    // offset 分页
    if (query.offset !== undefined) {
      const [dbItems, total] = await Promise.all([
        prisma.student.findMany({
          where: baseWhere,
          orderBy: { createdAt: 'desc' },
          take: query.limit,
          skip: query.offset,
        }),
        prisma.student.count({ where: baseWhere }),
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
      prisma.student.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      }),
      prisma.student.count({ where: baseWhere }),
    ]);

    const hasMore = dbItems.length > query.limit;
    const result = hasMore ? dbItems.slice(0, query.limit) : dbItems;
    const nextCursor = hasMore ? result[result.length - 1].id : null;

    return { items: result, nextCursor, total };
  },

  async create(input: z.infer<typeof enrollmentCreateSchema>, userId: string) {
    // 校验学生归属
    const student = await prisma.student.findFirst({
      where: { id: input.studentId, userId, deletedAt: null },
    });
    if (!student) {
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found');
    }

    // 校验课程存在且属于当前用户
    const course = await prisma.course.findFirst({
      where: { id: input.courseId, userId, deletedAt: null },
    });
    if (!course) {
      throw new ApiError(404, 'COURSE_NOT_FOUND', 'Course not found');
    }

    // 检查是否已存在（含软删除）
    const existing = await prisma.studentCourse.findUnique({
      where: {
        studentId_courseId: {
          studentId: input.studentId,
          courseId: input.courseId,
        },
      },
    });

    if (existing) {
      if (existing.deletedAt) {
        // 恢复软删除的记录
        try {
          const updated = await prisma.studentCourse.update({
            where: { id: existing.id },
            data: { deletedAt: null },
            include: { student: true, course: true },
          });
          return updated;
        } catch (error) {
          translatePrismaWriteError(error, 'ENROLLMENT');
        }
      }
      throw new ApiError(409, 'ALREADY_ENROLLED', 'Student already enrolled in this course');
    }

    try {
      const enrollment = await prisma.studentCourse.create({
        data: {
          studentId: input.studentId,
          courseId: input.courseId,
          userId,
        },
        include: { student: true, course: true },
      });
      return enrollment;
    } catch (error) {
      translatePrismaWriteError(error, 'ENROLLMENT');
    }
  },
};
