import { useMemo, useState } from 'react';
import { formatDateTime } from '../lib/date';
import { plainTextPreview } from '../lib/markdown';
import { useAppStore } from '../store/useAppStore';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

export function TrashPage() {
  const tasks = useAppStore((store) => store.tasks);
  const notes = useAppStore((store) => store.notes);
  const restoreTask = useAppStore((store) => store.restoreTask);
  const purgeTask = useAppStore((store) => store.purgeTask);
  const restoreNote = useAppStore((store) => store.restoreNote);
  const purgeNote = useAppStore((store) => store.purgeNote);
  const emptyTrash = useAppStore((store) => store.emptyTrash);
  const { notify } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const deletedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.deletedAt)
        .sort((a, b) => (b.deletedAt ?? '').localeCompare(a.deletedAt ?? '')),
    [tasks],
  );
  const deletedNotes = useMemo(
    () =>
      notes
        .filter((note) => note.deletedAt)
        .sort((a, b) => (b.deletedAt ?? '').localeCompare(a.deletedAt ?? '')),
    [notes],
  );

  const total = deletedTasks.length + deletedNotes.length;

  if (total === 0) {
    return (
      <EmptyState
        icon="trash"
        title="Корзина пуста"
        description="Удалённые задачи и заметки попадают сюда, и их можно восстановить в один клик."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="card flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h2 className="section-title">В корзине {total} элементов</h2>
          <p className="muted">Элементы хранятся до полного удаления вручную.</p>
        </div>
        <button type="button" className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
          <Icon name="trash" size={15} />
          Очистить корзину
        </button>
      </section>

      {deletedTasks.length > 0 ? (
        <section className="card p-4">
          <h3 className="section-title mb-3">Задачи ({deletedTasks.length})</h3>
          <ul className="flex flex-col gap-2">
            {deletedTasks.map((task) => (
              <li
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{task.title}</p>
                  <p className="muted text-xs">Удалено {formatDateTime(task.deletedAt)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-soft btn-sm"
                    onClick={() => {
                      restoreTask(task.id);
                      notify('Задача восстановлена');
                    }}
                  >
                    <Icon name="restore" size={14} />
                    Восстановить
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-danger"
                    onClick={() => {
                      purgeTask(task.id);
                      notify('Задача удалена навсегда');
                    }}
                    aria-label="Удалить навсегда"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {deletedNotes.length > 0 ? (
        <section className="card p-4">
          <h3 className="section-title mb-3">Заметки ({deletedNotes.length})</h3>
          <ul className="flex flex-col gap-2">
            {deletedNotes.map((note) => (
              <li
                key={note.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{note.title}</p>
                  <p className="muted truncate text-xs">{plainTextPreview(note.content, 80)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="btn btn-soft btn-sm"
                    onClick={() => {
                      restoreNote(note.id);
                      notify('Заметка восстановлена');
                    }}
                  >
                    <Icon name="restore" size={14} />
                    Восстановить
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm text-danger"
                    onClick={() => {
                      purgeNote(note.id);
                      notify('Заметка удалена навсегда');
                    }}
                    aria-label="Удалить навсегда"
                  >
                    <Icon name="close" size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        title="Очистить корзину?"
        message="Все удалённые задачи и заметки будут стёрты безвозвратно."
        confirmLabel="Очистить"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          emptyTrash();
          setConfirmOpen(false);
          notify('Корзина очищена');
        }}
      />
    </div>
  );
}
