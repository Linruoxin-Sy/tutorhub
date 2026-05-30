import { readJsonBody, readQueryParams, readRequiredParam } from '@/shared/request';
import { sendData, sendPage } from '@/shared/response';
import { studentService } from './student.service';
import {
  parseStudentCreateBody,
  parseStudentListQuery,
  parseStudentUpdateBody,
} from './student.schema';

export const studentController = {
  list: async (c: Parameters<typeof sendPage>[0]) =>
    sendPage(c, await studentService.list(parseStudentListQuery(readQueryParams(c)))),
  detail: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await studentService.getById(readRequiredParam(c, 'id'))),
  create: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await studentService.create(parseStudentCreateBody(await readJsonBody(c))), 201),
  update: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await studentService.update(
        readRequiredParam(c, 'id'),
        parseStudentUpdateBody(await readJsonBody(c)),
      ),
    ),
  delete: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await studentService.delete(readRequiredParam(c, 'id'))),
};
