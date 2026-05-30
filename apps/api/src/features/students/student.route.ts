import { Hono } from 'hono';
import { studentController } from './student.controller';

export const studentRoute = new Hono()
  .get('/', studentController.list)
  .post('/', studentController.create)
  .get('/:id', studentController.detail)
  .put('/:id', studentController.update)
  .delete('/:id', studentController.delete);
