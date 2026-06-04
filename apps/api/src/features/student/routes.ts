import { Hono } from 'hono';
import {
  studentListSchema,
  studentDetailParamsSchema,
  studentCreateSchema,
  studentUpdateSchema,
  studentDeleteParamsSchema,
  type StudentListResponse,
  type StudentDetailResponse,
  type StudentCreateResponse,
  type StudentUpdateResponse,
  type StudentDeleteResponse,
} from '@tutorhub/schema';
import { zValidator } from '@/shared/validator';
import { studentService } from '@/features/student/services/student';

export const studentRoute = new Hono()
  .get('/list', zValidator('query', studentListSchema), async (c) => {
    const query = c.req.valid('query');
    const res: StudentListResponse = await studentService.list(query);
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
    const res: StudentDetailResponse = await studentService.getById(id);
    return c.json({ data: res });
  })
  .put(
    '/:id',
    zValidator('param', studentDetailParamsSchema),
    zValidator('json', studentUpdateSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const input = c.req.valid('json');
      const res: StudentUpdateResponse = await studentService.update(id, input);
      return c.json({ data: res });
    },
  )
  .delete('/:id', zValidator('param', studentDeleteParamsSchema), async (c) => {
    const { id } = c.req.valid('param');
    const res: StudentDeleteResponse = await studentService.delete(id);
    return c.json({ data: res });
  });
