import { Hono } from 'hono';
import { rescheduleRecordController } from './reschedule-record.controller';

export const rescheduleRecordRoute = new Hono()
  .get('/', rescheduleRecordController.list)
  .post('/', rescheduleRecordController.create)
  .get('/:id', rescheduleRecordController.detail)
  .put('/:id', rescheduleRecordController.update)
  .delete('/:id', rescheduleRecordController.delete);
