import { Hono } from 'hono';

import {
  classSessionCreateSchema,
  classSessionDetailParamsSchema,
  classSessionListQuerySchema,
  classSessionUpdateParamsSchema,
  classSessionUpdateSchema,
  participantCreateSchema,
  participantDeleteParamsSchema,
  type ClassSessionCreateResponse,
  type ClassSessionDetailResponse,
  type ClassSessionListResponse,
  type ClassSessionUpdateResponse,
} from '@tutorhub/schema';

import { classSessionService } from '@/features/class-session/services/class-session';
import { zValidator } from '@/shared/validator';

export const classSessionRoute = new Hono()
  .get('/list', zValidator('query', classSessionListQuerySchema), async (c) => {
    const query = c.req.valid('query');
    const userId = c.get('userId');
    const res: ClassSessionListResponse = await classSessionService.list(query, userId);
    return c.json(res);
  })
  .get('/:id', zValidator('param', classSessionDetailParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res: ClassSessionDetailResponse = await classSessionService.getById(id, userId);
    return c.json({ data: res });
  })
  .post('/', zValidator('json', classSessionCreateSchema), async (c) => {
    const input = c.req.valid('json');
    const userId = c.get('userId');
    const res: ClassSessionCreateResponse = await classSessionService.create(input, userId);
    return c.json({ data: res }, 201);
  })
  .put(
    '/:id',
    zValidator('param', classSessionUpdateParamsSchema),
    zValidator('json', classSessionUpdateSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const input = c.req.valid('json');
      const userId = c.get('userId');
      const res: ClassSessionUpdateResponse = await classSessionService.update(id, input, userId);
      return c.json({ data: res });
    },
  )
  .delete('/:id', zValidator('param', classSessionDetailParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res = await classSessionService.delete(id, userId);
    return c.json({ data: res });
  })
  // 参与者管理
  .post('/:sessionId/participants', zValidator('json', participantCreateSchema), async (c) => {
    const { classSessionId, studentId } = c.req.valid('json');
    const userId = c.get('userId');
    const res = await classSessionService.addParticipant(classSessionId, studentId, userId);
    return c.json({ data: res }, 201);
  })
  .delete(
    '/:sessionId/participants/:participantId',
    zValidator('param', participantDeleteParamsSchema),
    async (c) => {
      const { sessionId, participantId } = c.req.valid('param');
      const userId = c.get('userId');
      await classSessionService.removeParticipant(sessionId, participantId, userId);
      return c.json({ data: { success: true } });
    },
  );
