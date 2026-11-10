import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { TaskDialogProvider } from './components/tasks/TaskDialog';
import { ToastProvider } from './components/ui/Toast';
import { BoardView } from './pages/BoardView';
import { CalendarView } from './pages/CalendarView';
import { ListView } from './pages/ListView';
import { NotFoundPage } from './pages/NotFoundPage';
import { NotesPage } from './pages/NotesPage';
import { SettingsPage } from './pages/SettingsPage';
import { StatsPage } from './pages/StatsPage';
import { TasksPage } from './pages/TasksPage';
import { TrashPage } from './pages/TrashPage';
import { startPersistence, useAppStore } from './store/useAppStore';

export default function App() {
  const preferredView = useAppStore((store) => store.preferences.view);

  useEffect(() => startPersistence(), []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <TaskDialogProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<Navigate to={`/tasks/${preferredView}`} replace />} />
              <Route path="tasks" element={<TasksPage />}>
                <Route index element={<Navigate to="list" replace />} />
                <Route path="list" element={<ListView />} />
                <Route path="board" element={<BoardView />} />
                <Route path="calendar" element={<CalendarView />} />
              </Route>
              <Route path="notes" element={<NotesPage />} />
              <Route path="stats" element={<StatsPage />} />
              <Route path="trash" element={<TrashPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </TaskDialogProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
