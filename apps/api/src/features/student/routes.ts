import { Hono } from 'hono';

import {
  studentAvatarUpdateSchema,
  studentCreateSchema,
  studentDeleteParamsSchema,
  studentDetailParamsSchema,
  studentListSchema,
  studentUpdateSchema,
  type StudentAvatarUpdateResponse,
  type StudentCreateResponse,
  type StudentDeleteResponse,
  type StudentDetailResponse,
  type StudentListResponse,
  type StudentUpdateResponse,
} from '@tutorhub/schema';

import { studentService } from '@/features/student/services/student';
import { zValidator } from '@/shared/validator';

export const studentRoute = new Hono()
  .get('/list', zValidator('query', studentListSchema), async (c) => {
    const query = c.req.valid('query');
    const userId = c.get('userId');
    const res: StudentListResponse = await studentService.list(query, userId);
    return c.json(res);
  })
  .post('/', zValidator('json', studentCreateSchema), async (c) => {
    const input = c.req.valid('json');
    const userId = c.get('userId');
    const res: StudentCreateResponse = await studentService.create(input, userId);
    return c.json({ data: res }, 201);
  })
  .get('/:id', zValidator('param', studentDetailParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res: StudentDetailResponse = await studentService.getById(id, userId);
    return c.json({ data: res });
  })
  .put(
    '/:id',
    zValidator('param', studentDetailParamsSchema),
    zValidator('json', studentUpdateSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const input = c.req.valid('json');
      const userId = c.get('userId');
      const res: StudentUpdateResponse = await studentService.update(id, input, userId);
      return c.json({ data: res });
    },
  )
  .patch(
    '/:id/avatar',
    zValidator('param', studentDetailParamsSchema),
    zValidator('json', studentAvatarUpdateSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const { avatarKey } = c.req.valid('json');
      const userId = c.get('userId');

      const res: StudentAvatarUpdateResponse = await studentService.updateStudentAvatar(
        id,
        userId,
        avatarKey,
      );

      return c.json({ data: res });
    },
  )
  .delete('/:id', zValidator('param', studentDeleteParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res: StudentDeleteResponse = await studentService.delete(id, userId);
    return c.json({ data: res });
  });
