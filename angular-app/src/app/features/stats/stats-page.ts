import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PRIORITIES, PRIORITY_LABELS, type Priority, type Task } from '../../core/models/models';
import { NoteService } from '../../core/services/note.service';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { TaskService } from '../../core/services/task.service';
import { dueLabel } from '../../core/utils/date.util';
import { isOverdue } from '../../core/utils/filter.util';
import { Icon } from '../../shared/components/icon';

@Component({
  selector: 'app-stats-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  templateUrl: './stats-page.html',
})
export class StatsPage {
  private readonly tasks = inject(TaskService);
  private readonly notes = inject(NoteService);
  protected readonly dialog = inject(TaskDialogService);

  protected readonly priorities = PRIORITIES;
  protected readonly priorityLabels = PRIORITY_LABELS;
  protected readonly stats = this.tasks.stats;
  protected readonly notesCount = computed(() => this.notes.activeNotes().length);
  protected readonly overdueTasks = computed(() =>
    this.tasks.activeTasks().filter((task) => isOverdue(task)).slice(0, 6),
  );
  protected readonly maxWeekly = computed(() =>
    Math.max(1, ...this.stats().weekly.map((day) => Math.max(day.created, day.completed))),
  );

  protected priorityPercent(priority: Priority): number {
    const stats = this.stats();
    return stats.total === 0 ? 0 : Math.round((stats.byPriority[priority] / stats.total) * 100);
  }

  protected barHeight(value: number): number {
    return Math.round((value / this.maxWeekly()) * 100);
  }

  protected deadline(task: Task): string {
    return dueLabel(task.dueDate);
  }
}
