import { request } from '@/utils/request';
import type { AvatarUploadUrlResponse } from '@tutorhub/schema';

/**
 * 使用 Presigned POST 将文件上传到 MinIO，返回 objectKey。
 * 在表单提交时调用，上传失败则阻止提交。
 *
 * Policy 由后端生成，包含：
 * - content-length-range（第三层防护：拒绝超限文件）
 * - starts-with Content-Type（仅允许图片）
 */
export async function uploadAvatarFile(file: Blob): Promise<string> {
  const contentType = file.type || 'image/webp';

  // 1) 获取 Presigned POST 凭证（含签名 Policy）
  const { data: uploadData } = await request.post<AvatarUploadUrlResponse>(
    '/storage/student-avatar/upload-url',
    {
      contentType,
    },
  );

  const { url, fields, objectKey } = uploadData;

  // 2) 用 FormData 以 POST 方式提交（受 Policy 保护）
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  // Policy 要求 $Content-Type 字段存在且值以 image/ 开头
  formData.append('Content-Type', contentType);
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
