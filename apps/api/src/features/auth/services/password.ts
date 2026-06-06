import { createHash, randomBytes, timingSafeEqual } from 'crypto';

export const passwordService = {
  async generateSalt() {
    return randomBytes(16).toString('hex');
  },

  async hash(password: string, salt: string) {
    return createHash('sha256').update(`${salt}${password}`, 'utf8').digest('hex');
  },

  async verify(password: string, salt: string, passwordHash: string) {
    const hashedPassword = await passwordService.hash(password, salt);
    const hashedPasswordBuffer = Buffer.from(hashedPassword, 'hex');
    const passwordHashBuffer = Buffer.from(passwordHash, 'hex');

    if (hashedPasswordBuffer.length !== passwordHashBuffer.length) {
      return false;
    }

    return timingSafeEqual(hashedPasswordBuffer, passwordHashBuffer);
  },
};
