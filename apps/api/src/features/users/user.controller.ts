import { readJsonBody, readQueryParams, readRequiredParam } from '@/shared/request';
import { sendData, sendPage } from '@/shared/response';
import { userService } from './user.service';
import { parseUserCreateBody, parseUserListQuery, parseUserUpdateBody } from './user.schema';

export const userController = {
  list: async (c: Parameters<typeof sendPage>[0]) =>
    sendPage(c, await userService.list(parseUserListQuery(readQueryParams(c)))),
  detail: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await userService.getById(readRequiredParam(c, 'id'))),
  create: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await userService.create(parseUserCreateBody(await readJsonBody(c))), 201),
  update: async (c: Parameters<typeof sendData>[0]) =>
    sendData(
      c,
      await userService.update(
        readRequiredParam(c, 'id'),
        parseUserUpdateBody(await readJsonBody(c)),
      ),
    ),
  delete: async (c: Parameters<typeof sendData>[0]) =>
    sendData(c, await userService.delete(readRequiredParam(c, 'id'))),
};
