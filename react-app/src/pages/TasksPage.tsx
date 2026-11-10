import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useOutletContext } from 'react-router-dom';
import type { Task, ViewMode } from '../domain/models';
import { collectTags, selectTasks } from '../lib/filters';
import { useAppStore } from '../store/useAppStore';
import { TaskFiltersBar } from '../components/tasks/TaskFiltersBar';
import { TaskOfTheDay } from '../components/tasks/TaskOfTheDay';
import { ViewSwitcher } from '../components/tasks/ViewSwitcher';
import { useTaskDialog } from '../components/tasks/TaskDialog';

interface TasksOutletContext {
  visibleTasks: Task[];
}

export function TasksPage() {
  const location = useLocation();
  const tasks = useAppStore((store) => store.tasks);
  const filters = useAppStore((store) => store.preferences.filters);
  const setView = useAppStore((store) => store.setView);
  const { openEdit } = useTaskDialog();

  const visibleTasks = useMemo(() => selectTasks(tasks, filters), [tasks, filters]);
  const availableTags = useMemo(() => collectTags(tasks), [tasks]);

  useEffect(() => {
    const segment = location.pathname.split('/')[2];
    if (segment === 'list' || segment === 'board' || segment === 'calendar') {
      setView(segment as ViewMode);
    }
  }, [location.pathname, setView]);

  return (
    <div className="flex flex-col gap-4">
      <TaskOfTheDay tasks={tasks} onOpen={openEdit} />
      <ViewSwitcher />
      <TaskFiltersBar availableTags={availableTags} resultCount={visibleTasks.length} />
      <Outlet context={{ visibleTasks } satisfies TasksOutletContext} />
    </div>
  );
}

export function useVisibleTasks(): Task[] {
  return useOutletContext<TasksOutletContext>().visibleTasks;
}
