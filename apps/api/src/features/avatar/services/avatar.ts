import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { randomUUID } from 'node:crypto';
import { s3Client, bucketName } from '@/shared/s3';
import { ApiError } from '@/shared/api-error';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const ALLOWED_MIME_PREFIXES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

export const avatarService = {
  /**
   * 生成 Presigned POST 凭证
   *
   * Policy 包含：
   * - content-length-range: 0 ~ 1MB → 拒绝超限文件
   * - starts-with $Content-Type: image/ → 仅允许图片
   */
  async generateUploadUrl(contentType: string, userId: string) {
    if (!ALLOWED_MIME_PREFIXES.some((p) => contentType.startsWith(p))) {
      throw new ApiError(
        400,
        'INVALID_CONTENT_TYPE',
        '不支持的图片格式，仅允许 JPEG/PNG/WebP/AVIF',
      );
    }

    const objectKey = `avatars/${userId}/${randomUUID()}.webp`;

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucketName,
      Key: objectKey,
      Conditions: [
        ['content-length-range', 0, MAX_FILE_SIZE],
        ['starts-with', '$Content-Type', 'image/'],
      ],
      Expires: 300,
    });

    // MinIO path-style 需要尾部斜杠
    const postUrl = url.endsWith('/') ? url : `${url}/`;

    return { url: postUrl, fields, objectKey };
  },
};
