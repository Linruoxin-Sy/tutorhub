import { ApiError } from '@/shared/api-error';
import { prisma } from '@/shared/prisma';
import { translatePrismaWriteError } from '@/shared/prisma-errors';
import { assertNonEmpty, stripUndefined } from '@/shared/request';
import type {
  ClassRuleCreateInput,
  ClassRuleListQuery,
  ClassRuleUpdateInput,
} from './class-rule.schema';

const classRuleSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  studentCourseId: true,
  startDate: true,
  intervalDays: true,
  endDate: true,
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

export const classRuleService = {
  async list(query: ClassRuleListQuery) {
    const where = {
      ...(query.studentCourseId ? { studentCourseId: query.studentCourseId } : {}),
    };

    const [total, items] = await prisma.$transaction([
      prisma.classRule.count({ where }),
      prisma.classRule.findMany({
        where,
        select: classRuleSelect,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
    ]);

    return { data: items, page: query.page, pageSize: query.pageSize, total };
  },

  async getById(id: string) {
    const classRule = await prisma.classRule.findUnique({ where: { id }, select: classRuleSelect });

    if (!classRule) {
      throw new ApiError(404, 'CLASS_RULE_NOT_FOUND', 'Class rule not found');
    }

    return classRule;
  },

  async create(input: ClassRuleCreateInput) {
    await ensureStudentCourseExists(input.studentCourseId);

    try {
      return await prisma.classRule.create({ data: input, select: classRuleSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'CLASS_RULE');
    }
  },

  async update(id: string, input: ClassRuleUpdateInput) {
    const data = stripUndefined(input);

    assertNonEmpty(data);

    if (data.studentCourseId) {
      await ensureStudentCourseExists(data.studentCourseId);
    }

    try {
      return await prisma.classRule.update({ where: { id }, data, select: classRuleSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'CLASS_RULE');
    }
  },

  async delete(id: string) {
    try {
      return await prisma.classRule.delete({ where: { id }, select: classRuleSelect });
    } catch (error) {
      translatePrismaWriteError(error, 'CLASS_RULE');
    }
  },
};
