import { Hono } from 'hono';
import { avatarUploadUrlRequestSchema, type AvatarUploadUrlResponse } from '@tutorhub/schema';
import { zValidator } from '@/shared/validator';
import { avatarService } from '@/features/avatar/services/avatar';

export const avatarRoute = new Hono()
  /** 申请 Presigned POST 凭证 */
  .post('/upload-url', zValidator('json', avatarUploadUrlRequestSchema), async (c) => {
    const { contentType } = c.req.valid('json');
    const userId = c.get('userId');
    const res: AvatarUploadUrlResponse = await avatarService.generateUploadUrl(contentType, userId);
    return c.json(res);
  });
