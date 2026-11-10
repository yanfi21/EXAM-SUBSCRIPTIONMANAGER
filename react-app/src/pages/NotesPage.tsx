import { useMemo, useState } from 'react';
import type { Note, NoteDraft } from '../domain/models';
import { useAppStore } from '../store/useAppStore';
import { NoteCard } from '../components/notes/NoteCard';
import { NoteDialog } from '../components/notes/NoteDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

export function NotesPage() {
  const notes = useAppStore((store) => store.notes);
  const createNote = useAppStore((store) => store.createNote);
  const updateNote = useAppStore((store) => store.updateNote);
  const deleteNote = useAppStore((store) => store.deleteNote);
  const restoreNote = useAppStore((store) => store.restoreNote);
  const { notify } = useToast();

  const [search, setSearch] = useState('');
  const [dialog, setDialog] = useState<{ open: boolean; note: Note | null }>({
    open: false,
    note: null,
  });

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notes
      .filter((note) => !note.deletedAt)
      .filter((note) =>
        query ? `${note.title} ${note.content}`.toLowerCase().includes(query) : true,
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [notes, search]);

  const submit = (draft: NoteDraft) => {
    if (dialog.note) {
      updateNote(dialog.note.id, draft);
      notify('Заметка обновлена');
    } else {
      createNote(draft);
      notify('Заметка создана');
    }
    setDialog({ open: false, note: null });
  };

  const remove = (note: Note) => {
    deleteNote(note.id);
    notify('Заметка перемещена в корзину', { label: 'Вернуть', run: () => restoreNote(note.id) });
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="field flex-1">
          <label className="label" htmlFor="note-search">
            Поиск по заметкам
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted">
              <Icon name="search" size={15} />
            </span>
            <input
              id="note-search"
              data-search-input
              type="search"
              className="input pl-9"
              placeholder="Заголовок или текст заметки"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setDialog({ open: true, note: null })}
        >
          <Icon name="plus" size={15} />
          Новая заметка
        </button>
      </section>

      {visible.length === 0 ? (
        <EmptyState
          icon="note"
          title="Заметок пока нет"
          description="Создайте первую заметку: поддерживаются заголовки, списки, цитаты и выделение текста."
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setDialog({ open: true, note: null })}
            >
              Создать заметку
            </button>
          }
        />
      ) : (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={(selected) => setDialog({ open: true, note: selected })}
              onDelete={remove}
            />
          ))}
        </section>
      )}

      {dialog.open ? (
        <NoteDialog
          key={dialog.note?.id ?? 'new-note'}
          open={dialog.open}
          note={dialog.note}
          onClose={() => setDialog({ open: false, note: null })}
          onSubmit={submit}
        />
      ) : null}
    </div>
  );
}
