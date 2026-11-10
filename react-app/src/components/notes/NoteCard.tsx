import type { Note } from '../../domain/models';
import { formatDateTime } from '../../lib/date';
import { renderMarkdown } from '../../lib/markdown';
import { Icon } from '../ui/Icon';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <article className="card flex flex-col gap-2 p-4 transition hover:shadow-md">
      <header className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold break-words text-ink">{note.title}</h3>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(note)}
            aria-label="Редактировать заметку"
          >
            <Icon name="edit" size={14} />
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm text-danger"
            onClick={() => onDelete(note)}
            aria-label="Удалить заметку"
          >
            <Icon name="trash" size={14} />
          </button>
        </div>
      </header>
      <div
        className="max-h-48 overflow-hidden text-sm text-ink/90"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(note.content) }}
      />
      <footer className="muted mt-auto text-xs">Обновлено {formatDateTime(note.updatedAt)}</footer>
    </article>
  );
}
