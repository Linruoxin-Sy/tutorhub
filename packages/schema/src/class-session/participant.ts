import { z } from 'zod';

/** 添加参与者 */
export const participantCreateSchema = z.object({
  classSessionId: z.string().min(1, 'classSessionId is required'),
  studentId: z.string().min(1, 'studentId is required'),
});

export type ParticipantCreateRequest = z.infer<typeof participantCreateSchema>;

/** 移除参与者参数 */
export const participantDeleteParamsSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
  participantId: z.string().min(1, 'participantId is required'),
});
