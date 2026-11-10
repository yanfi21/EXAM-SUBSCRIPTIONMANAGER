import type { Note, Task } from '../domain/models';
import { addDays, toDateKey } from './date';
import { createId } from './id';

interface DemoTaskSeed {
  title: string;
  description: string;
  priority: Task['priority'];
  status: Task['status'];
  dueOffset: number | null;
  tags: string[];
  createdOffset: number;
  completedOffset?: number;
}

const TASK_SEEDS: DemoTaskSeed[] = [
  {
    title: 'Подготовить отчёт по практике',
    description: 'Собрать материалы, оформить титульный лист и дневник практики.',
    priority: 'high',
    status: 'in-progress',
    dueOffset: 2,
    tags: ['учёба', 'документы'],
    createdOffset: -3,
  },
  {
    title: 'Оплатить интернет и мобильную связь',
    description: 'Автоплатёж не прошёл, оплатить вручную через приложение банка.',
    priority: 'medium',
    status: 'todo',
    dueOffset: -1,
    tags: ['быт', 'финансы'],
    createdOffset: -6,
  },
  {
    title: 'Тренировка в зале',
    description: 'Силовая тренировка: спина, бицепс, 45 минут кардио.',
    priority: 'low',
    status: 'todo',
    dueOffset: 0,
    tags: ['здоровье'],
    createdOffset: -1,
  },
  {
    title: 'Созвон с командой по проекту',
    description: 'Обсудить архитектуру модуля статистики и распределить задачи.',
    priority: 'high',
    status: 'todo',
    dueOffset: 1,
    tags: ['работа', 'встречи'],
    createdOffset: -2,
  },
  {
    title: 'Прочитать главу по TypeScript',
    description: 'Глава про дженерики и условные типы, выписать примеры.',
    priority: 'medium',
    status: 'done',
    dueOffset: -2,
    tags: ['учёба', 'чтение'],
    createdOffset: -5,
    completedOffset: -2,
  },
  {
    title: 'Составить список покупок',
    description: 'Продукты на неделю + бытовая химия.',
    priority: 'low',
    status: 'done',
    dueOffset: -3,
    tags: ['быт'],
    createdOffset: -4,
    completedOffset: -3,
  },
  {
    title: 'Обновить резюме',
    description: 'Добавить проект менеджера задач и актуальный стек технологий.',
    priority: 'medium',
    status: 'in-progress',
    dueOffset: 5,
    tags: ['карьера'],
    createdOffset: -7,
  },
  {
    title: 'Сделать резервную копию данных',
    description: 'Выгрузить JSON из приложения и сохранить в облако.',
    priority: 'low',
    status: 'todo',
    dueOffset: 7,
    tags: ['работа'],
    createdOffset: -1,
  },
];

const NOTE_SEEDS: Array<Pick<Note, 'title' | 'content'> & { createdOffset: number }> = [
  {
    title: 'Структура отчёта по практике',
    content:
      '# Структура\n\n1. Титульный лист\n2. Дневник практики\n3. Описание задач\n4. Выводы\n\n**Дедлайн:** пятница\n\n- [x] Собрать скриншоты\n- [ ] Оформить список литературы',
    createdOffset: -3,
  },
  {
    title: 'Идеи для портфолио',
    content:
      '## Что добавить\n\n- Менеджер задач на *Angular* и *React*\n- Визуализация статистики\n- Тёмная тема и экспорт данных\n\n> Главное — рабочее демо и понятный README.',
    createdOffset: -2,
  },
  {
    title: 'Горячие клавиши приложения',
    content:
      '`N` — новая задача\n\n`/` — поиск\n\n`T` — переключение темы\n\nСочетания работают на всех экранах, кроме полей ввода.',
    createdOffset: -1,
  },
];

export function buildDemoTasks(now: Date = new Date()): Task[] {
  return TASK_SEEDS.map((seed) => {
    const createdAt = addDays(now, seed.createdOffset).toISOString();
    const completedAt =
      seed.status === 'done'
        ? addDays(now, seed.completedOffset ?? seed.createdOffset).toISOString()
        : null;
    return {
      id: createId('task'),
      title: seed.title,
      description: seed.description,
      priority: seed.priority,
      status: seed.status,
      dueDate: seed.dueOffset === null ? null : toDateKey(addDays(now, seed.dueOffset)),
      tags: seed.tags,
      createdAt,
      updatedAt: completedAt ?? createdAt,
      completedAt,
      deletedAt: null,
    };
  });
}

export function buildDemoNotes(now: Date = new Date()): Note[] {
  return NOTE_SEEDS.map((seed) => {
    const createdAt = addDays(now, seed.createdOffset).toISOString();
    return {
      id: createId('note'),
      title: seed.title,
      content: seed.content,
      createdAt,
      updatedAt: createdAt,
      deletedAt: null,
    };
  });
}
