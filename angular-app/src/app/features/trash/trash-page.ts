import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import type { Note, Task } from '../../core/models/models';
import { NoteService } from '../../core/services/note.service';
import { TaskService } from '../../core/services/task.service';
import { ToastService } from '../../core/services/toast.service';
import { formatDateTime } from '../../core/utils/date.util';
import { plainTextPreview } from '../../core/utils/markdown.util';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';
import { EmptyState } from '../../shared/components/empty-state';
import { Icon } from '../../shared/components/icon';

@Component({
  selector: 'app-trash-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, EmptyState, ConfirmDialog],
  templateUrl: './trash-page.html',
})
export class TrashPage {
  protected readonly tasks = inject(TaskService);
  protected readonly notes = inject(NoteService);
  private readonly toasts = inject(ToastService);

  protected readonly confirmOpen = signal(false);
  protected readonly total = computed(
    () => this.tasks.deletedTasks().length + this.notes.deletedNotes().length,
  );

  protected deletedAt(item: Task | Note): string {
    return formatDateTime(item.deletedAt);
  }

  protected preview(note: Note): string {
    return plainTextPreview(note.content, 80);
  }

  protected restoreTask(task: Task): void {
    this.tasks.restore(task.id);
    this.toasts.show('Задача восстановлена');
  }

  protected purgeTask(task: Task): void {
    this.tasks.purge(task.id);
    this.toasts.show('Задача удалена навсегда');
  }

  protected restoreNote(note: Note): void {
    this.notes.restore(note.id);
    this.toasts.show('Заметка восстановлена');
  }

  protected purgeNote(note: Note): void {
    this.notes.purge(note.id);
    this.toasts.show('Заметка удалена навсегда');
  }

  protected emptyTrash(): void {
    this.tasks.purgeDeleted();
    this.notes.purgeDeleted();
    this.confirmOpen.set(false);
    this.toasts.show('Корзина очищена');
  }
}
