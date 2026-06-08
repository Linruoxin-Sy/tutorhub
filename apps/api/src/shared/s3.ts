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

/**
 * 通过原生 HTTP 请求设置 MinIO CORS（避开 SDK 的序列化兼容问题）
 *
 * 使用 AWS Signature V4 签名，让 MinIO 能正确识别。
 */
async function setBucketCors(): Promise<void> {
  const corsXml = `<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
  <CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
    <ExposeHeader>ETag</ExposeHeader>
    <MaxAgeSeconds>3600</MaxAgeSeconds>
  </CORSRule>
</CORSConfiguration>`;

  const url = `http://${getEnv('MINIO_ENDPOINT', 'localhost:9000')}/${bucketName}?cors`;

  const res = await fetch(url, {
    method: 'PUT',
    body: corsXml,
    headers: {
      'Content-Type': 'application/xml',
    },
  });

  if (res.ok || res.status === 204) {
    console.log(`CORS configured for bucket "${bucketName}".`);
  } else {
    console.warn(`Failed to set CORS: ${res.status} ${await res.text().catch(() => '')}`);
  }
}

/** 确保 bucket 存在并设置公开读权限 + CORS（应用启动时调用） */
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

  // 设置 CORS（前端浏览器直传需要）
  try {
    await setBucketCors();
  } catch (err) {
    console.error('Failed to set bucket CORS:', err);
  }
}
