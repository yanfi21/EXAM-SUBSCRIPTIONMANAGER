import { ChangeDetectionStrategy, Component, OnInit, computed, inject } from '@angular/core';
import { QuoteService } from '../../core/services/quote.service';
import { TaskDialogService } from '../../core/services/task-dialog.service';
import { TaskService } from '../../core/services/task.service';
import { dueLabel } from '../../core/utils/date.util';
import { Icon } from '../../shared/components/icon';

@Component({
  selector: 'app-task-of-the-day',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <section
      class="card flex flex-col gap-3 bg-brand-soft/70 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="min-w-0">
        <span class="label flex items-center gap-1.5 text-brand">
          <app-icon name="sparkles" [size]="14" />
          Задача дня
        </span>
        @if (task(); as current) {
          <button
            type="button"
            class="mt-1 cursor-pointer text-left text-base font-bold break-words text-ink hover:text-brand"
            (click)="dialog.openEdit(current)"
          >
            {{ current.title }}
          </button>
          <p class="muted mt-0.5 text-xs">{{ deadline() }}</p>
        } @else {
          <p class="mt-1 text-base font-bold text-ink">Все задачи выполнены</p>
          <p class="muted mt-0.5 text-xs">Самое время добавить новую цель</p>
        }
      </div>
      <figure class="max-w-sm border-l-2 border-brand/40 pl-3 sm:text-right">
        <blockquote class="text-sm text-ink italic">«{{ quotes.quote().content }}»</blockquote>
        <figcaption class="muted mt-1 text-xs">— {{ quotes.quote().author }}</figcaption>
      </figure>
    </section>
  `,
})
export class TaskOfTheDay implements OnInit {
  private readonly tasks = inject(TaskService);
  protected readonly quotes = inject(QuoteService);
  protected readonly dialog = inject(TaskDialogService);

  protected readonly task = this.tasks.taskOfTheDay;
  protected readonly deadline = computed(() => dueLabel(this.task()?.dueDate ?? null));

  ngOnInit(): void {
    this.quotes.load();
  }
}
