import { STATUS_LABELS, STATUSES, type Task } from '../../domain/models';
import { dueLabel, formatDateTime } from '../../lib/date';
import { isOverdue } from '../../lib/filters';
import { Icon } from '../ui/Icon';
import { DueBadge, PriorityBadge } from './TaskBadges';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (id: string, status: Task['status']) => void;
  onTagClick?: (tag: string) => void;
}

export function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onStatusChange,
  onTagClick,
}: TaskCardProps) {
  const overdue = isOverdue(task);
  const done = task.status === 'done';

  return (
    <article className={`card p-4 transition hover:shadow-md ${done ? 'opacity-75' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-pressed={done}
          aria-label={done ? 'Отметить как невыполненную' : 'Отметить как выполненную'}
          className={`mt-0.5 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg border transition ${
            done ? 'border-success bg-success text-white' : 'border-border text-transparent hover:border-brand'
          }`}
        >
          <Icon name="check" size={14} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={`text-sm font-semibold break-words text-ink ${done ? 'line-through' : ''}`}
            >
              {task.title}
            </h3>
            <PriorityBadge priority={task.priority} />
            {task.dueDate ? <DueBadge label={dueLabel(task.dueDate)} overdue={overdue} /> : null}
          </div>

          {task.description ? (
            <p className="muted mt-1.5 line-clamp-3 whitespace-pre-line">{task.description}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {task.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className="chip cursor-pointer hover:border-brand hover:text-brand"
                onClick={() => onTagClick?.(tag)}
              >
                #{tag}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => onStatusChange(task.id, status)}
                  className={`chip cursor-pointer ${task.status === status ? 'chip-active' : ''}`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              <span className="muted hidden text-xs sm:inline">
                {formatDateTime(task.updatedAt)}
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onEdit(task)}
                aria-label="Редактировать задачу"
              >
                <Icon name="edit" size={15} />
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm text-danger"
                onClick={() => onDelete(task)}
                aria-label="Удалить задачу"
              >
                <Icon name="trash" size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
