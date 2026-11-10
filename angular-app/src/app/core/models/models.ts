export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type ViewMode = 'list' | 'board' | 'calendar';

export type ThemeMode = 'light' | 'dark';

export type SortField = 'createdAt' | 'dueDate' | 'priority' | 'title' | 'status';

export type SortDirection = 'asc' | 'desc';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  deletedAt: string | null;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Feedback {
  id: string;
  name: string;
  email: string;
  rating: number;
  message: string;
  createdAt: string;
}

export interface TaskFilters {
  search: string;
  status: TaskStatus | 'all';
  priority: Priority | 'all';
  tags: string[];
  onlyOverdue: boolean;
  sortBy: SortField;
  sortDir: SortDirection;
}

export interface Preferences {
  view: ViewMode;
  theme: ThemeMode;
  filters: TaskFilters;
}

export interface AppSnapshot {
  schemaVersion: number;
  exportedAt: string;
  tasks: Task[];
  notes: Note[];
  feedback: Feedback[];
  preferences: Preferences;
}

export interface TaskDraft {
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null;
  tags: string[];
}

export interface NoteDraft {
  title: string;
  content: string;
}

export const SCHEMA_VERSION = 1;

export const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export const STATUSES: TaskStatus[] = ['todo', 'in-progress', 'done'];

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  'in-progress': 'В работе',
  done: 'Выполнено',
};

export const PRIORITY_WEIGHT: Record<Priority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export const STATUS_WEIGHT: Record<TaskStatus, number> = {
  todo: 1,
  'in-progress': 2,
  done: 3,
};

export const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  tags: [],
  onlyOverdue: false,
  sortBy: 'createdAt',
  sortDir: 'desc',
};

export const DEFAULT_PREFERENCES: Preferences = {
  view: 'list',
  theme: 'light',
  filters: DEFAULT_FILTERS,
};

export const SUPPORT_EMAIL = 'support@tasknotes.app';
