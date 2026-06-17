import { Hono } from 'hono';

import {
  classRuleCreateSchema,
  classRuleDeleteParamsSchema,
  classRuleDetailParamsSchema,
  classRuleListQuerySchema,
  classRuleUpdateParamsSchema,
  classRuleUpdateSchema,
  type ClassRuleCreateResponse,
  type ClassRuleDeleteResponse,
  type ClassRuleDetailResponse,
  type ClassRuleListResponse,
  type ClassRuleUpdateResponse,
} from '@tutorhub/schema';

import { classRuleService } from '@/features/class-rule/services/class-rule';
import { zValidator } from '@/shared/validator';

export const classRuleRoute = new Hono()
  .get('/list', zValidator('query', classRuleListQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const userId = c.get('userId');
    const { studentCourseId, ...rest } = query;
    const res: ClassRuleListResponse = await classRuleService.list(studentCourseId, rest, userId);
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
  .delete('/:id', zValidator('param', classRuleDeleteParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res: ClassRuleDeleteResponse = await classRuleService.delete(id, userId);
    return c.json({ data: res });
  });
