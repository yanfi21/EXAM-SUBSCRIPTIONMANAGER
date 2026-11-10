import {
  DEFAULT_PREFERENCES,
  PRIORITIES,
  SCHEMA_VERSION,
  STATUSES,
  type AppSnapshot,
  type Feedback,
  type Note,
  type Preferences,
  type Priority,
  type Task,
  type TaskStatus,
} from '../domain/models';
import { createId } from './id';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asIso(value: unknown, fallback: string): string {
  if (typeof value !== 'string') {
    return fallback;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

function asPriority(value: unknown): Priority {
  return PRIORITIES.includes(value as Priority) ? (value as Priority) : 'medium';
}

function asStatus(value: unknown, done: unknown): TaskStatus {
  if (STATUSES.includes(value as TaskStatus)) {
    return value as TaskStatus;
  }
  return done === true ? 'done' : 'todo';
}

function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.filter((tag): tag is string => typeof tag === 'string'))];
}

function asDueDate(value: unknown): string | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null;
  }
  return value.slice(0, 10);
}

export function normalizeTask(raw: unknown): Task | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }
  const source = raw as Record<string, unknown>;
  const title = asString(source['title']).trim();
  if (!title) {
    return null;
  }
  const createdAt = asIso(source['createdAt'], new Date().toISOString());
  const status = asStatus(source['status'], source['completed']);
  return {
    id: asString(source['id']) || createId('task'),
    title: title.slice(0, 160),
    description: asString(source['description']),
    priority: asPriority(source['priority']),
    status,
    dueDate: asDueDate(source['dueDate']),
    tags: asTags(source['tags']),
    createdAt,
    updatedAt: asIso(source['updatedAt'], createdAt),
    completedAt:
      status === 'done'
        ? asIso(source['completedAt'], asIso(source['updatedAt'], createdAt))
        : null,
    deletedAt: typeof source['deletedAt'] === 'string' ? asIso(source['deletedAt'], createdAt) : null,
  };
}

export function normalizeNote(raw: unknown): Note | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }
  const source = raw as Record<string, unknown>;
  const title = asString(source['title']).trim();
  const content = asString(source['content']);
  if (!title && !content) {
    return null;
  }
  const createdAt = asIso(source['createdAt'], new Date().toISOString());
  return {
    id: asString(source['id']) || createId('note'),
    title: (title || 'Без названия').slice(0, 160),
    content,
    createdAt,
    updatedAt: asIso(source['updatedAt'], createdAt),
    deletedAt: typeof source['deletedAt'] === 'string' ? asIso(source['deletedAt'], createdAt) : null,
  };
}

export function normalizeFeedback(raw: unknown): Feedback | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }
  const source = raw as Record<string, unknown>;
  const message = asString(source['message']).trim();
  if (!message) {
    return null;
  }
  const rating = Number(source['rating']);
  return {
    id: asString(source['id']) || createId('fb'),
    name: asString(source['name'], 'Аноним'),
    email: asString(source['email']),
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, Math.round(rating))) : 5,
    message,
    createdAt: asIso(source['createdAt'], new Date().toISOString()),
  };
}

export function normalizePreferences(raw: unknown): Preferences {
  if (typeof raw !== 'object' || raw === null) {
    return DEFAULT_PREFERENCES;
  }
  const source = raw as Record<string, unknown>;
  const filters = (source['filters'] ?? {}) as Record<string, unknown>;
  return {
    view:
      source['view'] === 'board' || source['view'] === 'calendar'
        ? (source['view'] as Preferences['view'])
        : 'list',
    theme: source['theme'] === 'dark' ? 'dark' : 'light',
    filters: {
      ...DEFAULT_PREFERENCES.filters,
      search: asString(filters['search']),
      status:
        filters['status'] === 'all' || STATUSES.includes(filters['status'] as TaskStatus)
          ? (filters['status'] as Preferences['filters']['status'])
          : 'all',
      priority:
        filters['priority'] === 'all' || PRIORITIES.includes(filters['priority'] as Priority)
          ? (filters['priority'] as Preferences['filters']['priority'])
          : 'all',
      tags: asTags(filters['tags']),
      onlyOverdue: filters['onlyOverdue'] === true,
      sortBy: (['createdAt', 'dueDate', 'priority', 'title', 'status'] as const).includes(
        filters['sortBy'] as never,
      )
        ? (filters['sortBy'] as Preferences['filters']['sortBy'])
        : 'createdAt',
      sortDir: filters['sortDir'] === 'asc' ? 'asc' : 'desc',
    },
  };
}

export function createSnapshot(
  tasks: Task[],
  notes: Note[],
  feedback: Feedback[],
  preferences: Preferences,
): AppSnapshot {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    tasks,
    notes,
    feedback,
    preferences,
  };
}

export interface ImportResult {
  snapshot: AppSnapshot;
  skipped: number;
}

export function parseSnapshot(payload: string): ImportResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    throw new Error('Файл не является корректным JSON');
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Структура файла не распознана');
  }
  const source = parsed as Record<string, unknown>;
  const rawTasks = Array.isArray(source['tasks']) ? source['tasks'] : [];
  const rawNotes = Array.isArray(source['notes']) ? source['notes'] : [];
  const rawFeedback = Array.isArray(source['feedback']) ? source['feedback'] : [];
  const tasks = rawTasks.map(normalizeTask).filter((task): task is Task => task !== null);
  const notes = rawNotes.map(normalizeNote).filter((note): note is Note => note !== null);
  const feedback = rawFeedback
    .map(normalizeFeedback)
    .filter((item): item is Feedback => item !== null);

  if (tasks.length === 0 && notes.length === 0) {
    throw new Error('В файле не найдено ни одной задачи или заметки');
  }

  return {
    snapshot: {
      schemaVersion: SCHEMA_VERSION,
      exportedAt: asIso(source['exportedAt'], new Date().toISOString()),
      tasks,
      notes,
      feedback,
      preferences: normalizePreferences(source['preferences']),
    },
    skipped: rawTasks.length - tasks.length + (rawNotes.length - notes.length),
  };
}

export function mergeById<T extends { id: string; updatedAt?: string }>(
  current: T[],
  incoming: T[],
): T[] {
  const map = new Map(current.map((item) => [item.id, item]));
  incoming.forEach((item) => {
    const existing = map.get(item.id);
    if (!existing) {
      map.set(item.id, item);
      return;
    }
    const existingTime = new Date(existing.updatedAt ?? 0).getTime();
    const incomingTime = new Date(item.updatedAt ?? 0).getTime();
    map.set(item.id, incomingTime >= existingTime ? item : existing);
  });
  return [...map.values()];
}

export function downloadSnapshot(snapshot: AppSnapshot, fileName: string): void {
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
