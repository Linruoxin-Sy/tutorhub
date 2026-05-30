import { readJsonBody, readQueryParams, readRequiredParam } from '@/shared/request';
import { sendData, sendPage } from '@/shared/response';
import { classRuleService } from './class-rule.service';
import {
  parseClassRuleCreateBody,
  parseClassRuleListQuery,
  parseClassRuleUpdateBody,
} from './class-rule.schema';

export const classRuleController = {
  list: async (c: Parameters<typeof sendPage>[0]) =>
    sendPage(c, await classRuleService.list(parseClassRuleListQuery(readQueryParams(c)))),
  detail: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await classRuleService.getById(readRequiredParam(c, 'id'))),
  create: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await classRuleService.create(parseClassRuleCreateBody(await readJsonBody(c))),
      201,
    ),
  update: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await classRuleService.update(
        readRequiredParam(c, 'id'),
        parseClassRuleUpdateBody(await readJsonBody(c)),
      ),
    ),
  delete: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await classRuleService.delete(readRequiredParam(c, 'id'))),
};
