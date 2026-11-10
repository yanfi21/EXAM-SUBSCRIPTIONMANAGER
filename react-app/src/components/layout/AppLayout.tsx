import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { SUPPORT_EMAIL } from '../../domain/models';
import { useAppStore } from '../../store/useAppStore';
import { Icon, type IconName } from '../ui/Icon';
import { useTaskDialog } from '../tasks/TaskDialog';

interface NavItem {
  to: string;
  label: string;
  icon: IconName;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/tasks/list', label: 'Список задач', icon: 'list' },
  { to: '/tasks/board', label: 'Канбан-доска', icon: 'board' },
  { to: '/tasks/calendar', label: 'Календарь', icon: 'calendar' },
  { to: '/notes', label: 'Заметки', icon: 'note' },
  { to: '/stats', label: 'Статистика', icon: 'stats' },
  { to: '/trash', label: 'Корзина', icon: 'trash' },
  { to: '/settings', label: 'Настройки', icon: 'settings' },
];

const TITLES: Record<string, string> = {
  '/tasks/list': 'Список задач',
  '/tasks/board': 'Канбан-доска',
  '/tasks/calendar': 'Календарь дедлайнов',
  '/notes': 'Заметки',
  '/stats': 'Статистика',
  '/trash': 'Корзина',
  '/settings': 'Настройки и данные',
};

export function AppLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const theme = useAppStore((store) => store.preferences.theme);
  const toggleTheme = useAppStore((store) => store.toggleTheme);
  const tasks = useAppStore((store) => store.tasks);
  const { openCreate } = useTaskDialog();

  const activeCount = tasks.filter((task) => !task.deletedAt && task.status !== 'done').length;
  const trashCount = tasks.filter((task) => task.deletedAt).length;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;
      if (typing || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (event.key === 'n') {
        event.preventDefault();
        openCreate();
      }
      if (event.key === 't') {
        toggleTheme();
      }
      if (event.key === '/') {
        const input = document.querySelector<HTMLInputElement>('[data-search-input]');
        if (input) {
          event.preventDefault();
          input.focus();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [openCreate, toggleTheme]);

  const title = TITLES[location.pathname] ?? 'Задачи и заметки';

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside
        className={`${
          menuOpen ? 'block' : 'hidden'
        } border-b border-border bg-surface p-4 lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:shrink-0 lg:border-r lg:border-b-0`}
      >
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <Icon name="check" size={18} />
          </span>
          <div>
            <p className="text-sm font-bold text-ink">Задачи и заметки</p>
            <p className="muted text-xs">React + Zustand</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <Icon name={item.icon} size={17} />
              <span className="flex-1">{item.label}</span>
              {item.to === '/tasks/list' && activeCount > 0 ? (
                <span className="chip">{activeCount}</span>
              ) : null}
              {item.to === '/trash' && trashCount > 0 ? (
                <span className="chip">{trashCount}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 rounded-xl border border-border bg-subtle/60 p-3">
          <p className="label mb-1.5">Горячие клавиши</p>
          <ul className="muted flex flex-col gap-1 text-xs">
            <li>
              <kbd className="font-mono font-bold">N</kbd> — новая задача
            </li>
            <li>
              <kbd className="font-mono font-bold">/</kbd> — поиск
            </li>
            <li>
              <kbd className="font-mono font-bold">T</kbd> — тема
            </li>
          </ul>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-surface/90 px-4 py-3 backdrop-blur">
          <button
            type="button"
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Меню"
            aria-expanded={menuOpen}
          >
            <Icon name="menu" size={18} />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-base font-bold text-ink">{title}</h1>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Светлая тема' : 'Тёмная тема'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={17} />
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => openCreate()}>
            <Icon name="plus" size={15} />
            <span className="hidden sm:inline">Новая задача</span>
          </button>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5">
          <Outlet />
        </main>

        <footer className="border-t border-border px-4 py-4">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2">
            <p className="muted text-xs">
              Менеджер личных задач и заметок · вариант B (React 19 + Vite + TypeScript) · v1.0.0
            </p>
            <a className="muted flex items-center gap-1.5 text-xs hover:text-brand" href={`mailto:${SUPPORT_EMAIL}`}>
              <Icon name="mail" size={14} />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
