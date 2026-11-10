import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Priority,
  type SortField,
  type TaskStatus,
} from '../../core/models/models';
import { PreferencesService } from '../../core/services/preferences.service';
import { TaskService } from '../../core/services/task.service';
import { Icon } from '../../shared/components/icon';

const SORT_LABELS: Record<SortField, string> = {
  createdAt: 'По дате создания',
  dueDate: 'По дедлайну',
  priority: 'По приоритету',
  title: 'По названию',
  status: 'По статусу',
};

@Component({
  selector: 'app-task-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './task-filters.html',
})
export class TaskFilters {
  private readonly tasksService = inject(TaskService);
  protected readonly preferences = inject(PreferencesService);

  protected readonly priorities = PRIORITIES;
  protected readonly statuses = STATUSES;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly statusLabels = STATUS_LABELS;
  protected readonly sortLabels = SORT_LABELS;
  protected readonly sortFields = Object.keys(SORT_LABELS) as SortField[];
  protected readonly availableTags = this.tasksService.availableTags;
  protected readonly resultCount = this.tasksService.visibleTasks;

  protected onSearch(value: string): void {
    this.preferences.patchFilters({ search: value });
  }

  protected onStatus(value: string): void {
    this.preferences.patchFilters({ status: value as TaskStatus | 'all' });
  }

  protected onPriority(value: string): void {
    this.preferences.patchFilters({ priority: value as Priority | 'all' });
  }

  protected onSortField(value: string): void {
    this.preferences.patchFilters({ sortBy: value as SortField });
  }

  protected toggleDirection(): void {
    this.preferences.patchFilters({
      sortDir: this.preferences.filters().sortDir === 'asc' ? 'desc' : 'asc',
    });
  }

  protected toggleOverdue(): void {
    this.preferences.patchFilters({ onlyOverdue: !this.preferences.filters().onlyOverdue });
  }
}
