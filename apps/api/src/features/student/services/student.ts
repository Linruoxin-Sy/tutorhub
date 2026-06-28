import { DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { z } from 'zod';

import type { studentCreateSchema, studentListSchema, studentUpdateSchema } from '@tutorhub/schema';

import { ApiError } from '@/shared/api-error';
import { getEnv } from '@/shared/getEnv';
import { prisma } from '@/shared/prisma';
import { bucketName, s3Client } from '@/shared/s3';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1 MB
const ALLOWED_MIME_PREFIXES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const AVATAR_BASE_URL = getEnv('AVATAR_BASE_URL', 'http://localhost:9000/tutorhub');

/** 异步删除 MinIO 中的头像文件（失败仅日志，不影响主流程） */
function deleteAvatarFile(objectKey: string): void {
  s3Client
    .send(new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey }))
    .catch((err) => console.error('Failed to delete avatar file:', err));
}

function addAvatarUrl<T extends { avatarKey: string | null }>(item: T) {
  const { avatarKey, ...rest } = item;
  return {
    ...rest,
    avatarUrl: avatarKey ? `${AVATAR_BASE_URL}/${avatarKey}` : null,
  };
}

function addAvatarUrlToList<T extends { avatarKey: string | null }>(items: T[]) {
  return items.map(addAvatarUrl);
}

/** 校验 objectKey 路径格式是否合法 */
function isValidAvatarPath(objectKey: string, userId: string): boolean {
  const pattern = new RegExp(`^student-avatar/${userId}/[a-f0-9-]+\\.webp$`);
  return pattern.test(objectKey);
}

export const studentService = {
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
      throw new ApiError(400, 'INVALID_AVATAR_PATH', 'Invalid avatar path format');
    }

    // 3) 查询对象信息（校验文件是否存在、大小、MIME）
    let head;
    try {
      head = await s3Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: objectKey }));
    } catch {
      throw new ApiError(404, 'AVATAR_NOT_FOUND', 'Avatar file not found, please re-upload');
    }

    // 4) 校验文件大小
    if (head.ContentLength != null && head.ContentLength > MAX_FILE_SIZE) {
      deleteAvatarFile(objectKey);
      throw new ApiError(413, 'FILE_TOO_LARGE', 'Avatar file size must not exceed 1MB');
    }

    // 5) 校验 MIME 类型
    const contentType = head.ContentType ?? '';
    if (!ALLOWED_MIME_PREFIXES.some((p) => contentType.startsWith(p))) {
      deleteAvatarFile(objectKey);
      throw new ApiError(400, 'INVALID_CONTENT_TYPE', 'Invalid avatar file type');
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
    };
  },

  async list(query: z.infer<typeof studentListSchema>, userId: string) {
    const take = query.limit + 1;

    // 基础 where 条件：归属用户 + 未删除
    const baseWhere: NonNullable<Parameters<typeof prisma.student.findMany>[0]>['where'] = {
      userId,
      deletedAt: null,
      ...(query.name ? { name: { contains: query.name, mode: 'insensitive' } } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    // offset 分页 — 直接跳过前 N 条
    if (query.offset !== undefined) {
      const [dbItems, total] = await Promise.all([
        prisma.student.findMany({
          where: baseWhere,
          orderBy: { createdAt: 'desc' },
          take: query.limit,
          skip: query.offset,
        }),
        prisma.student.count({ where: baseWhere }),
      ]);

      const items = addAvatarUrlToList(dbItems);
      const lastItem = items.at(-1);
      const hasMore = query.offset + query.limit < total;

      return {
        items,
        nextCursor: hasMore && lastItem ? lastItem.id : null,
        total,
      };
    }

    // cursor 分页
    const [dbItems, total] = await Promise.all([
      prisma.student.findMany({
        where: baseWhere,
        orderBy: { createdAt: 'desc' },
        take,
        ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
      }),
      prisma.student.count({ where: baseWhere }),
    ]);

    const hasMore = dbItems.length > query.limit;
    const result = hasMore ? dbItems.slice(0, query.limit) : dbItems;
    const items = addAvatarUrlToList(result);
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor, total };
  },

  async getById(id: string, userId: string) {
    const student = await prisma.student.findFirst({ where: { id, userId, deletedAt: null } });

    if (!student) {
      throw new ApiError(404, 'STUDENT_NOT_FOUND', 'Student not found');
    }

    return addAvatarUrl(student);
  },

  async create(input: z.infer<typeof studentCreateSchema>, userId: string) {
    const { avatarKey, ...rest } = input;

    const data: Record<string, unknown> = { ...rest, userId };
    if (avatarKey) {
      data.avatarKey = avatarKey;
    }

    const student = await prisma.student.create({
      data: data as Parameters<typeof prisma.student.create>[0]['data'],
    });

    return addAvatarUrl(student);
  },

  async update(id: string, input: z.infer<typeof studentUpdateSchema>, userId: string) {
    const { avatarKey, ...rest } = input;

    // 如果传入了新 avatarKey，先查出旧头像 key
    let oldAvatarKey: string | null = null;
    if (avatarKey) {
      const existing = await prisma.student.findFirst({
        where: { id, userId },
        select: { avatarKey: true },
      });
      oldAvatarKey = existing?.avatarKey ?? null;
    }

    const data: Record<string, unknown> = { ...rest };
    if (avatarKey) {
      data.avatarKey = avatarKey;
    }

    const student = await prisma.student.update({
      where: { id, userId },
      data: data as Parameters<typeof prisma.student.update>[0]['data'],
    });

    // 头像 key 变化 → 删除旧文件
    if (oldAvatarKey && oldAvatarKey !== avatarKey) {
      deleteAvatarFile(oldAvatarKey);
    }

    return addAvatarUrl(student);
  },

  async delete(id: string, userId: string) {
    // 先查出旧头像 key
    const existing = await prisma.student.findFirst({
      where: { id, userId },
      select: { avatarKey: true },
    });
    const oldAvatarKey = existing?.avatarKey ?? null;

    const student = await prisma.student.update({
      where: { id, userId },
      data: { deletedAt: new Date() },
    });

    // 删除头像文件
    if (oldAvatarKey) {
      deleteAvatarFile(oldAvatarKey);
    }

    return addAvatarUrl(student);
  },
};
