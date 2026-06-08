import { request } from '@/utils/request';
import type { AvatarUploadUrlResponse } from '@tutorhub/schema';

/**
 * 使用 Presigned PUT URL 将文件上传到 MinIO，返回 objectKey。
 * 在表单提交时调用，上传失败则阻止提交。
 */
export async function uploadAvatarFile(file: Blob): Promise<string> {
  const contentType = file.type || 'image/webp';

  // 1) 获取 Presigned PUT URL
  const { data: uploadData } = await request.post<AvatarUploadUrlResponse>('/avatar/upload-url', {
    contentType,
  });

  const { url, objectKey } = uploadData;

  // 2) 直传 MinIO
  const res = await fetch(url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  });

  if (!res.ok) {
    throw new Error(`头像上传失败 (${res.status})`);
  }

  return objectKey;
}
