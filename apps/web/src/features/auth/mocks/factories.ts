import type { LoginResponse, RegisterResponse } from '@tutorhub/schema';

import { ulid } from '@/mocks/utils';

export function mockUser(overrides?: Partial<LoginResponse['user']>): LoginResponse['user'] {
  return {
    id: ulid(),
    name: 'Test User',
    email: 'test@example.com',
    phone: null,
    avatarUrl: null,
    currency: 'CNY',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    deletedAt: null,
    ...overrides,
  };
}

export function mockLoginResponse(overrides?: Partial<LoginResponse>): LoginResponse {
  return {
    user: mockUser(),
    accessToken: 'mock-access-token-abc123',
    ...overrides,
  };
}

export function mockRegisterResponse(overrides?: Partial<RegisterResponse>): RegisterResponse {
  return {
    ...mockUser(),
    ...overrides,
  };
}
