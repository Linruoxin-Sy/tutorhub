import { ApiError } from '@/shared/api-error';

interface PrismaErrorLike {
  code?: string;
  meta?: {
    target?: unknown;
  };
}

const isPrismaErrorLike = (error: unknown): error is PrismaErrorLike => {
  return typeof error === 'object' && error !== null && 'code' in error;
};

export const translatePrismaWriteError = (error: unknown, entityCode: string): never => {
  if (isPrismaErrorLike(error)) {
    if (error.code === 'P2002') {
      throw new ApiError(409, `${entityCode}_CONFLICT`, `${entityCode} already exists`, error.meta);
    }

    if (error.code === 'P2025') {
      throw new ApiError(404, `${entityCode}_NOT_FOUND`, `${entityCode} not found`);
    }
  }

  throw error;
};
