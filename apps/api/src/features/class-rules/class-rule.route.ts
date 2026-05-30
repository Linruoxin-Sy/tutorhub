import { Hono } from 'hono';
import { classRuleController } from './class-rule.controller';

export const classRuleRoute = new Hono()
  .get('/', classRuleController.list)
  .post('/', classRuleController.create)
  .get('/:id', classRuleController.detail)
  .put('/:id', classRuleController.update)
  .delete('/:id', classRuleController.delete);
