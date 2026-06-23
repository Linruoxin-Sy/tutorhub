import { z } from 'zod';

import type { Prisma } from '@tutorhub/database';
import type {
  classSessionCreateSchema,
  classSessionListQuerySchema,
  classSessionUpdateSchema,
} from '@tutorhub/schema';

import { ApiError } from '@/shared/api-error';
import { getEnv } from '@/shared/getEnv';
import { prisma } from '@/shared/prisma';

const AVATAR_BASE_URL = getEnv('AVATAR_BASE_URL', 'http://localhost:9000/tutorhub');

export const classSessionService = {
  async list(query: z.infer<typeof classSessionListQuerySchema>, userId: string) {
    const take = query.limit;
    const skip = query.offset ?? 0;

    const where: Prisma.ClassSessionWhereInput = {
      deletedAt: null,
      course: { userId },
    };

    if (query.courseId) where.courseId = query.courseId;
    if (query.classRuleId) where.classRuleId = query.classRuleId;
    if (query.state) where.state = query.state;
    if (query.dateFrom || query.dateTo) {
      where.occurrenceDate = {};
      if (query.dateFrom)
        (where.occurrenceDate as Record<string, unknown>).gte = new Date(query.dateFrom);
      if (query.dateTo)
        (where.occurrenceDate as Record<string, unknown>).lte = new Date(query.dateTo);
    }

    const [dbItems, total] = await Promise.all([
      prisma.classSession.findMany({
        where,
        orderBy: { occurrenceDate: 'desc' },
        take,
        skip,
        include: {
          classRule: { select: { startTime: true, endTime: true, room: true } },
          course: { select: { name: true, userId: true } },
        },
      }),
      prisma.classSession.count({ where }),
    ]);

    const lastItem = dbItems.at(-1);
    const hasMore = skip + take < total;

    return {
      items: dbItems,
      nextCursor: hasMore && lastItem ? lastItem.id : null,
      total,
    };
  },

  async getById(id: string, userId: string) {
    const session = await prisma.classSession.findFirst({
      where: { id, deletedAt: null },
      include: {
        classRule: { select: { startTime: true, endTime: true, intervalDays: true, room: true } },
        course: { select: { id: true, name: true, userId: true } },
        participants: {
          where: { deletedAt: null },
          include: {
            student: {
              select: { id: true, name: true, avatarKey: true },
            },
          },
        },
      },
    });

    if (!session || session.course.userId !== userId) {
      throw new ApiError(404, 'SESSION_NOT_FOUND', 'Class session not found');
    }

    // 转换 avatarUrl
    return {
      ...session,
      participants: session.participants.map((p) => ({
        ...p,
        student: {
          ...p.student,
          avatarUrl: p.student.avatarKey ? `${AVATAR_BASE_URL}/${p.student.avatarKey}` : null,
        },
      })),
    };
  },

  async create(input: z.infer<typeof classSessionCreateSchema>, userId: string) {
    // 校验课程归属
    const course = await prisma.course.findFirst({
      where: { id: input.courseId, userId, deletedAt: null },
    });
    if (!course) {
      throw new ApiError(404, 'COURSE_NOT_FOUND', 'Course not found');
    }

    const { participantStudentIds, ...sessionData } = input;

    const session = await prisma.classSession.create({
      data: {
        ...sessionData,
        // 如果有参与者，一起创建
        ...(participantStudentIds && participantStudentIds.length > 0
          ? {
              participants: {
                create: participantStudentIds.map((studentId: string) => ({
                  student: { connect: { id: studentId } },
                })),
              },
            }
          : {}),
      },
      include: {
        participants: {
          include: { student: { select: { id: true, name: true } } },
        },
      },
    });

    return session;
  },

  async update(id: string, input: z.infer<typeof classSessionUpdateSchema>, userId: string) {
    const existing = await prisma.classSession.findFirst({
      where: { id, deletedAt: null },
      include: { course: { select: { userId: true } } },
    });

    if (!existing || existing.course.userId !== userId) {
      throw new ApiError(404, 'SESSION_NOT_FOUND', 'Class session not found');
    }

    const session = await prisma.classSession.update({
      where: { id },
      data: input,
    });

    return session;
  },

  async delete(id: string, userId: string) {
    const existing = await prisma.classSession.findFirst({
      where: { id, deletedAt: null },
      include: { course: { select: { userId: true } } },
    });

    if (!existing || existing.course.userId !== userId) {
      throw new ApiError(404, 'SESSION_NOT_FOUND', 'Class session not found');
    }

    const session = await prisma.classSession.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return session;
  },

  async addParticipant(classSessionId: string, studentId: string, userId: string) {
    const session = await prisma.classSession.findFirst({
      where: { id: classSessionId, deletedAt: null },
      include: { course: { select: { userId: true } } },
    });

    if (!session || session.course.userId !== userId) {
      throw new ApiError(404, 'SESSION_NOT_FOUND', 'Class session not found');
    }

    // 校验学生归属
    const student = await prisma.student.findFirst({
      where: { id: studentId, userId, deletedAt: null },
    });
    if (!student) {
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found');
    }

    const participant = await prisma.sessionParticipant.create({
      data: {
        classSessionId,
        studentId,
      },
      include: { student: { select: { id: true, name: true } } },
    });

    return participant;
  },

  async removeParticipant(classSessionId: string, participantId: string, userId: string) {
    const participant = await prisma.sessionParticipant.findFirst({
      where: { id: participantId, classSessionId },
      include: {
        classSession: { include: { course: { select: { userId: true } } } },
      },
    });

    if (!participant || participant.classSession.course.userId !== userId) {
      throw new ApiError(404, 'PARTICIPANT_NOT_FOUND', 'Participant not found');
    }

    await prisma.sessionParticipant.update({
      where: { id: participantId },
      data: { deletedAt: new Date() },
    });
  },
};
