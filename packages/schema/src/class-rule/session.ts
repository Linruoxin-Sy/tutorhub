/** Session 状态：取消 | 调课 | 进行中 | 已完成 | 未开始（默认） */
export type SessionStatus = 'cancelled' | 'rescheduled' | 'ongoing' | 'completed' | 'default';

/** 由 class-rule 生成的具体上课课程 */
export type GeneratedSession = {
  /** 临时生成的唯一 ID */
  id: string;
  /** 该次上课的原始日期（rrule 生成的日期） */
  occurrenceDate: string;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime: string;
  /** 当前状态 */
  status: SessionStatus;
  /** 是否有调课覆盖 */
  overridden?: boolean;
  /** 调课后的新日期 */
  rescheduledDate?: string | null;
  /** 调课后的新开始时间 */
  rescheduledStartTime?: string | null;
  /** 调课后的新结束时间 */
  rescheduledEndTime?: string | null;
};
