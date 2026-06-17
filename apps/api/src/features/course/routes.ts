import { Hono } from 'hono';

import {
  courseCreateSchema,
  courseDeleteParamsSchema,
  courseDetailParamsSchema,
  courseListSchema,
  courseUpdateSchema,
  type CourseCreateResponse,
  type CourseDeleteResponse,
  type CourseDetailResponse,
  type CourseListResponse,
  type CourseUpdateResponse,
} from '@tutorhub/schema';

import { courseService } from '@/features/course/services/course';
import { zValidator } from '@/shared/validator';

export const courseRoute = new Hono()
  .get('/list', zValidator('query', courseListSchema), async (c) => {
    const query = c.req.valid('query');
    const userId = c.get('userId');
    const res: CourseListResponse = await courseService.list(query, userId);
    return c.json(res);
  })
  .post('/', zValidator('json', courseCreateSchema), async (c) => {
    const input = c.req.valid('json');
    const userId = c.get('userId');
    const res: CourseCreateResponse = await courseService.create(input, userId);
    return c.json({ data: res }, 201);
  })
  .get('/:id', zValidator('param', courseDetailParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res: CourseDetailResponse = await courseService.getById(id, userId);
    return c.json({ data: res });
  })
  .put(
    '/:id',
    zValidator('param', courseDetailParamsSchema),
    zValidator('json', courseUpdateSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const input = c.req.valid('json');
      const userId = c.get('userId');
      const res: CourseUpdateResponse = await courseService.update(id, input, userId);
      return c.json({ data: res });
    },
  )
  .delete('/:id', zValidator('param', courseDeleteParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const userId = c.get('userId');
    const res: CourseDeleteResponse = await courseService.delete(id, userId);
    return c.json({ data: res });
  });
