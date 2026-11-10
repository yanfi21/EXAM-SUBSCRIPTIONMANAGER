import type { Task } from '../domain/models';
import { useAppStore } from '../store/useAppStore';
import { TaskCard } from '../components/tasks/TaskCard';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { useTaskDialog } from '../components/tasks/TaskDialog';
import { useVisibleTasks } from './TasksPage';

export function ListView() {
  const visibleTasks = useVisibleTasks();
  const toggleTask = useAppStore((store) => store.toggleTask);
  const setTaskStatus = useAppStore((store) => store.setTaskStatus);
  const deleteTask = useAppStore((store) => store.deleteTask);
  const restoreTask = useAppStore((store) => store.restoreTask);
  const toggleTagFilter = useAppStore((store) => store.toggleTagFilter);
  const { openCreate, openEdit } = useTaskDialog();
  const { notify } = useToast();

  const handleDelete = (task: Task) => {
    deleteTask(task.id);
    notify('Задача перемещена в корзину', { label: 'Вернуть', run: () => restoreTask(task.id) });
  };

  if (visibleTasks.length === 0) {
    return (
      <EmptyState
        icon="list"
        title="Задачи не найдены"
        description="Измените условия поиска и фильтрации или создайте новую задачу."
        action={
          <button type="button" className="btn btn-primary" onClick={() => openCreate()}>
            Создать задачу
          </button>
        }
      />
    );
  }

  return (
    <section className="flex flex-col gap-2.5">
      {visibleTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={toggleTask}
          onEdit={openEdit}
          onDelete={handleDelete}
          onStatusChange={setTaskStatus}
          onTagClick={toggleTagFilter}
        />
      ))}
    </section>
  );
}
