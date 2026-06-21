/** 由 class-rule 生成的具体上课课程 */
export type GeneratedSession = {
  /** 该次上课的原始日期（rrule 生成的日期） */
  occurrenceDate: string;
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime: string;
  /** 是否有调课覆盖 */
  overridden?: boolean;
  /** 调课后的新日期 */
  rescheduledDate?: string | null;
  /** 调课后的新开始时间 */
  rescheduledStartTime?: string | null;
  /** 调课后的新结束时间 */
  rescheduledEndTime?: string | null;
};
