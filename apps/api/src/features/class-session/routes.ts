import { Hono } from 'hono';

import {
  classSessionOverrideConflictCheckSchema,
  classSessionOverrideCreateSchema,
  classSessionOverrideDetailParamsSchema,
  classSessionOverrideListQuerySchema,
  classSessionOverrideUpdateParamsSchema,
  classSessionOverrideUpdateSchema,
  type ClassSessionOverrideConflictCheckResponse,
  type ClassSessionOverrideCreateResponse,
  type ClassSessionOverrideDetailResponse,
  type ClassSessionOverrideListResponse,
  type ClassSessionOverrideUpdateResponse,
} from '@tutorhub/schema';

import { classSessionOverrideService } from '@/features/class-session/services/class-session';
import { zValidator } from '@/shared/validator';

export const classSessionRoute = new Hono()
  .post(
    '/check-conflicts',
    zValidator('json', classSessionOverrideConflictCheckSchema),
    async (c) => {
      const input = c.req.valid('json');
      const userId = c.get('userId');
      const res: ClassSessionOverrideConflictCheckResponse =
        await classSessionOverrideService.checkConflicts(
          input.classRuleId,
          input.originalDate,
          input.newStartTime,
          input.newEndTime,
          userId,
        );
      return c.json(res);
    },
  )
  .get('/list', zValidator('query', classSessionOverrideListQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const userId = c.get('userId');
    const res: ClassSessionOverrideListResponse = await classSessionOverrideService.list(
      query,
      userId,
    );
    return c.json(res);
  })
  .get('/:id', zValidator('param', classSessionOverrideDetailParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res: ClassSessionOverrideDetailResponse = await classSessionOverrideService.getById(
      id,
      userId,
    );
    return c.json({ data: res });
  })
  .post('/', zValidator('json', classSessionOverrideCreateSchema), async (c) => {
    const input = c.req.valid('json');
    const userId = c.get('userId');
    const res: ClassSessionOverrideCreateResponse = await classSessionOverrideService.create(
      input,
      userId,
    );
    return c.json({ data: res }, 201);
  })
  .put(
    '/:id',
    zValidator('param', classSessionOverrideUpdateParamsSchema),
    zValidator('json', classSessionOverrideUpdateSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const input = c.req.valid('json');
      const userId = c.get('userId');
      const res: ClassSessionOverrideUpdateResponse = await classSessionOverrideService.update(
        id,
        input,
        userId,
      );
      return c.json({ data: res });
    },
  )
  .delete('/:id', zValidator('param', classSessionOverrideDetailParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res = await classSessionOverrideService.delete(id, userId);
    return c.json({ data: res });
  });
