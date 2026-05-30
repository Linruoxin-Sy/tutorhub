import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import { translatePrismaWriteError } from '@/shared/prisma-errors';
import { assertNonEmpty, stripUndefined } from '@/shared/request';
import type {
  LeaveRecordCreateInput,
  LeaveRecordListQuery,
  LeaveRecordUpdateInput,
} from './leave-record.schema';

const leaveRecordSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  classSessionId: true,
  reason: true,
} as const;

const ensureClassSessionExists = async (classSessionId: string) => {
  const classSession = await prisma.classSession.findUnique({
    where: { id: classSessionId },
    select: { id: true },
  });

  if (!classSession) {
    throw new ApiError(404, 'CLASS_SESSION_NOT_FOUND', 'Class session not found');
  }
};

export const leaveRecordService = {
  async list(query: LeaveRecordListQuery) {
    const where = {
      ...(query.classSessionId ? { classSessionId: query.classSessionId } : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.leaveRecord.count({ where }),
      prisma.leaveRecord.findMany({
        where,
        select: leaveRecordSelect,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return { data: items, page: query.page, pageSize: query.pageSize, total };
  },

  async getById(id: string) {
    const leaveRecord = await prisma.leaveRecord.findUnique({
      where: { id },
      select: leaveRecordSelect,
    });

    if (!leaveRecord) {
      throw new ApiError(404, 'LEAVE_RECORD_NOT_FOUND', 'Leave record not found');
    }

    return leaveRecord;
  },

  async create(input: LeaveRecordCreateInput) {
    await ensureClassSessionExists(input.classSessionId);

    try {
      return await prisma.leaveRecord.create({ data: input, select: leaveRecordSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'LEAVE_RECORD');
    }
  },

  async update(id: string, input: LeaveRecordUpdateInput) {
    const data = stripUndefined(input);

    assertNonEmpty(data);

    if (data.classSessionId) {
      await ensureClassSessionExists(data.classSessionId);
    }

    try {
      return await prisma.leaveRecord.update({ where: { id }, data, select: leaveRecordSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'LEAVE_RECORD');
    }
  },

  async delete(id: string) {
    try {
      return await prisma.leaveRecord.delete({ where: { id }, select: leaveRecordSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'LEAVE_RECORD');
    }
  },
};
