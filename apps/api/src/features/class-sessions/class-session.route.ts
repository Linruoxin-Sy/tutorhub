import { Hono } from 'hono';
import { classSessionController } from './class-session.controller';

export const classSessionRoute = new Hono()
  .get('/', classSessionController.list)
  .post('/', classSessionController.create)
  .get('/:id', classSessionController.detail)
  .put('/:id', classSessionController.update)
  .delete('/:id', classSessionController.delete);
