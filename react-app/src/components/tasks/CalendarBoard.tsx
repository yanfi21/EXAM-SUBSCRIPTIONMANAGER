import { useMemo, useState } from 'react';
import type { Task } from '../../domain/models';
import {
  WEEKDAY_LABELS,
  addMonths,
  buildCalendarGrid,
  formatDate,
  formatMonthTitle,
  isSameMonth,
  toDateKey,
  todayKey,
} from '../../lib/date';
import { isOverdue } from '../../lib/filters';
import { Icon } from '../ui/Icon';
import { PriorityBadge, StatusBadge } from './TaskBadges';

interface CalendarBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onCreate: (dueDate: string) => void;
}

export function CalendarBoard({ tasks, onEdit, onCreate }: CalendarBoardProps) {
  const [month, setMonth] = useState(() => new Date());
  const [selected, setSelected] = useState(() => todayKey());

  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach((task) => {
      if (!task.dueDate) {
        return;
      }
      const list = map.get(task.dueDate) ?? [];
      list.push(task);
      map.set(task.dueDate, list);
    });
    return map;
  }, [tasks]);

  const grid = useMemo(() => buildCalendarGrid(month), [month]);
  const withoutDue = useMemo(() => tasks.filter((task) => !task.dueDate), [tasks]);
  const selectedTasks = byDate.get(selected) ?? [];
  const today = todayKey();

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <section className="card p-3 sm:p-4">
        <header className="mb-3 flex items-center justify-between gap-2">
          <h3 className="section-title">{formatMonthTitle(month)}</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="btn btn-soft btn-sm"
              onClick={() => setMonth(addMonths(month, -1))}
              aria-label="Предыдущий месяц"
            >
              <Icon name="chevronLeft" size={15} />
            </button>
            <button
              type="button"
              className="btn btn-soft btn-sm"
              onClick={() => {
                setMonth(new Date());
                setSelected(today);
              }}
            >
              Сегодня
            </button>
            <button
              type="button"
              className="btn btn-soft btn-sm"
              onClick={() => setMonth(addMonths(month, 1))}
              aria-label="Следующий месяц"
            >
              <Icon name="chevronRight" size={15} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label} className="label py-1">
              {label}
            </span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((day) => {
            const key = toDateKey(day);
            const dayTasks = byDate.get(key) ?? [];
            const outside = !isSameMonth(day, month);
            const isToday = key === today;
            const isSelected = key === selected;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(key)}
                onDoubleClick={() => onCreate(key)}
                className={`flex min-h-[72px] cursor-pointer flex-col gap-1 rounded-xl border p-1.5 text-left transition sm:min-h-[92px] ${
                  isSelected ? 'border-brand bg-brand-soft/60' : 'border-border bg-surface hover:border-brand'
                } ${outside ? 'opacity-45' : ''}`}
              >
                <span
                  className={`text-xs font-semibold ${isToday ? 'text-brand' : 'text-muted'}`}
                >
                  {day.getDate()}
                </span>
                <span className="flex flex-col gap-0.5">
                  {dayTasks.slice(0, 2).map((task) => (
                    <span
                      key={task.id}
                      className={`truncate rounded-md px-1 py-0.5 text-[10px] font-medium ${
                        task.status === 'done'
                          ? 'bg-success-soft text-success line-through'
                          : isOverdue(task)
                            ? 'bg-danger-soft text-danger'
                            : 'bg-subtle text-ink'
                      }`}
                    >
                      {task.title}
                    </span>
                  ))}
                  {dayTasks.length > 2 ? (
                    <span className="text-[10px] text-muted">ещё {dayTasks.length - 2}</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="flex flex-col gap-4">
        <section className="card p-4">
          <header className="mb-3 flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-ink">{formatDate(selected)}</h3>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onCreate(selected)}>
              <Icon name="plus" size={14} />
              Задача
            </button>
          </header>
          {selectedTasks.length === 0 ? (
            <p className="muted text-sm">На этот день задач нет.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {selectedTasks.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="w-full cursor-pointer rounded-xl border border-border p-2.5 text-left transition hover:border-brand"
                  >
                    <span className="block text-sm font-semibold text-ink">{task.title}</span>
                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {withoutDue.length > 0 ? (
          <section className="card p-4">
            <h3 className="mb-2 text-sm font-bold text-ink">Без дедлайна ({withoutDue.length})</h3>
            <ul className="flex flex-col gap-1.5">
              {withoutDue.slice(0, 6).map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => onEdit(task)}
                    className="muted w-full cursor-pointer truncate text-left hover:text-brand"
                  >
                    {task.title}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
