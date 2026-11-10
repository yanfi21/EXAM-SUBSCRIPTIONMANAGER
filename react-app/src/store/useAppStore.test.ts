import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_PREFERENCES } from '../domain/models';
import { useAppStore } from './useAppStore';

const draft = {
  title: 'Новая задача',
  description: 'Описание',
  priority: 'high' as const,
  status: 'todo' as const,
  dueDate: '2026-04-01',
  tags: ['работа'],
};

describe('хранилище приложения', () => {
  beforeEach(() => {
    useAppStore.setState({
      tasks: [],
      notes: [],
      feedback: [],
      preferences: { ...DEFAULT_PREFERENCES, filters: { ...DEFAULT_PREFERENCES.filters } },
    });
  });

  it('создаёт задачу с метками времени', () => {
    const task = useAppStore.getState().createTask(draft);
    expect(useAppStore.getState().tasks).toHaveLength(1);
    expect(task.createdAt).toBe(task.updatedAt);
    expect(task.completedAt).toBeNull();
  });

  it('переключает выполнение и фиксирует дату завершения', () => {
    const task = useAppStore.getState().createTask(draft);
    useAppStore.getState().toggleTask(task.id);
    const done = useAppStore.getState().tasks[0];
    expect(done.status).toBe('done');
    expect(done.completedAt).not.toBeNull();

    useAppStore.getState().toggleTask(task.id);
    expect(useAppStore.getState().tasks[0].status).toBe('todo');
    expect(useAppStore.getState().tasks[0].completedAt).toBeNull();
  });

  it('использует мягкое удаление и восстановление', () => {
    const task = useAppStore.getState().createTask(draft);
    useAppStore.getState().deleteTask(task.id);
    expect(useAppStore.getState().tasks[0].deletedAt).not.toBeNull();

    useAppStore.getState().restoreTask(task.id);
    expect(useAppStore.getState().tasks[0].deletedAt).toBeNull();

    useAppStore.getState().deleteTask(task.id);
    useAppStore.getState().purgeTask(task.id);
    expect(useAppStore.getState().tasks).toHaveLength(0);
  });

  it('меняет статус при перетаскивании на другую колонку', () => {
    const task = useAppStore.getState().createTask(draft);
    useAppStore.getState().moveTask(task.id, null, 'in-progress');
    expect(useAppStore.getState().tasks[0].status).toBe('in-progress');
  });

  it('очищает корзину от задач и заметок', () => {
    const task = useAppStore.getState().createTask(draft);
    const note = useAppStore.getState().createNote({ title: 'Заметка', content: 'Текст' });
    useAppStore.getState().deleteTask(task.id);
    useAppStore.getState().deleteNote(note.id);
    useAppStore.getState().emptyTrash();
    expect(useAppStore.getState().tasks).toHaveLength(0);
    expect(useAppStore.getState().notes).toHaveLength(0);
  });

  it('сохраняет фильтры и сбрасывает их', () => {
    useAppStore.getState().setFilters({ search: 'отчёт', priority: 'high' });
    expect(useAppStore.getState().preferences.filters.search).toBe('отчёт');
    useAppStore.getState().toggleTagFilter('работа');
    expect(useAppStore.getState().preferences.filters.tags).toEqual(['работа']);
    useAppStore.getState().resetFilters();
    expect(useAppStore.getState().preferences.filters.search).toBe('');
    expect(useAppStore.getState().preferences.filters.tags).toEqual([]);
  });

  it('импортирует снимок в режиме замены', () => {
    useAppStore.getState().createTask(draft);
    useAppStore.getState().applySnapshot(
      {
        schemaVersion: 1,
        exportedAt: '2026-03-01T00:00:00.000Z',
        tasks: [],
        notes: [],
        feedback: [],
        preferences: DEFAULT_PREFERENCES,
      },
      'replace',
    );
    expect(useAppStore.getState().tasks).toHaveLength(0);
  });
});
