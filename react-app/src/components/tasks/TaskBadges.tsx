import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type Priority,
  type TaskStatus,
} from '../../domain/models';

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

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`badge ${PRIORITY_CLASS[priority]}`}>
      <span className="text-[10px]">●</span>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return <span className={`badge ${STATUS_CLASS[status]}`}>{STATUS_LABELS[status]}</span>;
}

export function DueBadge({ label, overdue }: { label: string; overdue: boolean }) {
  return (
    <span className={`badge ${overdue ? 'bg-danger-soft text-danger' : 'bg-subtle text-muted'}`}>
      {label}
    </span>
  );
}
