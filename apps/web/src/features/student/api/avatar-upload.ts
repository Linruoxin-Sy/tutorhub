import { request } from '@/utils/request';
import type { AvatarUploadUrlResponse } from '@tutorhub/schema';

/**
 * 使用 Presigned POST 将文件上传到 MinIO，返回 objectKey。
 * 在表单提交时调用，上传失败则阻止提交。
 */
export async function uploadAvatarFile(file: Blob): Promise<string> {
  const contentType = file.type || 'image/webp';

  // 1) 获取 Presigned POST 凭证
  const { data: uploadData } = await request.post<AvatarUploadUrlResponse>('/avatar/upload-url', {
    contentType,
  });

  const { url, fields, objectKey } = uploadData;

  // 2) 使用 FormData 以 POST 方式直传 MinIO（受 Policy 保护）
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  formData.append('file', file);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`头像上传失败 (${res.status})`);
  }

  return objectKey;
}
