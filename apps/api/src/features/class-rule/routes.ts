import { Hono } from 'hono';

import {
  classRuleAddStudentSchema,
  classRuleAvailableStudentsQuerySchema,
  classRuleConflictCheckSchema,
  classRuleCreateSchema,
  classRuleDeleteParamsSchema,
  classRuleDetailParamsSchema,
  classRuleListQuerySchema,
  classRuleRemoveStudentParamsSchema,
  classRuleStudentListParamsSchema,
  classRuleStudentListQuerySchema,
  classRuleUpdateParamsSchema,
  classRuleUpdateSchema,
  type ClassRuleAddStudentResponse,
  type ClassRuleAvailableStudentsResponse,
  type ClassRuleCreateResponse,
  type ClassRuleDeleteResponse,
  type ClassRuleDetailResponse,
  type ClassRuleListResponse,
  type ClassRuleRemoveStudentResponse,
  type ClassRuleStudentListResponse,
  type ClassRuleUpdateResponse,
} from '@tutorhub/schema';

import { classRuleService } from '@/features/class-rule/services/class-rule';
import { zValidator } from '@/shared/validator';

export const classRuleRoute = new Hono()
  .get('/list', zValidator('query', classRuleListQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const userId = c.get('userId');
    const { courseId, ...rest } = query;
    const res: ClassRuleListResponse = await classRuleService.list(courseId, rest, userId);
    return c.json(res);
  })
  .get('/:id', zValidator('param', classRuleDetailParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res: ClassRuleDetailResponse = await classRuleService.getById(id, userId);
    return c.json({ data: res });
  })
  .post('/', zValidator('json', classRuleCreateSchema), async (c) => {
    const input = c.req.valid('json');
    const userId = c.get('userId');
    const res: ClassRuleCreateResponse = await classRuleService.create(input, userId);
    return c.json({ data: res }, 201);
  })
  .put(
    '/:id',
    zValidator('param', classRuleUpdateParamsSchema),
    zValidator('json', classRuleUpdateSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const input = c.req.valid('json');
      const userId = c.get('userId');
      const res: ClassRuleUpdateResponse = await classRuleService.update(id, input, userId);
      return c.json({ data: res });
    },
  )
  .post('/check-conflicts', zValidator('json', classRuleConflictCheckSchema), async (c) => {
    const input = c.req.valid('json');
    const userId = c.get('userId');
    const res = await classRuleService.checkConflicts(input.courseId, input, userId);
    return c.json(res);
  })
  .get('/:id/preview', zValidator('param', classRuleDetailParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    // 用当前规则数据做预览（无变更时）
    const existing = await classRuleService.getById(id, userId);
    const res = await classRuleService.previewChanges(
      id,
      {
        startDate: existing.startDate,
        startTime: existing.startTime.toISOString?.()?.slice(11, 16) ?? '',
        endTime: existing.endTime.toISOString?.()?.slice(11, 16) ?? '',
      },
      userId,
    );
    return c.json(res);
  })
  .post(
    '/:id/apply-changes',
    zValidator('param', classRuleDetailParamsSchema),
    zValidator('json', classRuleUpdateSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const input = c.req.valid('json');
      const userId = c.get('userId');
      const res: ClassRuleUpdateResponse = await classRuleService.applyChanges(id, input, userId);
      return c.json({ data: res });
    },
  )
  .delete('/:id', zValidator('param', classRuleDeleteParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res: ClassRuleDeleteResponse = await classRuleService.delete(id, userId);
    return c.json({ data: res });
  })

  // ────────── ClassRuleStudent 路由 ──────────

  .get(
    '/:ruleId/students',
    zValidator('param', classRuleStudentListParamsSchema),
    zValidator('query', classRuleStudentListQuerySchema),
    async (c) => {
      const { ruleId } = c.req.valid('param');
      const query = c.req.valid('query');
      const userId = c.get('userId');
      const res: ClassRuleStudentListResponse = await classRuleService.listStudentsByRule(
        ruleId,
        query,
        userId,
      );
      return c.json(res);
    },
  )
  .get(
    '/:ruleId/available-students',
    zValidator('param', classRuleStudentListParamsSchema),
    zValidator('query', classRuleAvailableStudentsQuerySchema),
    async (c) => {
      const { ruleId } = c.req.valid('param');
      const query = c.req.valid('query');
      const courseId = c.req.query('courseId') ?? '';
      const userId = c.get('userId');
      const res: ClassRuleAvailableStudentsResponse = await classRuleService.listAvailableStudents(
        ruleId,
        courseId,
        query,
        userId,
      );
      return c.json(res);
    },
  )
  .post(
    '/:ruleId/student',
    zValidator('param', classRuleStudentListParamsSchema),
    zValidator('json', classRuleAddStudentSchema),
    async (c) => {
      const { ruleId } = c.req.valid('param');
      const { studentId } = c.req.valid('json');
      const userId = c.get('userId');
      const res: ClassRuleAddStudentResponse = await classRuleService.addStudent(
        ruleId,
        studentId,
        userId,
      );
      return c.json({ data: res }, 201);
    },
  )
  .delete(
    '/class-rule-student/:id',
    zValidator('param', classRuleRemoveStudentParamsSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const userId = c.get('userId');
      const res: ClassRuleRemoveStudentResponse = await classRuleService.removeStudent(id, userId);
      return c.json({ data: res });
    },
  );
