# Менеджер задач и заметок — вариант A (Angular)

Реализация ТЗ «Менеджер личных задач и заметок» на Angular 20 со standalone-компонентами и Signals.

## Стек

- Angular 20 (standalone, Signals, новый синтаксис управления потоком `@if` / `@for`)
- Angular Router с ленивой загрузкой представлений
- Reactive Forms для форм задачи, заметки и обратной связи
- Angular CDK Drag & Drop для канбан-доски
- SCSS (дизайн-токены, стили Markdown и drag & drop) + Tailwind CSS 4 через PostCSS
- Vitest + jsdom (`@angular/build:unit-test`) для модульных тестов

## Команды

```bash
npm install     # установка зависимостей
npm start       # дев-сервер http://localhost:4200
npm run build   # production-сборка в dist/angular-app
npm test        # модульные тесты (Vitest, 43 теста)
```

## Структура

```
src/app/
├── app.ts, app.html          каркас приложения: меню, шапка, футер, горячие клавиши
├── app.config.ts             провайдеры приложения
├── app.routes.ts             маршруты и ленивая загрузка
├── core/
│   ├── models/               доменные типы и константы
│   ├── services/             StorageService, TaskService, NoteService, PreferencesService,
│   │                         FeedbackService, BackupService, QuoteService, ToastService,
│   │                         TaskDialogService
│   └── utils/                date, filter, stats, backup, markdown, demo, id
├── features/
│   ├── tasks/                оболочка, список, доска, календарь, карточка, фильтры, диалог
│   ├── notes/                список заметок и диалог редактирования
│   ├── stats/                статистика
│   ├── trash/                корзина
│   ├── settings/             настройки, экспорт/импорт, обратная связь
│   └── not-found/            страница 404
└── shared/components/        icon, modal, confirm-dialog, empty-state, toast-host, badges
```

## Особенности реализации

- Состояние приложения — сигналы в сервисах; производные данные (`visibleTasks`, `columns`,
  `stats`, `availableTags`, `taskOfTheDay`) вычисляются через `computed`.
- Сохранение в `localStorage` выполняется в `effect` при каждом изменении состояния.
- `StorageService` переключается на хранилище в памяти, если `localStorage` недоступен,
  и безопасно обрабатывает повреждённый JSON.
- При первом запуске загружается демонстрационный набор задач и заметок.
