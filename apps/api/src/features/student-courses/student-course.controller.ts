import { readJsonBody, readQueryParams, readRequiredParam } from '@/shared/request';
import { sendData, sendPage } from '@/shared/response';
import { studentCourseService } from './student-course.service';
import {
  parseStudentCourseCreateBody,
  parseStudentCourseListQuery,
  parseStudentCourseUpdateBody,
} from './student-course.schema';

export const studentCourseController = {
  list: async (c: Parameters<typeof sendPage>[0]) =>
    sendPage(c, await studentCourseService.list(parseStudentCourseListQuery(readQueryParams(c)))),
  detail: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await studentCourseService.getById(readRequiredParam(c, 'id'))),
  create: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await studentCourseService.create(parseStudentCourseCreateBody(await readJsonBody(c))),
      201,
    ),
  update: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await studentCourseService.update(
        readRequiredParam(c, 'id'),
        parseStudentCourseUpdateBody(await readJsonBody(c)),
      ),
    ),
  delete: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await studentCourseService.delete(readRequiredParam(c, 'id'))),
};
