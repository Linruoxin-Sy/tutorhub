import { z } from 'zod';

/** 申请头像 Presigned POST 地址 */
export const avatarUploadUrlRequestSchema = z.object({
  contentType: z.string().min(1, 'contentType is required'),
});

export type AvatarUploadUrlRequest = z.infer<typeof avatarUploadUrlRequestSchema>;

/** Presigned POST 响应：前端直接 POST 到 url + fields 即可上传文件 */
export const avatarUploadUrlResponseSchema = z.object({
  url: z.string(),
  fields: z.record(z.string(), z.string()),
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
};
