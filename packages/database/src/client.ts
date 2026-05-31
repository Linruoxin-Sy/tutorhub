import { config as loadEnv } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../prisma/generated/client';

loadEnv({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

let prismaClient: PrismaClient | undefined;

const createPrismaClient = (): PrismaClient => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is required. Create packages/database/.env from .env.template or set DATABASE_URL before using prisma.',
    );
  }

  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({ adapter });
};

const getPrismaClient = (): PrismaClient => {
  prismaClient ??= createPrismaClient();

  return prismaClient;
};

const prisma = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getPrismaClient();
    const value = Reflect.get(client, property, client);

    if (typeof value === 'function') {
      return value.bind(client);
    }

    return value;
  },
  set(_target, property, value) {
    Reflect.set(getPrismaClient(), property, value);

    return true;
  },
}) as PrismaClient;

export { prisma };
