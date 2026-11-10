import { describe, expect, it } from 'vitest';
import { DEFAULT_FILTERS, type Task } from '../models/models';
import { collectTags, isOverdue, matchesSearch, parseTags, selectTasks, sortTasks } from './filter.util';

const NOW = new Date('2026-03-10T12:00:00.000Z');

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task_1',
    title: 'Подготовить отчёт',
    description: 'Собрать данные по практике',
    priority: 'medium',
    status: 'todo',
    dueDate: '2026-03-12',
    tags: ['учёба'],
    createdAt: '2026-03-01T10:00:00.000Z',
    updatedAt: '2026-03-01T10:00:00.000Z',
    completedAt: null,
    deletedAt: null,
    ...overrides,
  };
}

describe('isOverdue', () => {
  it('считает задачу просроченной, если дедлайн в прошлом', () => {
    expect(isOverdue(makeTask({ dueDate: '2026-03-09' }), NOW)).toBe(true);
  });

  it('не считает выполненную задачу просроченной', () => {
    expect(isOverdue(makeTask({ dueDate: '2026-03-01', status: 'done' }), NOW)).toBe(false);
  });

  it('не считает задачу без дедлайна просроченной', () => {
    expect(isOverdue(makeTask({ dueDate: null }), NOW)).toBe(false);
  });
});

describe('matchesSearch', () => {
  it('ищет по заголовку без учёта регистра', () => {
    expect(matchesSearch(makeTask(), 'ОТЧЁТ')).toBe(true);
  });

  it('ищет по описанию и тегам', () => {
    expect(matchesSearch(makeTask(), 'практике')).toBe(true);
    expect(matchesSearch(makeTask(), 'учёба')).toBe(true);
  });

  it('требует совпадения всех слов запроса', () => {
    expect(matchesSearch(makeTask(), 'отчёт практике')).toBe(true);
    expect(matchesSearch(makeTask(), 'отчёт отпуск')).toBe(false);
  });
});

describe('selectTasks', () => {
  const tasks = [
    makeTask({ id: 'a', title: 'A', priority: 'low', status: 'todo' }),
    makeTask({ id: 'b', title: 'B', priority: 'high', status: 'in-progress' }),
    makeTask({ id: 'c', title: 'C', priority: 'medium', status: 'done' }),
    makeTask({ id: 'd', title: 'D', deletedAt: '2026-03-05T10:00:00.000Z' }),
  ];

  it('исключает удалённые задачи', () => {
    const result = selectTasks(tasks, DEFAULT_FILTERS, NOW);
    expect(result.map((task) => task.id)).not.toContain('d');
    expect(result).toHaveLength(3);
  });

  it('фильтрует по статусу', () => {
    const result = selectTasks(tasks, { ...DEFAULT_FILTERS, status: 'done' }, NOW);
    expect(result.map((task) => task.id)).toEqual(['c']);
  });

  it('фильтрует по приоритету и тегам', () => {
    expect(selectTasks(tasks, { ...DEFAULT_FILTERS, priority: 'high' }, NOW)).toHaveLength(1);
    expect(selectTasks(tasks, { ...DEFAULT_FILTERS, tags: ['учёба'] }, NOW)).toHaveLength(3);
    expect(selectTasks(tasks, { ...DEFAULT_FILTERS, tags: ['работа'] }, NOW)).toHaveLength(0);
  });

  it('сортирует по приоритету по убыванию', () => {
    const result = selectTasks(
      tasks,
      { ...DEFAULT_FILTERS, sortBy: 'priority', sortDir: 'desc' },
      NOW,
    );
    expect(result.map((task) => task.priority)).toEqual(['high', 'medium', 'low']);
  });
});

describe('sortTasks', () => {
  it('помещает задачи без дедлайна в конец при сортировке по возрастанию', () => {
    const result = sortTasks(
      [makeTask({ id: 'x', dueDate: null }), makeTask({ id: 'y', dueDate: '2026-03-11' })],
      'dueDate',
      'asc',
    );
    expect(result.map((task) => task.id)).toEqual(['y', 'x']);
  });
});

describe('collectTags и parseTags', () => {
  it('собирает уникальные теги активных задач', () => {
    const tags = collectTags([
      makeTask({ id: '1', tags: ['работа', 'учёба'] }),
      makeTask({ id: '2', tags: ['учёба'] }),
      makeTask({ id: '3', tags: ['корзина'], deletedAt: '2026-03-01T00:00:00.000Z' }),
    ]);
    expect(tags).toEqual(['работа', 'учёба']);
  });

  it('нормализует строку тегов', () => {
    expect(parseTags('#Работа, работа , учёба')).toEqual(['работа', 'учёба']);
  });
});
