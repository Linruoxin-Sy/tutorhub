import rrulePkg, { type Options as RRuleOptions } from 'rrule';

import type { DashboardRecentSession, DashboardResponse } from '@tutorhub/schema';

import { prisma } from '@/shared/prisma';

const { RRule } = rrulePkg;

/** 获取 HH:mm 格式的时间字符串（从 Prisma Time 类型的 Date 中提取） */
function timeToString(d: Date): string {
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

/** 计算两个 HH:mm 之间的时长（小时，保留 1 位小数） */
function durationHours(startStr: string, endStr: string): number {
  const [sh, sm] = startStr.split(':').map(Number);
  const [eh, em] = endStr.split(':').map(Number);
  return Math.round(((eh * 60 + em - (sh * 60 + sm)) / 60) * 10) / 10;
}

/** 生成上课日期列表（最多 maxDays 天） */
function generateOccurrenceDates(
  startDate: Date,
  intervalDays?: number,
  endDate?: Date | null,
  maxDays = 730,
): Date[] {
  if (!intervalDays) {
    return [startDate];
  }

  const rruleOptions: Partial<RRuleOptions> = {
    freq: RRule.DAILY,
    interval: intervalDays,
    dtstart: new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())),
  };

  if (endDate) {
    rruleOptions.until = new Date(
      Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate()),
    );
  }

  const rule = new RRule(rruleOptions);
  const maxDate = endDate ?? new Date(startDate.getTime() + maxDays * 24 * 60 * 60 * 1000);
  return rule.between(startDate, maxDate, true);
}

function toMinutes(t: string): number {
  const parts = t.split(':').map(Number);
  return parts[0] * 60 + (parts[1] ?? 0);
}

export const dashboardService = {
  async getDashboard(userId: string): Promise<DashboardResponse> {
    // ── 并行查询基础统计 ──
    const [activeStudents, activeCourses] = await Promise.all([
      prisma.student.count({
        where: { userId, status: 'ACTIVE', deletedAt: null },
      }),
      prisma.course.count({
        where: { userId, status: 'ACTIVE', deletedAt: null },
      }),
    ]);

    // ── 查询所有 ClassRule + 关联数据 ──
    const rules = await prisma.classRule.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, name: true } },
      },
    });

    // 查询所有规则下的 override
    const ruleIds = rules.map((r) => r.id);
    const overrides = await prisma.classSessionOverride.findMany({
      where: { classRuleId: { in: ruleIds } },
    });

    // 构建已取消日期集合: Set<"ruleId_YYYY-MM-DD">
    const cancelledSet = new Set<string>();
    // 构建调课映射: Map<"ruleId_YYYY-MM-DD", { startTime, endTime, rescheduledDate? }>
    const rescheduledMap = new Map<
      string,
      { startTime: string; endTime: string; rescheduledDate?: string }
    >();

    for (const ov of overrides) {
      const key = `${ov.classRuleId}_${ov.originalDate.toISOString().slice(0, 10)}`;
      if (ov.state === 'CANCELLED') {
        cancelledSet.add(key);
      } else if (ov.state === 'RESCHEDULED') {
        rescheduledMap.set(key, {
          startTime: ov.rescheduledStartTime ? timeToString(ov.rescheduledStartTime) : '',
          endTime: ov.rescheduledEndTime ? timeToString(ov.rescheduledEndTime) : '',
          rescheduledDate: ov.rescheduledDate
            ? ov.rescheduledDate.toISOString().slice(0, 10)
            : undefined,
        });
      }
    }

    // 查询所有规则下的学生名单（按 courseId 分组，取该课程下所有学生）
    // 先从 ClassRuleStudent 获取规则-学生关系
    const classRuleStudents = await prisma.classRuleStudent.findMany({
      where: { classRuleId: { in: ruleIds }, deletedAt: null },
      include: { student: { select: { name: true } } },
    });

    // 构建 ruleId → studentNames 映射
    const ruleStudentMap = new Map<string, string[]>();
    for (const crs of classRuleStudents) {
      const names = ruleStudentMap.get(crs.classRuleId) ?? [];
      names.push(crs.student.name);
      ruleStudentMap.set(crs.classRuleId, names);
    }

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    // ── 计算总课时和总收入 ──
    let totalHours = 0;
    let totalIncome = 0;

    for (const rule of rules) {
      const startTimeStr = timeToString(rule.startTime);
      const endTimeStr = timeToString(rule.endTime);
      const price = Number(rule.price);

      // 生成从 startDate 到今天的所有 occurrence
      const today = new Date(todayStr + 'T00:00:00');
      const pastDates = generateOccurrenceDates(
        rule.startDate,
        rule.intervalDays ?? undefined,
        rule.endDate ?? undefined,
      ).filter((d) => d <= today);

      for (const date of pastDates) {
        const dateStr = date.toISOString().slice(0, 10);
        const key = `${rule.id}_${dateStr}`;

        // 跳过已取消
        if (cancelledSet.has(key)) continue;

        // 获取实际时间（有调课则用调课后时间）
        const override = rescheduledMap.get(key);
        const actualStart = override?.startTime ?? startTimeStr;
        const actualEnd = override?.endTime ?? endTimeStr;
        const actualDuration = durationHours(actualStart, actualEnd);

        // 查找是否有 priceOverride
        const priceOverride = overrides.find(
          (ov) =>
            ov.classRuleId === rule.id &&
            ov.originalDate.toISOString().slice(0, 10) === dateStr &&
            ov.priceOverride !== null,
        );
        const sessionPrice = priceOverride ? Number(priceOverride.priceOverride) : price;

        totalHours += actualDuration;
        totalIncome += sessionPrice;
      }
    }

    // 保留 1 位小数
    totalHours = Math.round(totalHours * 10) / 10;
    totalIncome = Math.round(totalIncome * 10) / 10;

    // ── 获取最近 4 个 upcoming / ongoing session ──
    const upcomingSessions: DashboardRecentSession[] = [];

    for (const rule of rules) {
      const startTimeStr = timeToString(rule.startTime);
      const endTimeStr = timeToString(rule.endTime);
      const studentNames = ruleStudentMap.get(rule.id) ?? [];

      // 生成从今天开始的未来 occurrence
      const today = new Date(todayStr + 'T00:00:00');
      const futureDates = generateOccurrenceDates(
        rule.startDate,
        rule.intervalDays ?? undefined,
        rule.endDate ?? undefined,
        365,
      ).filter((d) => d >= today);

      for (const date of futureDates) {
        const dateStr = date.toISOString().slice(0, 10);
        const key = `${rule.id}_${dateStr}`;

        // 跳过已取消
        if (cancelledSet.has(key)) continue;

        // 获取实际时间
        const override = rescheduledMap.get(key);
        const actualDate = override?.rescheduledDate ?? dateStr;
        const actualStart = override?.startTime ?? startTimeStr;
        const actualEnd = override?.endTime ?? endTimeStr;

        const sessionStartMinutes = toMinutes(actualStart);
        const sessionEndMinutes = toMinutes(actualEnd);

        // 判断状态
        let status: 'ongoing' | 'upcoming';
        if (actualDate < todayStr) {
          // 调课到今天的已过去日期，跳过
          continue;
        } else if (
          actualDate === todayStr &&
          nowMinutes >= sessionStartMinutes &&
          nowMinutes < sessionEndMinutes
        ) {
          status = 'ongoing';
        } else if (actualDate === todayStr && nowMinutes < sessionStartMinutes) {
          status = 'upcoming';
        } else if (actualDate > todayStr) {
          status = 'upcoming';
        } else {
          // 已经过去的 session 不展示
          continue;
        }

        upcomingSessions.push({
          id: `${rule.id}_${dateStr}`,
          courseName: rule.course.name,
          courseId: rule.course.id,
          ruleId: rule.id,
          studentNames,
          date: actualDate,
          startTime: actualStart,
          endTime: actualEnd,
          status,
        });
      }
    }

    // 按 (date, startTime) 升序排序，取前 4
    upcomingSessions.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
    const recentSessions = upcomingSessions.slice(0, 4);

    return {
      activeStudents,
      activeCourses,
      totalHours,
      totalIncome,
      recentSessions,
    };
  },
};
