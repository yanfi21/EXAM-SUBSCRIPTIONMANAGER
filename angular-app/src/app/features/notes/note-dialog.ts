import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Note, NoteDraft } from '../../core/models/models';
import { renderMarkdown } from '../../core/utils/markdown.util';
import { Modal } from '../../shared/components/modal';

@Component({
  selector: 'app-note-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Modal],
  template: `
    <app-modal
      [title]="note() ? 'Редактирование заметки' : 'Новая заметка'"
      description="Поддерживается Markdown-подобное форматирование: #, **жирный**, *курсив*, списки, цитаты"
      width="lg"
      (closed)="cancelled.emit()"
    >
      <form id="note-form" class="flex flex-col gap-4" [formGroup]="form" (ngSubmit)="submit()">
        <div class="field">
          <label class="label" for="note-title">Заголовок</label>
          <input
            id="note-title"
            class="input"
            formControlName="title"
            placeholder="Например: план на неделю"
          />
          @if (form.controls.title.invalid && form.controls.title.touched) {
            <span class="text-xs text-danger">Укажите заголовок заметки (до 160 символов)</span>
          }
        </div>

        <div class="field">
          <label class="label" for="note-content">Текст</label>
          @if (preview()) {
            <div
              class="markdown min-h-56 rounded-xl border border-border bg-subtle/40 px-3 py-2"
              [innerHTML]="rendered()"
            ></div>
          } @else {
            <textarea
              id="note-content"
              class="textarea min-h-56 font-mono text-[13px]"
              formControlName="content"
              placeholder="# Заголовок&#10;&#10;- пункт списка&#10;- [ ] чекбокс&#10;&#10;> цитата"
            ></textarea>
          }
        </div>
      </form>

      <ng-container modalFooter>
        <button type="button" class="btn btn-soft" (click)="preview.set(!preview())">
          {{ preview() ? 'Редактор' : 'Предпросмотр' }}
        </button>
        <button type="button" class="btn btn-ghost" (click)="cancelled.emit()">Отмена</button>
        <button type="submit" form="note-form" class="btn btn-primary">
          {{ note() ? 'Сохранить' : 'Создать заметку' }}
        </button>
      </ng-container>
    </app-modal>
  `,
})
export class NoteDialog {
  private readonly fb = inject(FormBuilder);

  readonly note = input<Note | null>(null);
  readonly saved = output<NoteDraft>();
  readonly cancelled = output<void>();

  protected readonly preview = signal(false);
  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    content: [''],
  });

  private readonly content = signal('');
  protected readonly rendered = computed(() => renderMarkdown(this.content()));

  constructor() {
    effect(() => {
      const current = this.note();
      this.form.reset({ title: current?.title ?? '', content: current?.content ?? '' });
      this.content.set(current?.content ?? '');
    });

    this.form.controls.content.valueChanges.subscribe((value) => this.content.set(value));
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.saved.emit({ title: value.title.trim(), content: value.content });
  }
}
