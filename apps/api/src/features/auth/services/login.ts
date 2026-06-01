import type { LoginInput } from '@/features/auth/schemas/login';
import { prisma } from '@/shared/prisma';

export async function loginService(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });
  return user;
}
