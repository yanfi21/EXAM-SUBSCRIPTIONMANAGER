import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import type { TaskDraft } from '../models/models';
import { PreferencesService } from './preferences.service';
import { STORAGE_KEYS } from './storage.service';
import { TaskService } from './task.service';

const draft: TaskDraft = {
  title: 'Новая задача',
  description: 'Описание',
  priority: 'high',
  status: 'todo',
  dueDate: '2026-04-01',
  tags: ['работа'],
};

describe('TaskService', () => {
  let service: TaskService;
  let preferences: PreferencesService;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(STORAGE_KEYS.tasks, '[]');
    TestBed.resetTestingModule();
    service = TestBed.inject(TaskService);
    preferences = TestBed.inject(PreferencesService);
  });

  it('стартует с пустым списком и создаёт задачу', () => {
    expect(service.tasks()).toHaveLength(0);
    const task = service.create(draft);
    expect(service.tasks()).toHaveLength(1);
    expect(task.createdAt).toBe(task.updatedAt);
    expect(task.completedAt).toBeNull();
  });

  it('переключает выполнение и фиксирует дату завершения', () => {
    const task = service.create(draft);
    service.toggle(task.id);
    expect(service.tasks()[0].status).toBe('done');
    expect(service.tasks()[0].completedAt).not.toBeNull();

    service.toggle(task.id);
    expect(service.tasks()[0].status).toBe('todo');
    expect(service.tasks()[0].completedAt).toBeNull();
  });

  it('использует мягкое удаление с восстановлением', () => {
    const task = service.create(draft);
    service.softDelete(task.id);
    expect(service.activeTasks()).toHaveLength(0);
    expect(service.deletedTasks()).toHaveLength(1);

    service.restore(task.id);
    expect(service.activeTasks()).toHaveLength(1);

    service.softDelete(task.id);
    service.purgeDeleted();
    expect(service.tasks()).toHaveLength(0);
  });

  it('меняет статус и порядок при перемещении на доске', () => {
    const first = service.create(draft);
    const second = service.create({ ...draft, title: 'Вторая задача' });
    service.move(first.id, second.id, 'in-progress');

    expect(service.tasks().find((task) => task.id === first.id)?.status).toBe('in-progress');
    expect(service.tasks()[0].id).toBe(first.id);
    expect(service.columns()['in-progress']).toHaveLength(1);
  });

  it('учитывает фильтры при формировании видимого списка', () => {
    service.create(draft);
    service.create({ ...draft, title: 'Купить продукты', priority: 'low', tags: ['быт'] });

    preferences.patchFilters({ search: 'продукты' });
    expect(service.visibleTasks()).toHaveLength(1);
    expect(service.visibleTasks()[0].title).toBe('Купить продукты');

    preferences.patchFilters({ search: '', priority: 'high' });
    expect(service.visibleTasks()).toHaveLength(1);
    expect(service.visibleTasks()[0].priority).toBe('high');

    preferences.resetFilters();
    expect(service.visibleTasks()).toHaveLength(2);
  });

  it('считает статистику и доступные теги', () => {
    const task = service.create(draft);
    service.create({ ...draft, title: 'Вторая', tags: ['учёба'] });
    service.setStatus(task.id, 'done');

    expect(service.stats().total).toBe(2);
    expect(service.stats().done).toBe(1);
    expect(service.stats().completionRate).toBe(50);
    expect(service.availableTags()).toEqual(['работа', 'учёба']);
  });

  it('выбирает задачу дня с ближайшим дедлайном', () => {
    service.create({ ...draft, title: 'Поздняя', dueDate: '2030-01-01' });
    service.create({ ...draft, title: 'Ближайшая', dueDate: '2026-01-01' });
    expect(service.taskOfTheDay()?.title).toBe('Ближайшая');
  });
});
