import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  PRIORITY_WEIGHT,
  SCHEMA_VERSION,
  STATUSES,
  type Task,
  type TaskDraft,
  type TaskStatus,
} from '../models/models';
import { normalizeTask } from '../utils/backup.util';
import { buildDemoTasks } from '../utils/demo.util';
import { collectTags, selectTasks } from '../utils/filter.util';
import { createId } from '../utils/id.util';
import { buildStats } from '../utils/stats.util';
import { PreferencesService } from './preferences.service';
import { STORAGE_KEYS, StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly storage = inject(StorageService);
  private readonly preferences = inject(PreferencesService);

  private readonly state = signal<Task[]>(this.load());

  readonly tasks = this.state.asReadonly();
  readonly activeTasks = computed(() => this.state().filter((task) => !task.deletedAt));
  readonly deletedTasks = computed(() =>
    this.state()
      .filter((task) => task.deletedAt)
      .sort((a, b) => (b.deletedAt ?? '').localeCompare(a.deletedAt ?? '')),
  );
  readonly visibleTasks = computed(() => selectTasks(this.state(), this.preferences.filters()));
  readonly availableTags = computed(() => collectTags(this.state()));
  readonly stats = computed(() => buildStats(this.state()));
  readonly openCount = computed(
    () => this.activeTasks().filter((task) => task.status !== 'done').length,
  );
  readonly columns = computed<Record<TaskStatus, Task[]>>(() => {
    const visible = this.visibleTasks();
    return STATUSES.reduce(
      (acc, status) => ({ ...acc, [status]: visible.filter((task) => task.status === status) }),
      {} as Record<TaskStatus, Task[]>,
    );
  });
  readonly taskOfTheDay = computed<Task | null>(() => {
    const candidates = this.activeTasks().filter((task) => task.status !== 'done');
    if (candidates.length === 0) {
      return null;
    }
    return [...candidates].sort((a, b) => {
      const left = a.dueDate ?? '9999-12-31';
      const right = b.dueDate ?? '9999-12-31';
      if (left !== right) {
        return left.localeCompare(right);
      }
      return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    })[0];
  });

  constructor() {
    effect(() => {
      this.storage.write(STORAGE_KEYS.tasks, this.state());
      this.storage.write(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION);
    });
  }

  create(draft: TaskDraft): Task {
    const now = new Date().toISOString();
    const task: Task = {
      id: createId('task'),
      title: draft.title.trim(),
      description: draft.description.trim(),
      priority: draft.priority,
      status: draft.status,
      dueDate: draft.dueDate,
      tags: draft.tags,
      createdAt: now,
      updatedAt: now,
      completedAt: draft.status === 'done' ? now : null,
      deletedAt: null,
    };
    this.state.update((tasks) => [task, ...tasks]);
    return task;
  }

  update(id: string, patch: Partial<TaskDraft>): void {
    const now = new Date().toISOString();
    this.state.update((tasks) =>
      tasks.map((task) => {
        if (task.id !== id) {
          return task;
        }
        const next: Task = { ...task, ...patch, updatedAt: now };
        if (patch.status && patch.status !== task.status) {
          return this.applyCompletion(next, patch.status, now);
        }
        return next;
      }),
    );
  }

  setStatus(id: string, status: TaskStatus): void {
    const now = new Date().toISOString();
    this.state.update((tasks) =>
      tasks.map((task) => (task.id === id ? this.applyCompletion(task, status, now) : task)),
    );
  }

  toggle(id: string): void {
    const task = this.state().find((item) => item.id === id);
    if (!task) {
      return;
    }
    this.setStatus(id, task.status === 'done' ? 'todo' : 'done');
  }

  move(activeId: string, beforeId: string | null, status: TaskStatus): void {
    const now = new Date().toISOString();
    this.state.update((tasks) => {
      const next = tasks.map((task) =>
        task.id === activeId && task.status !== status
          ? this.applyCompletion(task, status, now)
          : task,
      );
      const fromIndex = next.findIndex((task) => task.id === activeId);
      if (fromIndex < 0) {
        return next;
      }
      const [moved] = next.splice(fromIndex, 1);
      const toIndex = beforeId ? next.findIndex((task) => task.id === beforeId) : -1;
      if (toIndex < 0) {
        next.push(moved);
      } else {
        next.splice(toIndex, 0, moved);
      }
      return next;
    });
  }

  softDelete(id: string): void {
    const now = new Date().toISOString();
    this.state.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, deletedAt: now, updatedAt: now } : task)),
    );
  }

  restore(id: string): void {
    const now = new Date().toISOString();
    this.state.update((tasks) =>
      tasks.map((task) => (task.id === id ? { ...task, deletedAt: null, updatedAt: now } : task)),
    );
  }

  purge(id: string): void {
    this.state.update((tasks) => tasks.filter((task) => task.id !== id));
  }

  purgeDeleted(): void {
    this.state.update((tasks) => tasks.filter((task) => !task.deletedAt));
  }

  replaceAll(tasks: Task[]): void {
    this.state.set(tasks);
  }

  mergeAll(tasks: Task[]): void {
    this.state.update((current) => {
      const map = new Map(current.map((task) => [task.id, task]));
      tasks.forEach((task) => map.set(task.id, task));
      return [...map.values()];
    });
  }

  loadDemo(): void {
    this.state.set(buildDemoTasks());
  }

  clear(): void {
    this.state.set([]);
  }

  private applyCompletion(task: Task, status: TaskStatus, now: string): Task {
    return {
      ...task,
      status,
      completedAt: status === 'done' ? (task.completedAt ?? now) : null,
      updatedAt: now,
    };
  }

  private load(): Task[] {
    if (!this.storage.has(STORAGE_KEYS.tasks)) {
      return buildDemoTasks();
    }
    const raw = this.storage.read<unknown[]>(STORAGE_KEYS.tasks, []);
    return Array.isArray(raw)
      ? raw.map(normalizeTask).filter((task): task is Task => task !== null)
      : [];
  }
}
