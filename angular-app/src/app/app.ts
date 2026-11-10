import { ChangeDetectionStrategy, Component, HostListener, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { SUPPORT_EMAIL } from './core/models/models';
import { NoteService } from './core/services/note.service';
import { PreferencesService } from './core/services/preferences.service';
import { TaskDialogService } from './core/services/task-dialog.service';
import { TaskService } from './core/services/task.service';
import { TaskDialog } from './features/tasks/task-dialog';
import { Icon, type IconName } from './shared/components/icon';
import { ToastHost } from './shared/components/toast-host';

interface NavItem {
  path: string;
  label: string;
  icon: IconName;
}

const TITLES: Record<string, string> = {
  '/tasks/list': 'Список задач',
  '/tasks/board': 'Канбан-доска',
  '/tasks/calendar': 'Календарь дедлайнов',
  '/notes': 'Заметки',
  '/stats': 'Статистика',
  '/trash': 'Корзина',
  '/settings': 'Настройки и данные',
};

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, TaskDialog, ToastHost],
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);
  private readonly tasks = inject(TaskService);
  private readonly notes = inject(NoteService);
  protected readonly preferences = inject(PreferencesService);
  protected readonly dialog = inject(TaskDialogService);

  protected readonly supportEmail = SUPPORT_EMAIL;
  protected readonly menuOpen = signal(false);
  protected readonly navItems: NavItem[] = [
    { path: '/tasks/list', label: 'Список задач', icon: 'list' },
    { path: '/tasks/board', label: 'Канбан-доска', icon: 'board' },
    { path: '/tasks/calendar', label: 'Календарь', icon: 'calendar' },
    { path: '/notes', label: 'Заметки', icon: 'note' },
    { path: '/stats', label: 'Статистика', icon: 'stats' },
    { path: '/trash', label: 'Корзина', icon: 'trash' },
    { path: '/settings', label: 'Настройки', icon: 'settings' },
  ];

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly pageTitle = computed(() => TITLES[this.currentUrl()] ?? 'Задачи и заметки');
  protected readonly openCount = this.tasks.openCount;
  protected readonly trashCount = computed(
    () => this.tasks.deletedTasks().length + this.notes.deletedNotes().length,
  );

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable === true;
    if (typing || event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    if (event.key === 'n') {
      event.preventDefault();
      this.dialog.openCreate();
    }
    if (event.key === 't') {
      this.preferences.toggleTheme();
    }
    if (event.key === '/') {
      const input = document.querySelector<HTMLInputElement>('[data-search-input]');
      if (input) {
        event.preventDefault();
        input.focus();
      }
    }
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
