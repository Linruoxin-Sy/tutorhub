import { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { s3Client, bucketName } from '@/shared/s3';
import { prisma } from '@/shared/prisma';
import { getEnv } from '@/shared/getEnv';
import { ApiError } from '@/shared/api-error';

const AVATAR_BASE_URL = getEnv('AVATAR_BASE_URL', 'http://localhost:9000/tutorhub');
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const ALLOWED_MIME_PREFIXES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/** 校验 objectKey 路径格式是否合法 */
function isValidAvatarPath(objectKey: string, userId: string): boolean {
  const pattern = new RegExp(`^avatars/${userId}/[a-f0-9-]+\\.webp$`);
  return pattern.test(objectKey);
}

/** 异步删除 MinIO 中的头像文件（失败仅日志，不影响主流程） */
function deleteAvatarFile(objectKey: string): void {
  s3Client
    .send(new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey }))
    .catch((err) => console.error('Failed to delete avatar file:', err));
}

export const avatarService = {
  /**
   * 生成 Presigned PUT URL
   *
   * 安全说明：
   * - URL 5 分钟过期
   * - Key 由后端生成（avatars/{userId}/{uuid}.webp），用户无法指定
   * - 上传完成后后端通过 HeadObject 做最终校验（大小、MIME、路径）
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

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return { url: uploadUrl, fields: {}, objectKey };
  },

  /**
   * 保存学生头像 Key（第四层防护：最终校验）
   *
   * 1. 校验学生归属
   * 2. 校验 objectKey 路径格式
   * 3. 校验文件是否实际存在
   * 4. 校验文件大小
   * 5. 校验 MIME 类型
   * 6. 更新数据库
   * 7. 异步删除旧头像
   */
  async updateStudentAvatar(studentId: string, userId: string, objectKey: string) {
    // 1) 校验学生归属
    const student = await prisma.student.findFirst({
      where: { id: studentId, userId, deletedAt: null },
    });

    if (!student) {
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found');
    }

    // 2) 校验路径格式 — 防止注入 / 跨用户覆盖
    if (!isValidAvatarPath(objectKey, userId)) {
      throw new ApiError(400, 'INVALID_AVATAR_PATH', '头像路径格式不合法');
    }

    // 3) 查询对象信息（校验文件是否存在、大小、MIME）
    let head;
    try {
      head = await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: objectKey }));
    } catch {
      throw new ApiError(404, 'AVATAR_NOT_FOUND', '头像文件未找到，请重新上传');
    }

    // 4) 校验文件大小
    if (head.ContentLength != null && head.ContentLength > MAX_FILE_SIZE) {
      deleteAvatarFile(objectKey);
      throw new ApiError(413, 'FILE_TOO_LARGE', '头像文件大小不能超过 1MB');
    }

    // 5) 校验 MIME 类型
    const contentType = head.ContentType ?? '';
    if (!ALLOWED_MIME_PREFIXES.some((p) => contentType.startsWith(p))) {
      deleteAvatarFile(objectKey);
      throw new ApiError(400, 'INVALID_CONTENT_TYPE', '头像文件类型不合法');
    }

    // 6) 更新数据库
    const avatarUrl = `${AVATAR_BASE_URL}/${objectKey}`;
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { avatarKey: objectKey },
    });

    // 7) 异步删除旧头像
    if (student.avatarKey && student.avatarKey !== objectKey) {
      deleteAvatarFile(student.avatarKey);
    }

    return {
      id: updated.id,
      avatarUrl,
      avatarKey: updated.avatarKey,
    };
  },
};
