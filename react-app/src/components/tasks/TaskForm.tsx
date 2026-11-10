import { useForm } from 'react-hook-form';
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
  type Task,
  type TaskDraft,
} from '../../domain/models';
import { parseTags } from '../../lib/filters';

interface FormValues {
  title: string;
  description: string;
  priority: Task['priority'];
  status: Task['status'];
  dueDate: string;
  tags: string;
}

interface TaskFormProps {
  task: Task | null;
  formId: string;
  onSubmit: (draft: TaskDraft) => void;
}

export function TaskForm({ task, formId, onSubmit }: TaskFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      priority: task?.priority ?? 'medium',
      status: task?.status ?? 'todo',
      dueDate: task?.dueDate ?? '',
      tags: task?.tags.join(', ') ?? '',
    },
  });

  const submit = handleSubmit((values) => {
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      priority: values.priority,
      status: values.status,
      dueDate: values.dueDate ? values.dueDate : null,
      tags: parseTags(values.tags),
    });
  });

  return (
    <form id={formId} className="flex flex-col gap-4" onSubmit={submit} noValidate>
      <div className="field">
        <label className="label" htmlFor={`${formId}-title`}>
          Заголовок
        </label>
        <input
          id={`${formId}-title`}
          className="input"
          autoFocus
          placeholder="Например: подготовить отчёт"
          aria-invalid={Boolean(errors.title)}
          {...register('title', {
            required: 'Укажите заголовок задачи',
            minLength: { value: 3, message: 'Минимум 3 символа' },
            maxLength: { value: 160, message: 'Максимум 160 символов' },
          })}
        />
        {errors.title ? <span className="text-xs text-danger">{errors.title.message}</span> : null}
      </div>

      <div className="field">
        <label className="label" htmlFor={`${formId}-description`}>
          Описание
        </label>
        <textarea
          id={`${formId}-description`}
          className="textarea"
          placeholder="Детали, подзадачи, ссылки"
          {...register('description', { maxLength: { value: 2000, message: 'Слишком длинно' } })}
        />
        {errors.description ? (
          <span className="text-xs text-danger">{errors.description.message}</span>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label className="label" htmlFor={`${formId}-priority`}>
            Приоритет
          </label>
          <select id={`${formId}-priority`} className="select" {...register('priority')}>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor={`${formId}-status`}>
            Статус
          </label>
          <select id={`${formId}-status`} className="select" {...register('status')}>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor={`${formId}-due`}>
            Дедлайн
          </label>
          <input id={`${formId}-due`} type="date" className="input" {...register('dueDate')} />
        </div>

        <div className="field">
          <label className="label" htmlFor={`${formId}-tags`}>
            Теги
          </label>
          <input
            id={`${formId}-tags`}
            className="input"
            placeholder="работа, учёба"
            {...register('tags')}
          />
        </div>
      </div>
    </form>
  );
}
