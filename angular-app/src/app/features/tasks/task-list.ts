import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PreferencesService } from '../../core/services/preferences.service';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { TaskService } from '../../core/services/task.service';
import { EmptyState } from '../../shared/components/empty-state';
import { TaskCard } from './task-card';

@Component({
  selector: 'app-task-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TaskCard, EmptyState],
  template: `
    @if (tasks.visibleTasks().length) {
      <section class="flex flex-col gap-2.5">
        @for (task of tasks.visibleTasks(); track task.id) {
          <app-task-card [task]="task" />
        }
      </section>
    } @else {
      <app-empty-state
        icon="list"
        title="Задачи не найдены"
        description="Измените условия поиска и фильтрации или создайте новую задачу."
      >
        <button type="button" class="btn btn-primary" (click)="dialog.openCreate()">
          Создать задачу
        </button>
      </app-empty-state>
    }
  `,
})
export class TaskList {
  protected readonly tasks = inject(TaskService);
  protected readonly dialog = inject(TaskDialogService);
  private readonly preferences = inject(PreferencesService);

  constructor() {
    this.preferences.setView('list');
  }
}
