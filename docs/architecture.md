# Технический проект: архитектура и схема данных

Стадия 5 по ГОСТ 34.601-90.

## 1. Архитектура решения

Обе реализации — клиентские SPA без серверной части. Приложение разделено на три слоя:

1. **Доменный слой** — типы и чистые функции: фильтрация, сортировка, статистика, нормализация
   импорта, Markdown-рендеринг, работа с датами. Функции не зависят от фреймворка, покрыты тестами.
2. **Слой состояния и хранения** — сервисы на сигналах (Angular) или store Zustand (React).
   Каждое изменение состояния немедленно сохраняется в `localStorage`.
3. **Слой представления** — маршрутизируемые экраны и переиспользуемые компоненты
   (карточка задачи, модальное окно, пустое состояние, значки, уведомления).

```
UI (экраны, компоненты)
        │ сигналы / хуки
Состояние (TaskService, NoteService, PreferencesService, FeedbackService | useAppStore)
        │ вызовы
Домен (filter, stats, backup, markdown, date, id)
        │ JSON
localStorage (5 ключей) ──────── экспорт/импорт JSON
```

### 1.1 Вариант A — Angular

```
src/app/
├── app.ts / app.html         каркас: меню, шапка, футер, горячие клавиши
├── app.config.ts             провайдеры: Router, HttpClient, zone-конфигурация
├── app.routes.ts             маршруты с ленивой загрузкой (loadComponent)
├── core/
│   ├── models/models.ts      доменные типы и константы
│   ├── services/             StorageService, TaskService, NoteService,
│   │                         PreferencesService, FeedbackService, BackupService,
│   │                         QuoteService, ToastService, TaskDialogService
│   └── utils/                date, filter, stats, backup, markdown, demo, id
├── features/                 tasks (shell, list, board, calendar, card, filters, dialog),
│                             notes, stats, trash, settings, not-found
└── shared/components/        icon, modal, confirm-dialog, empty-state, toast-host, badges
```

Состояние хранится в `signal`, производные данные — в `computed` (`visibleTasks`, `columns`,
`stats`, `availableTags`, `taskOfTheDay`). Сохранение выполняется через `effect`, который реагирует
на изменение сигнала состояния. Канбан-доска использует `cdkDropListGroup` / `cdkDropList` / `cdkDrag`.

### 1.2 Вариант B — React

```
src/
├── App.tsx                   маршруты и провайдеры
├── domain/models.ts          доменные типы и константы
├── lib/                      date, filters, stats, backup, markdown, storage, demo, quotes, id
├── store/useAppStore.ts      Zustand store + подписка для записи в localStorage
├── components/               layout (AppLayout), tasks, notes, ui
└── pages/                    TasksPage (+ ListView, BoardView, CalendarView), NotesPage,
                              StatsPage, TrashPage, SettingsPage, NotFoundPage
```

Общий каркас задач (`TasksPage`) вычисляет отфильтрованный список и передаёт его дочерним
представлениям через `Outlet context`. Канбан-доска построена на `@dnd-kit/core` и
`@dnd-kit/sortable` с поддержкой клавиатуры.

## 2. Схема данных

```ts
type Priority   = 'low' | 'medium' | 'high';
type TaskStatus = 'todo' | 'in-progress' | 'done';

interface Task {
  id: string;             // task_<uuid>
  title: string;          // 3..160 символов
  description: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string | null; // YYYY-MM-DD
  tags: string[];         // нормализованные, до 12 штук
  createdAt: string;      // ISO-8601
  updatedAt: string;      // ISO-8601
  completedAt: string | null;
  deletedAt: string | null;
}

interface Note {
  id: string; title: string; content: string;
  createdAt: string; updatedAt: string; deletedAt: string | null;
}

interface Feedback {
  id: string; name: string; email: string;
  rating: 1 | 2 | 3 | 4 | 5; message: string; createdAt: string;
}

interface Preferences {
  view: 'list' | 'board' | 'calendar';
  theme: 'light' | 'dark';
  filters: {
    search: string;
    status: TaskStatus | 'all';
    priority: Priority | 'all';
    tags: string[];
    onlyOverdue: boolean;
    sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title' | 'status';
    sortDir: 'asc' | 'desc';
  };
}
```

Поле `completedAt` добавлено к схеме ТЗ, чтобы корректно считать статистику «выполнено за неделю/месяц»
независимо от последующих правок задачи. Поле `deletedAt` реализует корзину (мягкое удаление).

### 2.1 Ключи хранилища

| Ключ | Тип |
| --- | --- |
| `tasknotes.tasks` | `Task[]` |
| `tasknotes.notes` | `Note[]` |
| `tasknotes.preferences` | `Preferences` |
| `tasknotes.feedback` | `Feedback[]` |
| `tasknotes.schemaVersion` | `number` |

### 2.2 Формат экспорта

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-03-10T12:00:00.000Z",
  "tasks": [], "notes": [], "feedback": [],
  "preferences": { "view": "list", "theme": "light", "filters": {} }
}
```

При импорте каждая запись проходит нормализацию: отбрасываются записи без заголовка, подставляются
значения по умолчанию, устаревшее поле `completed: true` преобразуется в `status: 'done'`,
некорректные даты заменяются валидными. Режим «объединить» сопоставляет записи по `id`,
режим «заменить» полностью перезаписывает данные.

## 3. Ключевые алгоритмы

- **Поиск** — запрос приводится к нижнему регистру и разбивается на слова; задача попадает в выдачу,
  если каждое слово встречается в строке «заголовок + описание + теги».
- **Просроченность** — `dueDate < сегодня` и статус не «Выполнено».
- **Сортировка** — стабильное сравнение по выбранному полю с вторичным ключом `createdAt`;
  задачи без дедлайна получают условную дату `9999-12-31` и уходят в конец.
- **Канбан** — перенос карточки обновляет `status` и позицию в общем массиве (вставка перед целевой
  карточкой), что сохраняет ручной порядок внутри колонки.
- **Статистика** — агрегирование за один проход по массиву: статусы, приоритеты, теги, недельный срез
  по `createdAt` и `completedAt`, выполненные за 7 и 30 дней.

## 4. Обеспечение качества (ISO/IEC 25010)

| Характеристика | Решение |
| --- | --- |
| Функциональная полнота | реализованы все функции раздела 3 ТЗ, проверены автотестами и ручным сценарием |
| Производительность | мемоизация производных данных, плоские массивы, отсутствие тяжёлых зависимостей; поиск по 1000 задач — единичный проход по массиву |
| Удобство использования | mobile-first, горячие клавиши, видимый фокус, ARIA-атрибуты, тёмная тема |
| Надёжность | запись при каждом изменении, защита от повреждённого JSON, fallback в память при недоступном `localStorage`, подтверждения необратимых действий |
| Сопровождаемость | строгий TypeScript, разделение на слои, одинаковая доменная модель в обеих версиях, 84 модульных теста |
| Переносимость | статическая сборка, работает из любого веб-сервера, данные переносятся файлом JSON |

## 5. Тестирование

| Приложение | Команда | Состав |
| --- | --- | --- |
| Angular | `npm test` (`@angular/build:unit-test`, Vitest + jsdom) | фильтрация и сортировка, статистика, нормализация импорта, `StorageService`, `TaskService` |
| React | `npm test` (Vitest + jsdom) | фильтрация и сортировка, статистика, хранилище, нормализация импорта, store Zustand |

## 6. Сборка и ввод в действие

```bash
cd angular-app && npm ci && npm run build   # dist/angular-app/browser
cd react-app   && npm ci && npm run build   # dist
```

Результат сборки — статические файлы, которые размещаются на любом статическом хостинге
(GitHub Pages, Nginx, S3). Серверная часть и база данных не требуются.
