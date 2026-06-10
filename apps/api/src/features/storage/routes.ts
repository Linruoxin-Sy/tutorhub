import { Hono } from 'hono';
import { avatarUploadUrlRequestSchema, type AvatarUploadUrlResponse } from '@tutorhub/schema';
import { zValidator } from '@/shared/validator';
import { storageService } from '@/features/storage/services/storage';

export const storageRoute = new Hono()
  /** 申请学生头像的 Presigned POST 凭证 */
  .post(
    '/student-avatar/upload-url',
    zValidator('json', avatarUploadUrlRequestSchema),
    async (c) => {
      const { contentType } = c.req.valid('json');
      const userId = c.get('userId');
      const res: AvatarUploadUrlResponse = await storageService.generateStudentAvatarUploadUrl(
        contentType,
        userId,
      );
      return c.json(res);
    },
  );
