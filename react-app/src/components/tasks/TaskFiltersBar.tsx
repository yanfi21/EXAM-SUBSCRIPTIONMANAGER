import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type SortField,
} from '../../domain/models';
import { useAppStore } from '../../store/useAppStore';
import { Icon } from '../ui/Icon';

const SORT_LABELS: Record<SortField, string> = {
  createdAt: 'По дате создания',
  dueDate: 'По дедлайну',
  priority: 'По приоритету',
  title: 'По названию',
  status: 'По статусу',
};

interface TaskFiltersBarProps {
  availableTags: string[];
  resultCount: number;
}

export function TaskFiltersBar({ availableTags, resultCount }: TaskFiltersBarProps) {
  const filters = useAppStore((store) => store.preferences.filters);
  const setFilters = useAppStore((store) => store.setFilters);
  const resetFilters = useAppStore((store) => store.resetFilters);
  const toggleTagFilter = useAppStore((store) => store.toggleTagFilter);

  const dirty =
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.tags.length > 0 ||
    filters.onlyOverdue;

  return (
    <section className="card p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="field sm:col-span-2 lg:col-span-1">
          <label className="label" htmlFor="filter-search">
            Поиск
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
              <Icon name="search" size={15} />
            </span>
            <input
              id="filter-search"
              data-search-input
              className="input pl-9"
              type="search"
              placeholder="Название, описание, тег"
              value={filters.search}
              onChange={(event) => setFilters({ search: event.target.value })}
            />
          </div>
        </div>

        <div className="field">
          <label className="label" htmlFor="filter-status">
            Статус
          </label>
          <select
            id="filter-status"
            className="select"
            value={filters.status}
            onChange={(event) =>
              setFilters({ status: event.target.value as typeof filters.status })
            }
          >
            <option value="all">Все статусы</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="filter-priority">
            Приоритет
          </label>
          <select
            id="filter-priority"
            className="select"
            value={filters.priority}
            onChange={(event) =>
              setFilters({ priority: event.target.value as typeof filters.priority })
            }
          >
            <option value="all">Любой приоритет</option>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="filter-sort">
            Сортировка
          </label>
          <div className="flex gap-2">
            <select
              id="filter-sort"
              className="select"
              value={filters.sortBy}
              onChange={(event) => setFilters({ sortBy: event.target.value as SortField })}
            >
              {(Object.keys(SORT_LABELS) as SortField[]).map((field) => (
                <option key={field} value={field}>
                  {SORT_LABELS[field]}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => setFilters({ sortDir: filters.sortDir === 'asc' ? 'desc' : 'asc' })}
              title={filters.sortDir === 'asc' ? 'По возрастанию' : 'По убыванию'}
            >
              {filters.sortDir === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={`chip cursor-pointer ${filters.onlyOverdue ? 'chip-active' : ''}`}
          onClick={() => setFilters({ onlyOverdue: !filters.onlyOverdue })}
        >
          <Icon name="alert" size={13} />
          Только просроченные
        </button>
        {availableTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`chip cursor-pointer ${filters.tags.includes(tag) ? 'chip-active' : ''}`}
            onClick={() => toggleTagFilter(tag)}
          >
            #{tag}
          </button>
        ))}
        <span className="muted ml-auto text-xs">Найдено: {resultCount}</span>
        {dirty ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={resetFilters}>
            Сбросить
          </button>
        ) : null}
      </div>
    </section>
  );
}
