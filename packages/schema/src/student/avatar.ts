import { z } from 'zod';

/** 申请头像上传地址的请求参数 */
export const avatarUploadUrlRequestSchema = z.object({
  contentType: z.string().min(1, 'contentType is required'),
});

export type AvatarUploadUrlRequest = z.infer<typeof avatarUploadUrlRequestSchema>;

/** 申请头像上传地址的响应 */
export const avatarUploadUrlResponseSchema = z.object({
  uploadUrl: z.string(),
  objectKey: z.string(),
});

export type AvatarUploadUrlResponse = z.infer<typeof avatarUploadUrlResponseSchema>;

/** 更新学生头像的请求参数（保存 objectKey） */
export const studentAvatarUpdateSchema = z.object({
  avatarKey: z.string().min(1, 'avatarKey is required'),
});

export type StudentAvatarUpdateResponse = {
  id: string;
  avatarUrl: string;
  avatarKey: string | null;
};
