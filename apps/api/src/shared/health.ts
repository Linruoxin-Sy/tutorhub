import { HeadBucketCommand, type S3Client } from '@aws-sdk/client-s3';

/**
 * 检查 S3（MinIO）对象存储连接是否正常。
 * 通过 HeadBucket 验证 bucket 可达性，成功返回 true，失败抛出异常。
 */
export async function checkStorageConnection(
  s3Client: S3Client,
  bucketName: string,
): Promise<boolean> {
  await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
  return true;
}
