import { readJsonBody, readQueryParams, readRequiredParam } from '@/shared/request';
import { sendData, sendPage } from '@/shared/response';
import { courseService } from './course.service';
import {
  parseCourseCreateBody,
  parseCourseListQuery,
  parseCourseUpdateBody,
} from './course.schema';

export const courseController = {
  list: async (c: Parameters<typeof sendPage>[0]) =>
    sendPage(c, await courseService.list(parseCourseListQuery(readQueryParams(c)))),
  detail: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await courseService.getById(readRequiredParam(c, 'id'))),
  create: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await courseService.create(parseCourseCreateBody(await readJsonBody(c))), 201),
  update: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await courseService.update(
        readRequiredParam(c, 'id'),
        parseCourseUpdateBody(await readJsonBody(c)),
      ),
    ),
  delete: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await courseService.delete(readRequiredParam(c, 'id'))),
};
