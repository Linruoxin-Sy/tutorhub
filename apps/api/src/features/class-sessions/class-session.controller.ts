import { readJsonBody, readQueryParams, readRequiredParam } from '@/shared/request';
import { sendData, sendPage } from '@/shared/response';
import { classSessionService } from './class-session.service';
import {
  parseClassSessionCreateBody,
  parseClassSessionListQuery,
  parseClassSessionUpdateBody,
} from './class-session.schema';

export const classSessionController = {
  list: async (c: Parameters<typeof sendPage>[0]) =>
    sendPage(c, await classSessionService.list(parseClassSessionListQuery(readQueryParams(c)))),
  detail: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await classSessionService.getById(readRequiredParam(c, 'id'))),
  create: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await classSessionService.create(parseClassSessionCreateBody(await readJsonBody(c))),
      201,
    ),
  update: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await classSessionService.update(
        readRequiredParam(c, 'id'),
        parseClassSessionUpdateBody(await readJsonBody(c)),
      ),
    ),
  delete: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await classSessionService.delete(readRequiredParam(c, 'id'))),
};
