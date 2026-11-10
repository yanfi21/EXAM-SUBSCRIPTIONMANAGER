import { useEffect, useMemo, useState } from 'react';
import { PRIORITY_WEIGHT, type Task } from '../../domain/models';
import { dueLabel } from '../../lib/date';
import { fetchQuoteOfTheDay, localQuoteOfTheDay, type Quote } from '../../lib/quotes';
import { Icon } from '../ui/Icon';

interface TaskOfTheDayProps {
  tasks: Task[];
  onOpen: (task: Task) => void;
}

function pickTask(tasks: Task[]): Task | null {
  const candidates = tasks.filter((task) => !task.deletedAt && task.status !== 'done');
  if (candidates.length === 0) {
    return null;
  }
  return [...candidates].sort((a, b) => {
    const left = a.dueDate ?? '9999-12-31';
    const right = b.dueDate ?? '9999-12-31';
    if (left !== right) {
      return left.localeCompare(right);
    }
    return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  })[0];
}

export function TaskOfTheDay({ tasks, onOpen }: TaskOfTheDayProps) {
  const [quote, setQuote] = useState<Quote>(() => localQuoteOfTheDay());
  const task = useMemo(() => pickTask(tasks), [tasks]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    fetchQuoteOfTheDay(controller.signal).then((result) => {
      if (active) {
        setQuote(result);
      }
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, []);

  return (
    <section className="card flex flex-col gap-3 bg-brand-soft/70 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <span className="label flex items-center gap-1.5 text-brand">
          <Icon name="sparkles" size={14} />
          Задача дня
        </span>
        {task ? (
          <button
            type="button"
            onClick={() => onOpen(task)}
            className="mt-1 cursor-pointer text-left text-base font-bold break-words text-ink hover:text-brand"
          >
            {task.title}
          </button>
        ) : (
          <p className="mt-1 text-base font-bold text-ink">Все задачи выполнены</p>
        )}
        <p className="muted mt-0.5 text-xs">
          {task ? dueLabel(task.dueDate) : 'Самое время добавить новую цель'}
        </p>
      </div>
      <figure className="max-w-sm border-l-2 border-brand/40 pl-3 sm:text-right">
        <blockquote className="text-sm text-ink italic">«{quote.content}»</blockquote>
        <figcaption className="muted mt-1 text-xs">— {quote.author}</figcaption>
      </figure>
    </section>
  );
}
