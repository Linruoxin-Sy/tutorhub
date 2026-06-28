import type { PrismaClient } from '../prisma/generated/client';

/**
 * 检查数据库连接是否正常。
 * 执行一次轻量查询（SELECT 1），成功返回 true，失败抛出异常。
 */
export async function checkDatabaseConnection(prisma: PrismaClient): Promise<boolean> {
  await prisma.$queryRawUnsafe('SELECT 1');
  return true;
}
