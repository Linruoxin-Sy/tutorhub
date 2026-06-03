import 'dotenv/config';
import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/generated/client';
import { env } from 'prisma/config';

loadEnv({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const connectionString = env('DATABASE_URL');

const adapter = new PrismaPg({ connectionString });
export const prisma = new PrismaClient({ adapter });
