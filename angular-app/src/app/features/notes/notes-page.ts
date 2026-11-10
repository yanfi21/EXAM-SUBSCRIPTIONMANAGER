import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import type { Note, NoteDraft } from '../../core/models/models';
import { NoteService } from '../../core/services/note.service';
import { ToastService } from '../../core/services/toast.service';
import { formatDateTime } from '../../core/utils/date.util';
import { renderMarkdown } from '../../core/utils/markdown.util';
import { EmptyState } from '../../shared/components/empty-state';
import { Icon } from '../../shared/components/icon';
import { NoteDialog } from './note-dialog';

@Component({
  selector: 'app-notes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, EmptyState, NoteDialog],
  templateUrl: './notes-page.html',
})
export class NotesPage {
  protected readonly notes = inject(NoteService);
  private readonly toasts = inject(ToastService);

  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<Note | null>(null);

  protected preview(note: Note): string {
    return renderMarkdown(note.content);
  }

  protected updatedAt(note: Note): string {
    return formatDateTime(note.updatedAt);
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(note: Note): void {
    this.editing.set(note);
    this.dialogOpen.set(true);
  }

  protected close(): void {
    this.dialogOpen.set(false);
    this.editing.set(null);
  }

  protected save(draft: NoteDraft): void {
    const current = this.editing();
    if (current) {
      this.notes.update(current.id, draft);
      this.toasts.show('Заметка обновлена');
    } else {
      this.notes.create(draft);
      this.toasts.show('Заметка создана');
    }
    this.close();
  }

  protected remove(note: Note): void {
    this.notes.softDelete(note.id);
    this.toasts.show('Заметка перемещена в корзину', {
      label: 'Вернуть',
      run: () => this.notes.restore(note.id),
    });
  }
}
