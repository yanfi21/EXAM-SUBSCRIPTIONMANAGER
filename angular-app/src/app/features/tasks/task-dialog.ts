import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Priority,
  type TaskStatus,
} from '../../core/models/models';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { TaskService } from '../../core/services/task.service';
import { ToastService } from '../../core/services/toast.service';
import { parseTags } from '../../core/utils/filter.util';
import { Modal } from '../../shared/components/modal';

@Component({
  selector: 'app-task-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Modal],
  templateUrl: './task-dialog.html',
})
export class TaskDialog {
  private readonly fb = inject(FormBuilder);
  private readonly tasks = inject(TaskService);
  private readonly toasts = inject(ToastService);
  protected readonly dialog = inject(TaskDialogService);

  protected readonly priorities = PRIORITIES;
  protected readonly statuses = STATUSES;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly statusLabels = STATUS_LABELS;

  protected readonly editing = computed(() => this.dialog.dialog().task !== null);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(160)]],
    description: ['', [Validators.maxLength(2000)]],
    priority: ['medium' as Priority, [Validators.required]],
    status: ['todo' as TaskStatus, [Validators.required]],
    dueDate: [''],
    tags: [''],
  });

  constructor() {
    effect(() => {
      const state = this.dialog.dialog();
      if (!state.open) {
        return;
      }
      this.form.reset({
        title: state.task?.title ?? '',
        description: state.task?.description ?? '',
        priority: state.task?.priority ?? 'medium',
        status: state.task?.status ?? state.status,
        dueDate: state.task?.dueDate ?? state.dueDate ?? '',
        tags: state.task?.tags.join(', ') ?? '',
      });
    });
  }

  protected invalid(control: 'title' | 'description'): boolean {
    const field = this.form.controls[control];
    return field.invalid && (field.dirty || field.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const draft = {
      title: value.title.trim(),
      description: value.description.trim(),
      priority: value.priority,
      status: value.status,
      dueDate: value.dueDate ? value.dueDate : null,
      tags: parseTags(value.tags),
    };
    const current = this.dialog.dialog().task;
    if (current) {
      this.tasks.update(current.id, draft);
      this.toasts.show('Задача обновлена');
    } else {
      this.tasks.create(draft);
      this.toasts.show('Задача создана');
    }
    this.dialog.close();
  }
}
