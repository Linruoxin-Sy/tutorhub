import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3';
import { getEnv } from '@/shared/getEnv';

const endpoint = getEnv('MINIO_ENDPOINT', 'localhost:9000');
const accessKeyId = getEnv('MINIO_ACCESS_KEY', 'admin');
const secretAccessKey = getEnv('MINIO_SECRET_KEY', 'admin');
const bucketName = getEnv('MINIO_BUCKET', 'tutorhub');

export const s3Client = new S3Client({
  endpoint: `http://${endpoint}`,
  region: 'us-east-1',
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
});

export { bucketName };

/** 设置 bucket 为公开可读（头像等静态文件需要） */
async function setBucketPublic(): Promise<void> {
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: '*',
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${bucketName}/*`],
      },
    ],
  };

  await s3Client.send(
    new PutBucketPolicyCommand({
      Bucket: bucketName,
      Policy: JSON.stringify(policy),
    }),
  );

  console.log(`Bucket "${bucketName}" is now publicly readable.`);
}

/** 确保 bucket 存在并设置公开读权限（应用启动时调用） */
export async function ensureBucket(): Promise<void> {
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch {
    await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`Bucket "${bucketName}" created.`);
  }

  // 每次启动都确保 bucket 公开读策略存在（幂等）
  try {
    await setBucketPublic();
  } catch (err) {
    console.error('Failed to set bucket public policy:', err);
  }
}
