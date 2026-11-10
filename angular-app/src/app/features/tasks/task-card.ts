import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { STATUSES, STATUS_LABELS, type Task, type TaskStatus } from '../../core/models/models';
import { PreferencesService } from '../../core/services/preferences.service';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { TaskService } from '../../core/services/task.service';
import { ToastService } from '../../core/services/toast.service';
import { dueLabel, formatDateTime } from '../../core/utils/date.util';
import { isOverdue } from '../../core/utils/filter.util';
import { Icon } from '../../shared/components/icon';
import { DueBadge, PriorityBadge } from '../../shared/components/task-badges';

@Component({
  selector: 'app-task-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PriorityBadge, DueBadge],
  templateUrl: './task-card.html',
})
export class TaskCard {
  private readonly tasks = inject(TaskService);
  private readonly toasts = inject(ToastService);
  protected readonly dialog = inject(TaskDialogService);
  protected readonly preferences = inject(PreferencesService);

  readonly task = input.required<Task>();

  protected readonly statuses = STATUSES;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly done = computed(() => this.task().status === 'done');
  protected readonly overdue = computed(() => isOverdue(this.task()));
  protected readonly deadline = computed(() => dueLabel(this.task().dueDate));
  protected readonly updated = computed(() => formatDateTime(this.task().updatedAt));

  protected toggle(): void {
    this.tasks.toggle(this.task().id);
  }

  protected setStatus(status: TaskStatus): void {
    this.tasks.setStatus(this.task().id, status);
  }

  protected remove(): void {
    const id = this.task().id;
    this.tasks.softDelete(id);
    this.toasts.show('Задача перемещена в корзину', {
      label: 'Вернуть',
      run: () => this.tasks.restore(id),
    });
  }
}
