import type { Task } from '../domain/models';
import { useAppStore } from '../store/useAppStore';
import { KanbanBoard } from '../components/tasks/KanbanBoard';
import { useToast } from '../components/ui/Toast';
import { useTaskDialog } from '../components/tasks/TaskDialog';
import { useVisibleTasks } from './TasksPage';

export function BoardView() {
  const visibleTasks = useVisibleTasks();
  const moveTask = useAppStore((store) => store.moveTask);
  const deleteTask = useAppStore((store) => store.deleteTask);
  const restoreTask = useAppStore((store) => store.restoreTask);
  const { openCreate, openEdit } = useTaskDialog();
  const { notify } = useToast();

  const handleDelete = (task: Task) => {
    deleteTask(task.id);
    notify('Задача перемещена в корзину', { label: 'Вернуть', run: () => restoreTask(task.id) });
  };

  return (
    <KanbanBoard
      tasks={visibleTasks}
      onMove={moveTask}
      onEdit={openEdit}
      onDelete={handleDelete}
      onCreate={(status) => openCreate(status)}
    />
  );
}
