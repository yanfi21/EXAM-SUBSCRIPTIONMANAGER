import { PRIORITIES, type Priority, type Task } from '../models/models';
import { addDays, startOfWeek, toDateKey, withinLastDays } from './date.util';
import { isOverdue } from './filter.util';

export interface DailyPoint {
  date: string;
  label: string;
  created: number;
  completed: number;
}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  dueToday: number;
  completedThisWeek: number;
  completedThisMonth: number;
  completionRate: number;
  byPriority: Record<Priority, number>;
  topTags: Array<{ tag: string; count: number }>;
  weekly: DailyPoint[];
}

export function buildStats(tasks: Task[], now: Date = new Date()): TaskStats {
  const active = tasks.filter((task) => !task.deletedAt);
  const today = toDateKey(now);
  const byPriority = PRIORITIES.reduce(
    (acc, priority) => ({ ...acc, [priority]: 0 }),
    {} as Record<Priority, number>,
  );
  const tagCounter = new Map<string, number>();

  active.forEach((task) => {
    byPriority[task.priority] += 1;
    task.tags.forEach((tag) => tagCounter.set(tag, (tagCounter.get(tag) ?? 0) + 1));
  });

  const done = active.filter((task) => task.status === 'done');
  const weekStart = startOfWeek(now);
  const weekly: DailyPoint[] = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(weekStart, index);
    const key = toDateKey(day);
    return {
      date: key,
      label: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][index],
      created: active.filter((task) => toDateKey(task.createdAt) === key).length,
      completed: active.filter((task) => task.completedAt && toDateKey(task.completedAt) === key)
        .length,
    };
  });

  return {
    total: active.length,
    todo: active.filter((task) => task.status === 'todo').length,
    inProgress: active.filter((task) => task.status === 'in-progress').length,
    done: done.length,
    overdue: active.filter((task) => isOverdue(task, now)).length,
    dueToday: active.filter((task) => task.dueDate === today && task.status !== 'done').length,
    completedThisWeek: done.filter((task) => withinLastDays(task.completedAt, 7, now)).length,
    completedThisMonth: done.filter((task) => withinLastDays(task.completedAt, 30, now)).length,
    completionRate: active.length === 0 ? 0 : Math.round((done.length / active.length) * 100),
    byPriority,
    topTags: [...tagCounter.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ru'))
      .slice(0, 8),
    weekly,
  };
}
