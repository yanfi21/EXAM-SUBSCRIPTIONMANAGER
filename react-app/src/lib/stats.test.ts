import { describe, expect, it } from 'vitest';
import type { Task } from '../domain/models';
import { buildStats } from './stats';

const NOW = new Date('2026-03-12T12:00:00.000Z');

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task',
    title: 'Задача',
    description: '',
    priority: 'medium',
    status: 'todo',
    dueDate: null,
    tags: [],
    createdAt: '2026-03-10T09:00:00.000Z',
    updatedAt: '2026-03-10T09:00:00.000Z',
    completedAt: null,
    deletedAt: null,
    ...overrides,
  };
}

describe('buildStats', () => {
  const tasks = [
    makeTask({ id: '1', status: 'todo', priority: 'high', dueDate: '2026-03-01', tags: ['работа'] }),
    makeTask({ id: '2', status: 'in-progress', tags: ['работа', 'учёба'] }),
    makeTask({
      id: '3',
      status: 'done',
      completedAt: '2026-03-11T10:00:00.000Z',
      tags: ['учёба'],
    }),
    makeTask({ id: '4', status: 'done', completedAt: '2026-01-05T10:00:00.000Z' }),
    makeTask({ id: '5', deletedAt: '2026-03-09T10:00:00.000Z' }),
  ];

  const stats = buildStats(tasks, NOW);

  it('не учитывает задачи из корзины', () => {
    expect(stats.total).toBe(4);
  });

  it('считает задачи по статусам', () => {
    expect(stats.todo).toBe(1);
    expect(stats.inProgress).toBe(1);
    expect(stats.done).toBe(2);
  });

  it('находит просроченные задачи', () => {
    expect(stats.overdue).toBe(1);
  });

  it('считает выполненные за неделю и месяц', () => {
    expect(stats.completedThisWeek).toBe(1);
    expect(stats.completedThisMonth).toBe(1);
  });

  it('считает процент выполнения', () => {
    expect(stats.completionRate).toBe(50);
  });

  it('группирует по приоритету и тегам', () => {
    expect(stats.byPriority.high).toBe(1);
    expect(stats.byPriority.medium).toBe(3);
    expect(stats.topTags[0]).toEqual({ tag: 'работа', count: 2 });
  });

  it('строит недельный срез из семи дней', () => {
    expect(stats.weekly).toHaveLength(7);
    expect(stats.weekly.reduce((sum, day) => sum + day.completed, 0)).toBe(1);
  });
});
