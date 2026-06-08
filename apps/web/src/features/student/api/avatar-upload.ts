import { request } from '@/utils/request';
import type { AvatarUploadUrlResponse } from '@tutorhub/schema';

/**
 * 将文件上传到 MinIO，返回 objectKey。
 * 在表单提交时调用，上传失败则阻止提交。
 */
export async function uploadAvatarFile(file: Blob): Promise<string> {
  const contentType = file.type || 'image/jpeg';

  // 1) 获取预签名上传地址
  const { data: uploadData } = await request.post<AvatarUploadUrlResponse>('/avatar/upload-url', {
    contentType,
  });

  const { uploadUrl, objectKey } = uploadData;

  // 2) 直传 MinIO
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': contentType },
  });

  if (!res.ok) {
    throw new Error(`头像上传失败 (${res.status})`);
  }

  return objectKey;
}
