import { Injectable, computed, signal } from '@angular/core';
import type { Task, TaskStatus } from '../models/models';

interface TaskDialogState {
  open: boolean;
  task: Task | null;
  status: TaskStatus;
  dueDate: string | null;
}

const CLOSED: TaskDialogState = { open: false, task: null, status: 'todo', dueDate: null };

@Injectable({ providedIn: 'root' })
export class TaskDialogService {
  private readonly state = signal<TaskDialogState>(CLOSED);

  readonly dialog = this.state.asReadonly();
  readonly isOpen = computed(() => this.state().open);

  openCreate(status: TaskStatus = 'todo', dueDate: string | null = null): void {
    this.state.set({ open: true, task: null, status, dueDate });
  }

  openEdit(task: Task): void {
    this.state.set({ open: true, task, status: task.status, dueDate: task.dueDate });
  }

  close(): void {
    this.state.set(CLOSED);
  }
}
