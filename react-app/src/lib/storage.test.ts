import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS, clearAll, readValue, removeValue, writeValue } from './storage';

describe('хранилище localStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('сохраняет и читает значение', () => {
    writeValue(STORAGE_KEYS.tasks, [{ id: '1' }]);
    expect(readValue(STORAGE_KEYS.tasks, [])).toEqual([{ id: '1' }]);
  });

  it('возвращает значение по умолчанию, если ключа нет', () => {
    expect(readValue(STORAGE_KEYS.notes, [])).toEqual([]);
  });

  it('возвращает значение по умолчанию при повреждённых данных', () => {
    localStorage.setItem(STORAGE_KEYS.notes, '{не json');
    expect(readValue(STORAGE_KEYS.notes, ['fallback'])).toEqual(['fallback']);
  });

  it('удаляет значение', () => {
    writeValue(STORAGE_KEYS.preferences, { theme: 'dark' });
    removeValue(STORAGE_KEYS.preferences);
    expect(localStorage.getItem(STORAGE_KEYS.preferences)).toBeNull();
  });

  it('очищает все ключи приложения', () => {
    writeValue(STORAGE_KEYS.tasks, [1]);
    writeValue(STORAGE_KEYS.notes, [2]);
    localStorage.setItem('other.key', 'keep');
    clearAll();
    expect(localStorage.getItem(STORAGE_KEYS.tasks)).toBeNull();
    expect(localStorage.getItem(STORAGE_KEYS.notes)).toBeNull();
    expect(localStorage.getItem('other.key')).toBe('keep');
  });
});
