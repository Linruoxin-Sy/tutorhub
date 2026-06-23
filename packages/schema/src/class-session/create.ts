import { z } from 'zod';

import type { ClassSession } from '@tutorhub/database';

import { classSessionFields } from './class-session';

export const classSessionCreateSchema = z.object({
  classRuleId: classSessionFields.classRuleId,
  courseId: classSessionFields.courseId,
  occurrenceDate: classSessionFields.occurrenceDate,
  startTime: classSessionFields.startTime,
  endTime: classSessionFields.endTime,
  state: classSessionFields.state.optional(),
  rescheduledDate: classSessionFields.rescheduledDate.optional(),
  rescheduledStartTime: classSessionFields.rescheduledStartTime.optional(),
  rescheduledEndTime: classSessionFields.rescheduledEndTime.optional(),
  reason: classSessionFields.reason.optional(),
  room: classSessionFields.room.optional(),
  /** 创建时同时添加参与的学生 ID 列表 */
  participantStudentIds: z.array(z.string().min(1)).optional(),
});

export type ClassSessionCreateResponse = ClassSession;
