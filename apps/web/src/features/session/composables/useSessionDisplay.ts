import { computed } from 'vue';

import type { SessionStatus } from '@tutorhub/schema';

// ─── Types ───────────────────────────────────────────────

export interface DisplayBadge {
  key: string;
  label: string;
  icon: string;
  /** Class object for the badge container span */
  class: Record<string, boolean>;
}

export interface SessionDisplayState {
  /** Card-level classes (border color, opacity) */
  cardClass: Record<string, boolean>;

  /** Left icon container */
  iconContainerClass: Record<string, boolean>;
  iconClass: string;

  /** Shared course name */
  courseName: string;

  /** Layout branch */
  mode: 'normal' | 'rescheduled';

  // ── Normal mode ──
  normalTitleClass: Record<string, boolean>;
  normalDateClass: Record<string, boolean>;
  normalTimeClass: Record<string, boolean>;
  normalDate: string;
  normalStartTime: string;
  normalEndTime: string;
  normalBadges: DisplayBadge[];

  // ── Rescheduled mode ──
  originalTitleClass: Record<string, boolean>;
  originalDateClass: Record<string, boolean>;
  originalTimeClass: Record<string, boolean>;
  originalDate: string;
  originalStartTime: string;
  originalEndTime: string;
  newTitleClass: Record<string, boolean>;
  newDateClass: Record<string, boolean>;
  newTimeClass: Record<string, boolean>;
  newDate: string;
  newStartTime: string;
  newEndTime: string;
  rescheduledBadges: DisplayBadge[];

  // ── Cross-cutting ──
  showConflictBadge: boolean;
  visibleActions: ('change' | 'edit')[];
  showActions: boolean;
}

export interface SessionItemProps {
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: SessionStatus;
  originalDate?: string | null;
  originalStartTime?: string | null;
  originalEndTime?: string | null;
  actions?: ('change' | 'edit')[];
  conflict?: boolean;
}

// ─── Composable ─────────────────────────────────────────

export function useSessionDisplay(props: {
  courseName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  originalDate: string | null;
  originalStartTime: string | null;
  originalEndTime: string | null;
  actions: ('change' | 'edit')[];
  conflict: boolean;
}) {
  const isRescheduledCompleted = computed(() => {
    if (props.status !== 'rescheduled') return false;
    const newEnd = props.originalEndTime || props.endTime;
    const end = new Date(`${props.date} ${newEnd}`);
    return end < new Date();
  });

  const isRescheduledOngoing = computed(() => {
    if (props.status !== 'rescheduled') return false;
    if (isRescheduledCompleted.value) return false;
    const newStart = props.originalStartTime || props.startTime;
    const newEnd = props.originalEndTime || props.endTime;
    const start = new Date(`${props.date} ${newStart}`);
    const end = new Date(`${props.date} ${newEnd}`);
    const now = new Date();
    return now >= start && now < end;
  });

  const display = computed<SessionDisplayState>(() => {
    const { status, conflict } = props;
    const isCancelled = status === 'cancelled';
    const isOngoing = status === 'ongoing';
    const isCompleted = status === 'completed';
    const isRescheduled = status === 'rescheduled';

    // ── Icon ──
    let iconClass: string;
    let iconContainerClass: Record<string, boolean>;

    if (isCancelled) {
      iconContainerClass = { 'bg-red-100 dark:bg-red-900/20': true };
      iconClass = 'i-lucide-x-circle size-6 text-red-500 dark:text-red-400';
    } else if (isOngoing) {
      iconContainerClass = { 'bg-green-100 dark:bg-green-900/20': true };
      iconClass = 'i-lucide-play-circle size-6 text-green-600 dark:text-green-400';
    } else if (isCompleted) {
      iconContainerClass = { 'bg-gray-100 dark:bg-[#2c2c2c]': true };
      iconClass = 'i-lucide-check-circle size-6 text-gray-400 dark:text-gray-500';
    } else {
      iconContainerClass = { 'bg-gray-100 dark:bg-[#2c2c2c]': true };
      iconClass = 'i-lucide-calendar-days size-6 text-gray-500 dark:text-gray-400';
    }

    // ── Card ──
    const cardClass: Record<string, boolean> = {};
    if (conflict) cardClass['border-amber-300 dark:border-amber-700'] = true;
    if (isCancelled) cardClass['opacity-60'] = true;

    // ── Style helpers ──
    const strikeClass: Record<string, boolean> = {
      'text-gray-400 line-through dark:text-gray-500': true,
    };

    // ── Normal mode ──
    const normalTitleClass = isCancelled ? strikeClass : { 'text-gray-900 dark:text-white': true };
    const normalDateClass = isCancelled
      ? strikeClass
      : { 'text-gray-700 dark:text-gray-300': true };
    const normalTimeClass = isCancelled
      ? strikeClass
      : { 'text-gray-500 dark:text-gray-400': true };

    const normalBadges: DisplayBadge[] = [];
    if (isCancelled) {
      normalBadges.push({
        key: 'cancelled',
        label: 'Cancelled',
        icon: 'i-lucide-x-circle size-3',
        class: {
          'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400': true,
        },
      });
    }
    if (isOngoing) {
      normalBadges.push({
        key: 'ongoing',
        label: 'Ongoing',
        icon: 'i-lucide-play size-3',
        class: {
          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400': true,
        },
      });
    }
    if (isCompleted) {
      normalBadges.push({
        key: 'completed',
        label: 'Completed',
        icon: 'i-lucide-check-circle size-3',
        class: {
          'bg-gray-100 dark:bg-[#2c2c2c] text-gray-500 dark:text-gray-400': true,
        },
      });
    }

    // ── Rescheduled mode ──
    const rescheduledBadges: DisplayBadge[] = [
      {
        key: 'rescheduled',
        label: 'Rescheduled',
        icon: 'i-lucide-rotate-ccw size-3',
        class: {
          'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400': true,
        },
      },
    ];
    if (isRescheduledCompleted.value) {
      rescheduledBadges.push({
        key: 'completed',
        label: 'Completed',
        icon: 'i-lucide-check-circle size-3',
        class: {
          'bg-gray-100 dark:bg-[#2c2c2c] text-gray-500 dark:text-gray-400': true,
        },
      });
    } else if (isRescheduledOngoing.value) {
      rescheduledBadges.push({
        key: 'ongoing',
        label: 'Ongoing',
        icon: 'i-lucide-play size-3',
        class: {
          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400': true,
        },
      });
    }

    return {
      cardClass,
      iconContainerClass,
      iconClass,
      courseName: props.courseName,
      mode: isRescheduled ? 'rescheduled' : 'normal',

      normalTitleClass,
      normalDateClass,
      normalTimeClass,
      normalDate: props.date,
      normalStartTime: props.startTime,
      normalEndTime: props.endTime,
      normalBadges,

      originalTitleClass: strikeClass,
      originalDateClass: strikeClass,
      originalTimeClass: strikeClass,
      originalDate: props.originalDate || props.date,
      originalStartTime: props.startTime,
      originalEndTime: props.endTime,
      newTitleClass: { 'text-amber-700 dark:text-amber-400': true },
      newDateClass: { 'text-amber-700 dark:text-amber-400': true },
      newTimeClass: { 'text-amber-700 dark:text-amber-400': true },
      newDate: props.date,
      newStartTime: props.originalStartTime || props.startTime,
      newEndTime: props.originalEndTime || props.endTime,
      rescheduledBadges,

      showConflictBadge: conflict,
      visibleActions: props.actions,
      showActions: props.actions.length > 0,
    };
  });

  return { display, isRescheduledCompleted };
}
