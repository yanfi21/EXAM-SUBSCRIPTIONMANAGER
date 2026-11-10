import { CalendarBoard } from '../components/tasks/CalendarBoard';
import { useTaskDialog } from '../components/tasks/TaskDialog';
import { useVisibleTasks } from './TasksPage';

export function CalendarView() {
  const visibleTasks = useVisibleTasks();
  const { openCreate, openEdit } = useTaskDialog();

  return (
    <CalendarBoard
      tasks={visibleTasks}
      onEdit={openEdit}
      onCreate={(dueDate) => openCreate('todo', dueDate)}
    />
  );
}
