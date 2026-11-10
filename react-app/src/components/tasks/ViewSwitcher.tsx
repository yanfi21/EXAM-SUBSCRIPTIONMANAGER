import { NavLink } from 'react-router-dom';
import { Icon, type IconName } from '../ui/Icon';

const VIEWS: Array<{ to: string; label: string; icon: IconName }> = [
  { to: '/tasks/list', label: 'Список', icon: 'list' },
  { to: '/tasks/board', label: 'Доска', icon: 'board' },
  { to: '/tasks/calendar', label: 'Календарь', icon: 'calendar' },
];

export function ViewSwitcher() {
  return (
    <nav className="flex w-full gap-1 rounded-xl border border-border bg-surface p-1 sm:w-auto sm:self-start">
      {VIEWS.map((view) => (
        <NavLink
          key={view.to}
          to={view.to}
          className={({ isActive }) =>
            `flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition sm:flex-none ${
              isActive ? 'bg-brand text-white' : 'text-muted hover:bg-subtle hover:text-ink'
            }`
          }
        >
          <Icon name={view.icon} size={15} />
          {view.label}
        </NavLink>
      ))}
    </nav>
  );
}
