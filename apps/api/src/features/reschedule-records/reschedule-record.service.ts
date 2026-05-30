import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import { translatePrismaWriteError } from '@/shared/prisma-errors';
import { assertNonEmpty, stripUndefined } from '@/shared/request';
import type {
  RescheduleRecordCreateInput,
  RescheduleRecordListQuery,
  RescheduleRecordUpdateInput,
} from './reschedule-record.schema';

const rescheduleRecordSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  originalSessionId: true,
  newSessionId: true,
  reason: true,
} as const;

const ensureClassSessionExists = async (sessionId: string) => {
  const classSession = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: { id: true },
  });

  if (!classSession) {
    throw new ApiError(404, 'CLASS_SESSION_NOT_FOUND', 'Class session not found');
  }
};

export const rescheduleRecordService = {
  async list(query: RescheduleRecordListQuery) {
    const where = {
      ...(query.originalSessionId ? { originalSessionId: query.originalSessionId } : {}),
      ...(query.newSessionId ? { newSessionId: query.newSessionId } : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.rescheduleRecord.count({ where }),
      prisma.rescheduleRecord.findMany({
        where,
        select: rescheduleRecordSelect,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return { data: items, page: query.page, pageSize: query.pageSize, total };
  },

  async getById(id: string) {
    const rescheduleRecord = await prisma.rescheduleRecord.findUnique({
      where: { id },
      select: rescheduleRecordSelect,
    });

    if (!rescheduleRecord) {
      throw new ApiError(404, 'RESCHEDULE_RECORD_NOT_FOUND', 'Reschedule record not found');
    }

    return rescheduleRecord;
  },

  async create(input: RescheduleRecordCreateInput) {
    await ensureClassSessionExists(input.originalSessionId);
    await ensureClassSessionExists(input.newSessionId);

    try {
      return await prisma.rescheduleRecord.create({ data: input, select: rescheduleRecordSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'RESCHEDULE_RECORD');
    }
  },

  async update(id: string, input: RescheduleRecordUpdateInput) {
    const data = stripUndefined(input);

    assertNonEmpty(data);

    if (data.originalSessionId) {
      await ensureClassSessionExists(data.originalSessionId);
    }

    if (data.newSessionId) {
      await ensureClassSessionExists(data.newSessionId);
    }

    try {
      return await prisma.rescheduleRecord.update({
        where: { id },
        data,
        select: rescheduleRecordSelect,
      });
    } catch (error) {
      translatePrismaWriteError(error, 'RESCHEDULE_RECORD');
    }
  },

  async delete(id: string) {
    try {
      return await prisma.rescheduleRecord.delete({
        where: { id },
        select: rescheduleRecordSelect,
      });
    } catch (error) {
      translatePrismaWriteError(error, 'RESCHEDULE_RECORD');
    }
  },
};
