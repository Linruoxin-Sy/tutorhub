import { readJsonBody, readQueryParams, readRequiredParam } from '@/shared/request';
import { sendData, sendPage } from '@/shared/response';
import { leaveRecordService } from './leave-record.service';
import {
  parseLeaveRecordCreateBody,
  parseLeaveRecordListQuery,
  parseLeaveRecordUpdateBody,
} from './leave-record.schema';

export const leaveRecordController = {
  list: async (c: Parameters<typeof sendPage>[0]) =>
    sendPage(c, await leaveRecordService.list(parseLeaveRecordListQuery(readQueryParams(c)))),
  detail: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await leaveRecordService.getById(readRequiredParam(c, 'id'))),
  create: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await leaveRecordService.create(parseLeaveRecordCreateBody(await readJsonBody(c))),
      201,
    ),
  update: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await leaveRecordService.update(
        readRequiredParam(c, 'id'),
        parseLeaveRecordUpdateBody(await readJsonBody(c)),
      ),
    ),
  delete: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await leaveRecordService.delete(readRequiredParam(c, 'id'))),
};
