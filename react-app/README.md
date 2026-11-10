# Менеджер задач и заметок — вариант B (React)

Реализация ТЗ «Менеджер личных задач и заметок» на React 19 + Vite + TypeScript.

## Стек

- React 19, Vite, строгий TypeScript
- React Router (вложенные маршруты, `Outlet context`)
- Zustand для состояния и подписки на сохранение в `localStorage`
- React Hook Form для форм задачи, заметки и обратной связи
- dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`) для канбан-доски
- Tailwind CSS 4
- Vitest + jsdom для модульных тестов

## Команды

```bash
npm install     # установка зависимостей
npm run dev     # дев-сервер http://localhost:5173
npm run build   # проверка типов и production-сборка в dist
npm run preview # просмотр собранной версии
npm test        # модульные тесты (Vitest, 41 тест)
```

## Структура

```
src/
├── App.tsx                 маршруты и провайдеры (тосты, диалог задачи)
├── main.tsx                точка входа
├── index.css               Tailwind-тема, дизайн-токены, компонентные классы
├── domain/models.ts        доменные типы и константы
├── lib/                    date, filters, stats, backup, markdown, storage, demo, quotes, id
├── store/useAppStore.ts    Zustand store и подписка на запись в localStorage
├── components/
│   ├── layout/             каркас приложения (меню, шапка, футер, горячие клавиши)
│   ├── tasks/              карточка, фильтры, форма, диалог, канбан, календарь, задача дня
│   ├── notes/              карточка и диалог заметки
│   └── ui/                 icon, modal, confirm-dialog, empty-state, toast
└── pages/                  TasksPage (list / board / calendar), NotesPage, StatsPage,
                            TrashPage, SettingsPage, NotFoundPage
```

## Особенности реализации

- Фильтрация, сортировка и статистика вынесены в чистые функции `src/lib` и покрыты тестами.
- `startPersistence()` подписывается на store и записывает в `localStorage` только изменившиеся срезы.
- Хранилище устойчиво к повреждённому JSON и недоступному `localStorage` (fallback в память).
- При первом запуске загружается демонстрационный набор задач и заметок.
