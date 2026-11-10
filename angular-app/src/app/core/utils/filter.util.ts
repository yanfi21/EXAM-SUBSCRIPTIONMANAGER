import {
  PRIORITY_WEIGHT,
  STATUS_WEIGHT,
  type SortDirection,
  type SortField,
  type Task,
  type TaskFilters,
} from '../models/models';
import { todayKey } from './date.util';

export function isOverdue(task: Task, now: Date = new Date()): boolean {
  if (!task.dueDate || task.status === 'done' || task.deletedAt) {
    return false;
  }
  return task.dueDate < todayKey(now);
}

export function matchesSearch(task: Task, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) {
    return true;
  }
  const haystack = `${task.title} ${task.description} ${task.tags.join(' ')}`.toLowerCase();
  return query
    .split(/\s+/)
    .every((token) => haystack.includes(token));
}

export function matchesFilters(task: Task, filters: TaskFilters, now: Date = new Date()): boolean {
  if (filters.status !== 'all' && task.status !== filters.status) {
    return false;
  }
  if (filters.priority !== 'all' && task.priority !== filters.priority) {
    return false;
  }
  if (filters.tags.length > 0 && !filters.tags.every((tag) => task.tags.includes(tag))) {
    return false;
  }
  if (filters.onlyOverdue && !isOverdue(task, now)) {
    return false;
  }
  return matchesSearch(task, filters.search);
}

function compareBy(field: SortField, a: Task, b: Task): number {
  switch (field) {
    case 'title':
      return a.title.localeCompare(b.title, 'ru');
    case 'priority':
      return PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
    case 'status':
      return STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
    case 'dueDate': {
      const left = a.dueDate ?? '9999-12-31';
      const right = b.dueDate ?? '9999-12-31';
      return left.localeCompare(right);
    }
    default:
      return a.createdAt.localeCompare(b.createdAt);
  }
}

export function sortTasks(tasks: Task[], field: SortField, direction: SortDirection): Task[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...tasks].sort((a, b) => {
    const primary = compareBy(field, a, b);
    if (primary !== 0) {
      return primary * factor;
    }
    return a.createdAt.localeCompare(b.createdAt) * -1;
  });
}

export function selectTasks(tasks: Task[], filters: TaskFilters, now: Date = new Date()): Task[] {
  const active = tasks.filter((task) => !task.deletedAt && matchesFilters(task, filters, now));
  return sortTasks(active, filters.sortBy, filters.sortDir);
}

export function collectTags(tasks: Task[]): string[] {
  const unique = new Set<string>();
  tasks
    .filter((task) => !task.deletedAt)
    .forEach((task) => task.tags.forEach((tag) => unique.add(tag)));
  return [...unique].sort((a, b) => a.localeCompare(b, 'ru'));
}

export function parseTags(value: string): string[] {
  return [
    ...new Set(
      value
        .split(/[,\n]/)
        .map((tag) => tag.trim().replace(/^#/, '').toLowerCase())
        .filter((tag) => tag.length > 0),
    ),
  ].slice(0, 12);
}
