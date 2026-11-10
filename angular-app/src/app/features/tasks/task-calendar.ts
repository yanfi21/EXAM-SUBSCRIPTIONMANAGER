import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import type { Task } from '../../core/models/models';
import { PreferencesService } from '../../core/services/preferences.service';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { TaskService } from '../../core/services/task.service';
import {
  WEEKDAY_LABELS,
  addMonths,
  buildCalendarGrid,
  formatDate,
  formatMonthTitle,
  isSameMonth,
  toDateKey,
  todayKey,
} from '../../core/utils/date.util';
import { isOverdue } from '../../core/utils/filter.util';
import { Icon } from '../../shared/components/icon';
import { PriorityBadge, StatusBadge } from '../../shared/components/task-badges';

interface CalendarCell {
  key: string;
  day: number;
  outside: boolean;
  today: boolean;
  tasks: Task[];
}

@Component({
  selector: 'app-task-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PriorityBadge, StatusBadge],
  templateUrl: './task-calendar.html',
})
export class TaskCalendar {
  protected readonly tasks = inject(TaskService);
  protected readonly dialog = inject(TaskDialogService);
  private readonly preferences = inject(PreferencesService);

  protected readonly weekdays = WEEKDAY_LABELS;
  protected readonly month = signal(new Date());
  protected readonly selected = signal(todayKey());

  protected readonly monthTitle = computed(() => formatMonthTitle(this.month()));
  protected readonly selectedTitle = computed(() => formatDate(this.selected()));

  private readonly byDate = computed(() => {
    const map = new Map<string, Task[]>();
    this.tasks.visibleTasks().forEach((task) => {
      if (!task.dueDate) {
        return;
      }
      const list = map.get(task.dueDate) ?? [];
      list.push(task);
      map.set(task.dueDate, list);
    });
    return map;
  });

  protected readonly cells = computed<CalendarCell[]>(() => {
    const month = this.month();
    const today = todayKey();
    const map = this.byDate();
    return buildCalendarGrid(month).map((date) => {
      const key = toDateKey(date);
      return {
        key,
        day: date.getDate(),
        outside: !isSameMonth(date, month),
        today: key === today,
        tasks: map.get(key) ?? [],
      };
    });
  });

  protected readonly selectedTasks = computed(() => this.byDate().get(this.selected()) ?? []);
  protected readonly withoutDue = computed(() =>
    this.tasks.visibleTasks().filter((task) => !task.dueDate),
  );

  constructor() {
    this.preferences.setView('calendar');
  }

  protected shiftMonth(amount: number): void {
    this.month.set(addMonths(this.month(), amount));
  }

  protected goToday(): void {
    this.month.set(new Date());
    this.selected.set(todayKey());
  }

  protected isOverdue(task: Task): boolean {
    return isOverdue(task);
  }
}
