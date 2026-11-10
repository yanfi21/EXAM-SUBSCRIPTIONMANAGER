import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SUPPORT_EMAIL, type Feedback, type ThemeMode, type ViewMode } from '../../core/models/models';
import { BackupService } from '../../core/services/backup.service';
import { FeedbackService } from '../../core/services/feedback.service';
import { NoteService } from '../../core/services/note.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { StorageService } from '../../core/services/storage.service';
import { TaskService } from '../../core/services/task.service';
import { ToastService } from '../../core/services/toast.service';
import { formatDateTime } from '../../core/utils/date.util';
import { ConfirmDialog } from '../../shared/components/confirm-dialog';
import { Icon } from '../../shared/components/icon';

@Component({
  selector: 'app-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Icon, ConfirmDialog],
  templateUrl: './settings-page.html',
})
export class SettingsPage {
  private readonly fb = inject(FormBuilder);
  private readonly backup = inject(BackupService);
  private readonly storage = inject(StorageService);
  private readonly tasks = inject(TaskService);
  private readonly notes = inject(NoteService);
  private readonly toasts = inject(ToastService);
  protected readonly feedback = inject(FeedbackService);
  protected readonly preferences = inject(PreferencesService);

  protected readonly supportEmail = SUPPORT_EMAIL;
  protected readonly mailtoLink = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Отзыв о приложении «Задачи и заметки»')}`;
  protected readonly themes: ThemeMode[] = ['light', 'dark'];
  protected readonly views: ViewMode[] = ['list', 'board', 'calendar'];
  protected readonly themeLabels: Record<ThemeMode, string> = { light: 'Светлая', dark: 'Тёмная' };
  protected readonly viewLabels: Record<ViewMode, string> = {
    list: 'Список',
    board: 'Канбан-доска',
    calendar: 'Календарь',
  };
  protected readonly ratings = [5, 4, 3, 2, 1];

  protected readonly importMode = signal<'merge' | 'replace'>('merge');
  protected readonly importError = signal<string | null>(null);
  protected readonly resetOpen = signal(false);
  protected readonly activeTasks = computed(() => this.tasks.activeTasks().length);
  protected readonly activeNotes = computed(() => this.notes.activeNotes().length);
  protected readonly usedKb = computed(() => (this.storage.usedBytes() / 1024).toFixed(1));

  protected readonly form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.email]],
    rating: [5],
    message: ['', [Validators.required, Validators.minLength(10)]],
  });

  protected stars(count: number): string {
    return '★'.repeat(count);
  }

  protected createdAt(entry: Feedback): string {
    return formatDateTime(entry.createdAt);
  }

  protected export(): void {
    this.backup.export();
    this.toasts.show('Файл резервной копии сформирован');
  }

  protected async import(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    try {
      const result = this.backup.import(await file.text(), this.importMode());
      this.importError.set(null);
      this.toasts.show(
        `Импортировано задач: ${result.snapshot.tasks.length}, заметок: ${result.snapshot.notes.length}`,
      );
    } catch (error) {
      this.importError.set(error instanceof Error ? error.message : 'Не удалось прочитать файл');
    }
  }

  protected submitFeedback(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.feedback.add({
      name: value.name.trim() || 'Аноним',
      email: value.email.trim(),
      rating: Number(value.rating),
      message: value.message.trim(),
    });
    this.form.reset({ name: '', email: '', rating: 5, message: '' });
    this.toasts.show('Спасибо! Отзыв сохранён локально');
  }

  protected loadDemo(): void {
    this.backup.loadDemo();
    this.toasts.show('Загружены демонстрационные данные');
  }

  protected resetAll(): void {
    this.backup.resetAll();
    this.resetOpen.set(false);
    this.toasts.show('Все данные удалены');
  }
}
