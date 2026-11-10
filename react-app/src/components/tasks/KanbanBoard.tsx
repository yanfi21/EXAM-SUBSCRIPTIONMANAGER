import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { STATUSES, STATUS_LABELS, type Task, type TaskStatus } from '../../domain/models';
import { dueLabel } from '../../lib/date';
import { isOverdue } from '../../lib/filters';
import { Icon } from '../ui/Icon';
import { DueBadge, PriorityBadge } from './TaskBadges';

interface KanbanBoardProps {
  tasks: Task[];
  onMove: (activeId: string, overId: string | null, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onCreate: (status: TaskStatus) => void;
}

interface CardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function CardBody({ task, onEdit, onDelete }: CardProps) {
  const overdue = isOverdue(task);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold break-words text-ink">{task.title}</h4>
        <span className="text-muted">
          <Icon name="drag" size={14} />
        </span>
      </div>
      {task.description ? <p className="muted line-clamp-2">{task.description}</p> : null}
      <div className="flex flex-wrap items-center gap-1.5">
        <PriorityBadge priority={task.priority} />
        {task.dueDate ? <DueBadge label={dueLabel(task.dueDate)} overdue={overdue} /> : null}
      </div>
      {task.tags.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span key={tag} className="chip">
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex justify-end gap-1">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onEdit(task)}
          aria-label="Редактировать"
        >
          <Icon name="edit" size={14} />
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm text-danger"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onDelete(task)}
          aria-label="Удалить"
        >
          <Icon name="trash" size={14} />
        </button>
      </div>
    </div>
  );
}

function SortableCard({ task, onEdit, onDelete }: CardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`card cursor-grab p-3 active:cursor-grabbing ${isDragging ? 'opacity-40' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardBody task={task} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

interface ColumnProps extends Omit<KanbanBoardProps, 'tasks' | 'onMove'> {
  status: TaskStatus;
  tasks: Task[];
}

function Column({ status, tasks, onEdit, onDelete, onCreate }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: `column-${status}`, data: { status } });

  return (
    <section className="flex min-w-0 flex-col gap-3">
      <header className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-ink">{STATUS_LABELS[status]}</h3>
          <span className="chip">{tasks.length}</span>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onCreate(status)}
          aria-label={`Добавить задачу в «${STATUS_LABELS[status]}»`}
        >
          <Icon name="plus" size={15} />
        </button>
      </header>
      <div
        ref={setNodeRef}
        className={`scroll-thin flex min-h-[200px] flex-col gap-2.5 rounded-2xl border border-dashed p-2.5 transition ${
          isOver ? 'border-brand bg-brand-soft/40' : 'border-border bg-subtle/50'
        }`}
      >
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
        {tasks.length === 0 ? (
          <p className="muted px-2 py-6 text-center text-xs">Перетащите задачу сюда</p>
        ) : null}
      </div>
    </section>
  );
}

export function KanbanBoard({ tasks, onMove, onEdit, onDelete, onCreate }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const grouped = useMemo(() => {
    return STATUSES.reduce(
      (acc, status) => ({ ...acc, [status]: tasks.filter((task) => task.status === status) }),
      {} as Record<TaskStatus, Task[]>,
    );
  }, [tasks]);

  const activeTask = tasks.find((task) => task.id === activeId) ?? null;

  const handleStart = (event: DragStartEvent) => setActiveId(String(event.active.id));

  const handleEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) {
      return;
    }
    const overId = String(over.id);
    const activeTaskId = String(active.id);
    if (overId.startsWith('column-')) {
      const status = overId.replace('column-', '') as TaskStatus;
      onMove(activeTaskId, null, status);
      return;
    }
    const target = tasks.find((task) => task.id === overId);
    if (!target || target.id === activeTaskId) {
      return;
    }
    onMove(activeTaskId, target.id, target.status);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleStart}
      onDragEnd={handleEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {STATUSES.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={grouped[status]}
            onEdit={onEdit}
            onDelete={onDelete}
            onCreate={onCreate}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask ? (
          <div className="card w-72 p-3 shadow-lg">
            <CardBody task={activeTask} onEdit={onEdit} onDelete={onDelete} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
