import { Hono } from 'hono';
import {
  avatarUploadUrlRequestSchema,
  studentAvatarUpdateSchema,
  studentDetailParamsSchema,
  type AvatarUploadUrlResponse,
  type StudentAvatarUpdateResponse,
} from '@tutorhub/schema';
import { zValidator } from '@/shared/validator';
import { avatarService } from '@/features/avatar/services/avatar';

export const avatarRoute = new Hono()
  /** 申请预签名上传地址 */
  .post('/upload-url', zValidator('json', avatarUploadUrlRequestSchema), async (c) => {
    const { contentType } = c.req.valid('json');
    const res: AvatarUploadUrlResponse = await avatarService.generateUploadUrl(contentType);
    return c.json(res);
  })

  /** 保存学生头像 objectKey */
  .patch(
    '/student/:id/avatar',
    zValidator('param', studentDetailParamsSchema),
    zValidator('json', studentAvatarUpdateSchema),
    async (c) => {
      const { id } = c.req.valid('param');
      const { avatarKey } = c.req.valid('json');
      const userId = c.get('userId');

      const res: StudentAvatarUpdateResponse = await avatarService.updateStudentAvatar(
        id,
        userId,
        avatarKey,
      );

      return c.json({ data: res });
    },
  );
