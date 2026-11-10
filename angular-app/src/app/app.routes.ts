import { inject } from '@angular/core';
import type { Routes } from '@angular/router';
import { PreferencesService } from './core/services/preferences.service';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => `/tasks/${inject(PreferencesService).view()}`,
  },
  {
    path: 'tasks',
    loadComponent: () => import('./features/tasks/tasks-shell').then((m) => m.TasksShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'list' },
      {
        path: 'list',
        title: 'Список задач',
        loadComponent: () => import('./features/tasks/task-list').then((m) => m.TaskList),
      },
      {
        path: 'board',
        title: 'Канбан-доска',
        loadComponent: () => import('./features/tasks/task-board').then((m) => m.TaskBoard),
      },
      {
        path: 'calendar',
        title: 'Календарь дедлайнов',
        loadComponent: () => import('./features/tasks/task-calendar').then((m) => m.TaskCalendar),
      },
    ],
  },
  {
    path: 'notes',
    title: 'Заметки',
    loadComponent: () => import('./features/notes/notes-page').then((m) => m.NotesPage),
  },
  {
    path: 'stats',
    title: 'Статистика',
    loadComponent: () => import('./features/stats/stats-page').then((m) => m.StatsPage),
  },
  {
    path: 'trash',
    title: 'Корзина',
    loadComponent: () => import('./features/trash/trash-page').then((m) => m.TrashPage),
  },
  {
    path: 'settings',
    title: 'Настройки и данные',
    loadComponent: () => import('./features/settings/settings-page').then((m) => m.SettingsPage),
  },
  {
    path: '**',
    title: 'Страница не найдена',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
