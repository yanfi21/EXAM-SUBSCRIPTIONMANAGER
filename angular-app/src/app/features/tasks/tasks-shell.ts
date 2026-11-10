import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon } from '../../shared/components/icon';
import { TaskFilters } from './task-filters';
import { TaskOfTheDay } from './task-of-the-day';

@Component({
  selector: 'app-tasks-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, TaskFilters, TaskOfTheDay],
  template: `
    <div class="flex flex-col gap-4">
      <app-task-of-the-day />

      <nav
        class="flex w-full gap-1 rounded-xl border border-border bg-surface p-1 sm:w-auto sm:self-start"
      >
        @for (view of views; track view.path) {
          <a
            class="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-muted transition hover:bg-subtle hover:text-ink sm:flex-none"
            [routerLink]="view.path"
            routerLinkActive="bg-brand text-white hover:bg-brand hover:text-white"
            #link="routerLinkActive"
            [attr.aria-current]="link.isActive ? 'page' : null"
          >
            <app-icon [name]="view.icon" [size]="15" />
            {{ view.label }}
          </a>
        }
      </nav>

      <app-task-filters />

      <router-outlet />
    </div>
  `,
})
export class TasksShell {
  protected readonly views = [
    { path: '/tasks/list', label: 'Список', icon: 'list' as const },
    { path: '/tasks/board', label: 'Доска', icon: 'board' as const },
    { path: '/tasks/calendar', label: 'Календарь', icon: 'calendar' as const },
  ];
}
