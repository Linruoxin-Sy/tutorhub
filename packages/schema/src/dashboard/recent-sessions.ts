/** Dashboard 展示的最近课程 */
export type DashboardRecentSession = {
  /** 临时生成的唯一 ID（ruleId_occurrenceDate） */
  id: string;
  /** 课程名称 */
  courseName: string;
  /** 课程 ID */
  courseId: string;
  /** 规则 ID */
  ruleId: string;
  /** 关联的学生姓名列表 */
  studentNames: string[];
  /** 上课日期（YYYY-MM-DD） */
  date: string;
  /** 开始时间（HH:mm） */
  startTime: string;
  /** 结束时间（HH:mm） */
  endTime: string;
  /** 状态 */
  status: 'ongoing' | 'upcoming';
};
