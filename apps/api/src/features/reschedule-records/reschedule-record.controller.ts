import { readJsonBody, readQueryParams, readRequiredParam } from '@/shared/request';
import { sendData, sendPage } from '@/shared/response';
import { rescheduleRecordService } from './reschedule-record.service';
import {
  parseRescheduleRecordCreateBody,
  parseRescheduleRecordListQuery,
  parseRescheduleRecordUpdateBody,
} from './reschedule-record.schema';

export const rescheduleRecordController = {
  list: async (c: Parameters<typeof sendPage>[0]) =>
    sendPage(
      c,
      await rescheduleRecordService.list(parseRescheduleRecordListQuery(readQueryParams(c))),
    ),
  detail: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await rescheduleRecordService.getById(readRequiredParam(c, 'id'))),
  create: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await rescheduleRecordService.create(parseRescheduleRecordCreateBody(await readJsonBody(c))),
      201,
    ),
  update: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await rescheduleRecordService.update(
        readRequiredParam(c, 'id'),
        parseRescheduleRecordUpdateBody(await readJsonBody(c)),
      ),
    ),
  delete: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await rescheduleRecordService.delete(readRequiredParam(c, 'id'))),
};
