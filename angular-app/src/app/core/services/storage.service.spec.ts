import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { STORAGE_KEYS, StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    service = TestBed.inject(StorageService);
  });

  it('создаётся через внедрение зависимостей', () => {
    expect(service).toBeTruthy();
  });

  it('сохраняет и читает значение', () => {
    service.write(STORAGE_KEYS.tasks, [{ id: '1' }]);
    expect(service.read(STORAGE_KEYS.tasks, [])).toEqual([{ id: '1' }]);
  });

  it('возвращает значение по умолчанию, если ключа нет', () => {
    expect(service.read(STORAGE_KEYS.notes, [])).toEqual([]);
    expect(service.has(STORAGE_KEYS.notes)).toBe(false);
  });

  it('возвращает значение по умолчанию при повреждённых данных', () => {
    localStorage.setItem(STORAGE_KEYS.notes, '{не json');
    expect(service.read(STORAGE_KEYS.notes, ['fallback'])).toEqual(['fallback']);
  });

  it('удаляет значение и очищает ключи приложения', () => {
    service.write(STORAGE_KEYS.tasks, [1]);
    service.write(STORAGE_KEYS.notes, [2]);
    localStorage.setItem('other.key', 'keep');

    service.remove(STORAGE_KEYS.tasks);
    expect(service.has(STORAGE_KEYS.tasks)).toBe(false);

    service.clearAll();
    expect(service.has(STORAGE_KEYS.notes)).toBe(false);
    expect(localStorage.getItem('other.key')).toBe('keep');
  });

  it('считает объём занятого хранилища', () => {
    service.write(STORAGE_KEYS.tasks, [{ id: '1' }]);
    expect(service.usedBytes()).toBeGreaterThan(0);
  });
});
