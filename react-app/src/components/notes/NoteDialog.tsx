import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Note, NoteDraft } from '../../domain/models';
import { renderMarkdown } from '../../lib/markdown';
import { Modal } from '../ui/Modal';

interface NoteDialogProps {
  open: boolean;
  note: Note | null;
  onClose: () => void;
  onSubmit: (draft: NoteDraft) => void;
}

export function NoteDialog({ open, note, onClose, onSubmit }: NoteDialogProps) {
  const [preview, setPreview] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NoteDraft>({
    defaultValues: { title: note?.title ?? '', content: note?.content ?? '' },
  });

  const content = watch('content');

  return (
    <Modal
      open={open}
      title={note ? 'Редактирование заметки' : 'Новая заметка'}
      description="Поддерживается Markdown-подобное форматирование: #, **жирный**, *курсив*, списки, цитаты"
      onClose={onClose}
      width="lg"
      footer={
        <>
          <button type="button" className="btn btn-soft" onClick={() => setPreview(!preview)}>
            {preview ? 'Редактор' : 'Предпросмотр'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button type="submit" form="note-form" className="btn btn-primary">
            {note ? 'Сохранить' : 'Создать заметку'}
          </button>
        </>
      }
    >
      <form
        id="note-form"
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) =>
          onSubmit({ title: values.title.trim(), content: values.content }),
        )}
        noValidate
      >
        <div className="field">
          <label className="label" htmlFor="note-title">
            Заголовок
          </label>
          <input
            id="note-title"
            className="input"
            autoFocus
            placeholder="Например: план на неделю"
            {...register('title', {
              required: 'Укажите заголовок заметки',
              maxLength: { value: 160, message: 'Максимум 160 символов' },
            })}
          />
          {errors.title ? <span className="text-xs text-danger">{errors.title.message}</span> : null}
        </div>

        <div className="field">
          <label className="label" htmlFor="note-content">
            Текст
          </label>
          {preview ? (
            <div
              className="min-h-56 rounded-xl border border-border bg-subtle/40 px-3 py-2 text-sm text-ink"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content || '') }}
            />
          ) : (
            <textarea
              id="note-content"
              className="textarea min-h-56 font-mono text-[13px]"
              placeholder={'# Заголовок\n\n- пункт списка\n- [ ] чекбокс\n\n> цитата'}
              {...register('content')}
            />
          )}
        </div>
      </form>
    </Modal>
  );
}
