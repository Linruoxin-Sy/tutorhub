// import 'dotenv/config';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { PrismaClient } from '@prisma-client';
// import { env } from 'prisma/config';

// const connectionString = env('DATABASE_URL');

// const adapter = new PrismaPg({ connectionString });
// export const prisma = new PrismaClient({ adapter });

export { prisma } from '@tutorhub/database';
