import { describe, expect, it } from 'vitest';
import { mergeById, normalizeTask, parseSnapshot } from './backup';

describe('normalizeTask', () => {
  it('отбрасывает запись без заголовка', () => {
    expect(normalizeTask({ description: 'без имени' })).toBeNull();
  });

  it('подставляет значения по умолчанию', () => {
    const task = normalizeTask({ title: 'Тест' });
    expect(task?.priority).toBe('medium');
    expect(task?.status).toBe('todo');
    expect(task?.tags).toEqual([]);
    expect(task?.deletedAt).toBeNull();
  });

  it('переносит устаревшее поле completed в статус', () => {
    const task = normalizeTask({ title: 'Старый формат', completed: true });
    expect(task?.status).toBe('done');
    expect(task?.completedAt).not.toBeNull();
  });
});

describe('parseSnapshot', () => {
  it('сообщает об ошибке при некорректном JSON', () => {
    expect(() => parseSnapshot('{')).toThrowError(/JSON/);
  });

  it('сообщает об ошибке, если нет данных', () => {
    expect(() => parseSnapshot(JSON.stringify({ tasks: [], notes: [] }))).toThrowError(
      /не найдено/,
    );
  });

  it('импортирует задачи и заметки и считает пропущенные', () => {
    const payload = JSON.stringify({
      tasks: [{ title: 'Задача' }, { description: 'мусор' }],
      notes: [{ title: 'Заметка', content: 'Текст' }],
    });
    const result = parseSnapshot(payload);
    expect(result.snapshot.tasks).toHaveLength(1);
    expect(result.snapshot.notes).toHaveLength(1);
    expect(result.skipped).toBe(1);
  });
});

describe('mergeById', () => {
  it('оставляет более свежую версию записи', () => {
    const merged = mergeById(
      [{ id: '1', updatedAt: '2026-01-01T00:00:00.000Z', title: 'старое' }],
      [{ id: '1', updatedAt: '2026-02-01T00:00:00.000Z', title: 'новое' }],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].title).toBe('новое');
  });

  it('добавляет новые записи', () => {
    const merged = mergeById([{ id: '1', updatedAt: '2026-01-01T00:00:00.000Z' }], [{ id: '2' }]);
    expect(merged).toHaveLength(2);
  });
});
