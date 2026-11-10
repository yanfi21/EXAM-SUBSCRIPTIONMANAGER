import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Priority,
  type TaskStatus,
} from '../../core/models/models';

const PRIORITY_CLASS: Record<Priority, string> = {
  low: 'bg-subtle text-muted',
  medium: 'bg-warn-soft text-warn',
  high: 'bg-danger-soft text-danger',
};

const STATUS_CLASS: Record<TaskStatus, string> = {
  todo: 'bg-subtle text-muted',
  'in-progress': 'bg-brand-soft text-brand',
  done: 'bg-success-soft text-success',
};

@Component({
  selector: 'app-priority-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="badge" [class]="styleClass()">
      <span class="text-[10px]">●</span>
      {{ label() }}
    </span>
  `,
})
export class PriorityBadge {
  readonly priority = input.required<Priority>();
  protected readonly label = computed(() => PRIORITY_LABELS[this.priority()]);
  protected readonly styleClass = computed(() => PRIORITY_CLASS[this.priority()]);
}

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: ` <span class="badge" [class]="styleClass()">{{ label() }}</span> `,
})
export class StatusBadge {
  readonly status = input.required<TaskStatus>();
  protected readonly label = computed(() => STATUS_LABELS[this.status()]);
  protected readonly styleClass = computed(() => STATUS_CLASS[this.status()]);
}

@Component({
  selector: 'app-due-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="badge"
      [class]="overdue() ? 'bg-danger-soft text-danger' : 'bg-subtle text-muted'"
      >{{ label() }}</span
    >
  `,
})
export class DueBadge {
  readonly label = input.required<string>();
  readonly overdue = input(false);
}
