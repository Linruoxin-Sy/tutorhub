import { Hono } from 'hono';
import { leaveRecordController } from './leave-record.controller';

export const leaveRecordRoute = new Hono()
  .get('/', leaveRecordController.list)
  .post('/', leaveRecordController.create)
  .get('/:id', leaveRecordController.detail)
  .put('/:id', leaveRecordController.update)
  .delete('/:id', leaveRecordController.delete);
