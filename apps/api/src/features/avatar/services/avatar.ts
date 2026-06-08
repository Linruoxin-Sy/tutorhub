import { PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { s3Client, bucketName } from '@/shared/s3';
import { prisma } from '@/shared/prisma';
import { getEnv } from '@/shared/getEnv';
import { ApiError } from '@/shared/api-error';

const AVATAR_BASE_URL = getEnv('AVATAR_BASE_URL', 'http://localhost:9000/tutorhub');
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB

function getExtension(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
  };
  return map[contentType] ?? 'jpg';
}

export const avatarService = {
  /** 生成预签名上传 URL */
  async generateUploadUrl(contentType: string) {
    const ext = getExtension(contentType);
    const objectKey = `avatars/${randomUUID()}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return { uploadUrl, objectKey };
  },

  /** 验证文件大小是否 ≤ 1MB */
  async verifyFileSize(objectKey: string): Promise<void> {
    try {
      const head = await s3Client.send(
        new HeadObjectCommand({ Bucket: bucketName, Key: objectKey }),
      );
      if (head.ContentLength != null && head.ContentLength > MAX_FILE_SIZE) {
        // 异步删除超大文件
        s3Client
          .send(new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey }))
          .catch(() => {});
        throw new ApiError(413, 'FILE_TOO_LARGE', '头像文件大小不能超过 1MB');
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      // 文件不存在或其他错误 — 让上传流程继续
    }
  },

  /** 更新学生头像 Key */
  async updateStudentAvatar(studentId: string, userId: string, objectKey: string) {
    const student = await prisma.student.findFirst({
      where: { id: studentId, userId, deletedAt: null },
    });

    if (!student) {
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found');
    }

    // 先验证文件大小
    await this.verifyFileSize(objectKey);

    const avatarUrl = `${AVATAR_BASE_URL}/${objectKey}`;

    // 更新数据库（不再存储 avatarUrl，仅存 key）
    const updated = await prisma.student.update({
      where: { id: studentId },
      data: { avatarKey: objectKey },
    });

    // 异步删除旧头像（决不能让旧头像删除失败影响主流程）
    if (student.avatarKey && student.avatarKey !== objectKey) {
      s3Client
        .send(new DeleteObjectCommand({ Bucket: bucketName, Key: student.avatarKey }))
        .catch((err) => console.error('Failed to delete old avatar:', err));
    }

    return {
      id: updated.id,
      avatarUrl,
      avatarKey: updated.avatarKey,
    };
  },
};
