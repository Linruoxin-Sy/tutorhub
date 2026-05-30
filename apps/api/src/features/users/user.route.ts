import { Hono } from 'hono';
import { userController } from './user.controller';

export const userRoute = new Hono()
  .get('/', userController.list)
  .post('/', userController.create)
  .get('/:id', userController.detail)
  .put('/:id', userController.update)
  .delete('/:id', userController.delete);
