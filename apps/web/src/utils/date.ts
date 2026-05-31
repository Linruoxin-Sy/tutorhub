import dayjs from 'dayjs';

export function formatDate(value: string | Date | null | undefined) {
  if (!value) {
    return '-';
  }

  return dayjs(value).format('YYYY-MM-DD');
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return '-';
  }

  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

export function formatTime(value: string | Date | null | undefined) {
  if (!value) {
    return '-';
  }

  return dayjs(value).format('HH:mm');
}
