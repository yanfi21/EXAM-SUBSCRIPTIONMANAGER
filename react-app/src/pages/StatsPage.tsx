import { useMemo } from 'react';
import { PRIORITIES, PRIORITY_LABELS } from '../domain/models';
import { dueLabel } from '../lib/date';
import { isOverdue } from '../lib/filters';
import { buildStats } from '../lib/stats';
import { useAppStore } from '../store/useAppStore';
import { useTaskDialog } from '../components/tasks/TaskDialog';
import { Icon, type IconName } from '../components/ui/Icon';

interface MetricProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: IconName;
  tone?: 'brand' | 'success' | 'danger' | 'warn';
}

const TONES = {
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  danger: 'bg-danger-soft text-danger',
  warn: 'bg-warn-soft text-warn',
};

function Metric({ label, value, hint, icon, tone = 'brand' }: MetricProps) {
  return (
    <article className="card flex items-center gap-3 p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONES[tone]}`}>
        <Icon name={icon} size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-bold text-ink">{value}</p>
        <p className="muted truncate text-xs">{label}</p>
        {hint ? <p className="muted truncate text-[11px]">{hint}</p> : null}
      </div>
    </article>
  );
}

export function StatsPage() {
  const tasks = useAppStore((store) => store.tasks);
  const notes = useAppStore((store) => store.notes);
  const { openEdit } = useTaskDialog();
  const stats = useMemo(() => buildStats(tasks), [tasks]);
  const maxWeekly = Math.max(1, ...stats.weekly.map((day) => Math.max(day.created, day.completed)));
  const overdueTasks = useMemo(
    () => tasks.filter((task) => isOverdue(task)).slice(0, 6),
    [tasks],
  );
  const activeNotes = notes.filter((note) => !note.deletedAt).length;

  return (
    <div className="flex flex-col gap-4">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Всего задач" value={stats.total} icon="list" hint={`Заметок: ${activeNotes}`} />
        <Metric
          label="Выполнено"
          value={stats.done}
          icon="check"
          tone="success"
          hint={`${stats.completionRate}% от всех задач`}
        />
        <Metric
          label="Просрочено"
          value={stats.overdue}
          icon="alert"
          tone="danger"
          hint={`Сегодня к сдаче: ${stats.dueToday}`}
        />
        <Metric
          label="В работе"
          value={stats.inProgress}
          icon="clock"
          tone="warn"
          hint={`К выполнению: ${stats.todo}`}
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <article className="card p-4">
          <h3 className="section-title mb-3">Выполнено за период</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-2xl font-bold text-ink">{stats.completedThisWeek}</p>
              <p className="muted text-xs">за последние 7 дней</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-2xl font-bold text-ink">{stats.completedThisMonth}</p>
              <p className="muted text-xs">за последние 30 дней</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="label mb-2">Текущая неделя</p>
            <div className="flex h-36 items-end justify-between gap-2">
              {stats.weekly.map((day) => (
                <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
                  <div className="flex h-28 w-full items-end justify-center gap-1">
                    <span
                      className="w-2.5 rounded-t bg-brand/40"
                      style={{ height: `${(day.created / maxWeekly) * 100}%` }}
                      title={`Создано: ${day.created}`}
                    />
                    <span
                      className="w-2.5 rounded-t bg-success"
                      style={{ height: `${(day.completed / maxWeekly) * 100}%` }}
                      title={`Выполнено: ${day.completed}`}
                    />
                  </div>
                  <span className="muted text-[11px]">{day.label}</span>
                </div>
              ))}
            </div>
            <div className="muted mt-2 flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-brand/40" /> создано
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded bg-success" /> выполнено
              </span>
            </div>
          </div>
        </article>

        <article className="card p-4">
          <h3 className="section-title mb-3">Распределение</h3>
          <p className="label mb-2">По приоритету</p>
          <div className="flex flex-col gap-2">
            {PRIORITIES.map((priority) => {
              const value = stats.byPriority[priority];
              const percent = stats.total === 0 ? 0 : Math.round((value / stats.total) * 100);
              return (
                <div key={priority} className="flex items-center gap-3">
                  <span className="muted w-20 text-xs">{PRIORITY_LABELS[priority]}</span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-subtle">
                    <span
                      className="block h-full rounded-full bg-brand"
                      style={{ width: `${percent}%` }}
                    />
                  </span>
                  <span className="w-10 text-right text-xs font-semibold text-ink">{value}</span>
                </div>
              );
            })}
          </div>

          <p className="label mt-4 mb-2">Популярные теги</p>
          {stats.topTags.length === 0 ? (
            <p className="muted text-sm">Теги ещё не использовались.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {stats.topTags.map((item) => (
                <span key={item.tag} className="chip">
                  #{item.tag} · {item.count}
                </span>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="card p-4">
        <h3 className="section-title mb-3">Просроченные задачи</h3>
        {overdueTasks.length === 0 ? (
          <p className="muted text-sm">Просроченных задач нет — отличная работа!</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {overdueTasks.map((task) => (
              <li key={task.id}>
                <button
                  type="button"
                  onClick={() => openEdit(task)}
                  className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-border px-3 py-2 text-left transition hover:border-danger"
                >
                  <span className="truncate text-sm font-medium text-ink">{task.title}</span>
                  <span className="badge bg-danger-soft text-danger">{dueLabel(task.dueDate)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
