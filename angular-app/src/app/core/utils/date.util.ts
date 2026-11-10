const DAY_MS = 24 * 60 * 60 * 1000;

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const monthTitleFormatter = new Intl.DateTimeFormat('ru-RU', {
  month: 'long',
  year: 'numeric',
});

export const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function toDateKey(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey(now: Date = new Date()): string {
  return toDateKey(now);
}

export function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  return dateFormatter.format(parsed);
}

export function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  return dateTimeFormatter.format(parsed);
}

export function formatMonthTitle(date: Date): string {
  const title = monthTitleFormatter.format(date);
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function daysUntil(dueDate: string, now: Date = new Date()): number {
  const due = new Date(`${dueDate}T00:00:00`);
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - base.getTime()) / DAY_MS);
}

export function dueLabel(dueDate: string | null, now: Date = new Date()): string {
  if (!dueDate) {
    return 'Без срока';
  }
  const diff = daysUntil(dueDate, now);
  if (diff === 0) {
    return 'Сегодня';
  }
  if (diff === 1) {
    return 'Завтра';
  }
  if (diff === -1) {
    return 'Вчера';
  }
  if (diff < 0) {
    return `Просрочено на ${Math.abs(diff)} дн.`;
  }
  if (diff <= 7) {
    return `Через ${diff} дн.`;
  }
  return formatDate(dueDate);
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const weekday = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - weekday);
  return result;
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + amount);
  return result;
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function buildCalendarGrid(month: Date): Date[] {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const gridStart = startOfWeek(firstDay);
  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function withinLastDays(value: string | null, days: number, now: Date = new Date()): boolean {
  if (!value) {
    return false;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return false;
  }
  const diff = now.getTime() - parsed.getTime();
  return diff >= 0 && diff <= days * DAY_MS;
}
