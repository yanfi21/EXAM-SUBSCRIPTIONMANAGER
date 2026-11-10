import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import type { Task, TaskStatus } from '../../domain/models';
import { useAppStore } from '../../store/useAppStore';

interface TaskDialogContextValue {
  openCreate: (status?: TaskStatus, dueDate?: string) => void;
  openEdit: (task: Task) => void;
}

const TaskDialogContext = createContext<TaskDialogContextValue | null>(null);

interface DialogState {
  open: boolean;
  task: Task | null;
  status: TaskStatus;
  dueDate: string | null;
}

const CLOSED: DialogState = { open: false, task: null, status: 'todo', dueDate: null };

export function TaskDialogProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>(CLOSED);
  const createTask = useAppStore((store) => store.createTask);
  const updateTask = useAppStore((store) => store.updateTask);

  const openCreate = useCallback((status: TaskStatus = 'todo', dueDate?: string) => {
    setState({ open: true, task: null, status, dueDate: dueDate ?? null });
  }, []);

  const openEdit = useCallback((task: Task) => {
    setState({ open: true, task, status: task.status, dueDate: task.dueDate });
  }, []);

  const close = useCallback(() => setState(CLOSED), []);

  const value = useMemo(() => ({ openCreate, openEdit }), [openCreate, openEdit]);

  const seed: Task | null = state.task
    ? state.task
    : ({
        id: '',
        title: '',
        description: '',
        priority: 'medium',
        status: state.status,
        dueDate: state.dueDate,
        tags: [],
        createdAt: '',
        updatedAt: '',
        completedAt: null,
        deletedAt: null,
      } as Task);

  return (
    <TaskDialogContext.Provider value={value}>
      {children}
      <Modal
        open={state.open}
        title={state.task ? 'Редактирование задачи' : 'Новая задача'}
        description={
          state.task ? 'Измените поля и сохраните изменения' : 'Заполните поля и добавьте задачу'
        }
        onClose={close}
        footer={
          <>
            <button type="button" className="btn btn-soft" onClick={close}>
              Отмена
            </button>
            <button type="submit" form="task-form" className="btn btn-primary">
              {state.task ? 'Сохранить' : 'Создать задачу'}
            </button>
          </>
        }
      >
        {state.open ? (
          <TaskForm
            key={state.task?.id ?? `new-${state.status}-${state.dueDate ?? ''}`}
            formId="task-form"
            task={seed}
            onSubmit={(draft) => {
              if (state.task) {
                updateTask(state.task.id, draft);
              } else {
                createTask(draft);
              }
              close();
            }}
          />
        ) : null}
      </Modal>
    </TaskDialogContext.Provider>
  );
}

export function useTaskDialog(): TaskDialogContextValue {
  const context = useContext(TaskDialogContext);
  if (!context) {
    throw new Error('useTaskDialog must be used within TaskDialogProvider');
  }
  return context;
}
