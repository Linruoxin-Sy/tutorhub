import { Hono } from 'hono';
import { courseController } from './course.controller';

export const courseRoute = new Hono()
  .get('/', courseController.list)
  .post('/', courseController.create)
  .get('/:id', courseController.detail)
  .put('/:id', courseController.update)
  .delete('/:id', courseController.delete);
