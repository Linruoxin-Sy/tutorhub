import dayjs from 'dayjs';

import type { SessionStatus } from '@tutorhub/schema';

/**
 * 根据 session 的日期、时间与当前时间，计算 ongoing / completed / default 状态。
 *
 * @param date   - 上课日期，格式 YYYY-MM-DD
 * @param startTime - 开始时间，格式 HH:mm
 * @param endTime   - 结束时间，格式 HH:mm
 * @param now       - 当前时间（默认 new Date()）
 */
export function computeSessionStatus(
  date: string,
  startTime: string,
  endTime: string,
  now: Date = new Date(),
): SessionStatus {
  const sessionStart = dayjs(`${date} ${startTime}`, 'YYYY-MM-DD HH:mm');
  const sessionEnd = dayjs(`${date} ${endTime}`, 'YYYY-MM-DD HH:mm');
  const current = dayjs(now);

  if (current.isBefore(sessionStart)) return 'default';
  if (current.isAfter(sessionEnd)) return 'completed';
  return 'ongoing';
}
