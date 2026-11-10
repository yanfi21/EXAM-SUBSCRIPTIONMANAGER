import { CdkDrag, CdkDropList, CdkDropListGroup, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { STATUSES, STATUS_LABELS, type Task, type TaskStatus } from '../../core/models/models';
import { PreferencesService } from '../../core/services/preferences.service';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { TaskService } from '../../core/services/task.service';
import { ToastService } from '../../core/services/toast.service';
import { dueLabel } from '../../core/utils/date.util';
import { isOverdue } from '../../core/utils/filter.util';
import { Icon } from '../../shared/components/icon';
import { DueBadge, PriorityBadge } from '../../shared/components/task-badges';

@Component({
  selector: 'app-task-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CdkDropListGroup, CdkDropList, CdkDrag, Icon, PriorityBadge, DueBadge],
  templateUrl: './task-board.html',
})
export class TaskBoard {
  protected readonly tasks = inject(TaskService);
  protected readonly dialog = inject(TaskDialogService);
  private readonly toasts = inject(ToastService);
  private readonly preferences = inject(PreferencesService);

  protected readonly statuses = STATUSES;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly columns = this.tasks.columns;

  constructor() {
    this.preferences.setView('board');
  }

  protected isOverdue(task: Task): boolean {
    return isOverdue(task);
  }

  protected deadline(task: Task): string {
    return dueLabel(task.dueDate);
  }

  protected drop(event: CdkDragDrop<Task[]>, status: TaskStatus): void {
    const task = event.item.data as Task;
    const target = event.container.data.filter((item) => item.id !== task.id);
    const before = target[event.currentIndex] ?? null;
    this.tasks.move(task.id, before ? before.id : null, status);
  }

  protected remove(task: Task): void {
    this.tasks.softDelete(task.id);
    this.toasts.show('Задача перемещена в корзину', {
      label: 'Вернуть',
      run: () => this.tasks.restore(task.id),
    });
  }
}
