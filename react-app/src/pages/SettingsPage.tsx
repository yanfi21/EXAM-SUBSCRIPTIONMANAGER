import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SUPPORT_EMAIL, type ThemeMode, type ViewMode } from '../domain/models';
import { downloadSnapshot, parseSnapshot } from '../lib/backup';
import { formatDateTime, toDateKey } from '../lib/date';
import { useAppStore } from '../store/useAppStore';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Icon } from '../components/ui/Icon';
import { useToast } from '../components/ui/Toast';

interface FeedbackForm {
  name: string;
  email: string;
  rating: number;
  message: string;
}

const VIEW_LABELS: Record<ViewMode, string> = {
  list: 'Список',
  board: 'Канбан-доска',
  calendar: 'Календарь',
};

const THEME_LABELS: Record<ThemeMode, string> = {
  light: 'Светлая',
  dark: 'Тёмная',
};

export function SettingsPage() {
  const preferences = useAppStore((store) => store.preferences);
  const setTheme = useAppStore((store) => store.setTheme);
  const setView = useAppStore((store) => store.setView);
  const exportSnapshot = useAppStore((store) => store.exportSnapshot);
  const applySnapshot = useAppStore((store) => store.applySnapshot);
  const addFeedback = useAppStore((store) => store.addFeedback);
  const feedback = useAppStore((store) => store.feedback);
  const loadDemoData = useAppStore((store) => store.loadDemoData);
  const resetAll = useAppStore((store) => store.resetAll);
  const tasks = useAppStore((store) => store.tasks);
  const notes = useAppStore((store) => store.notes);
  const { notify } = useToast();

  const fileRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');
  const [resetOpen, setResetOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FeedbackForm>({
    defaultValues: { name: '', email: '', rating: 5, message: '' },
  });

  const handleExport = () => {
    downloadSnapshot(exportSnapshot(), `tasknotes-${toDateKey(new Date())}.json`);
    notify('Файл резервной копии сформирован');
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const result = parseSnapshot(text);
      applySnapshot(result.snapshot, importMode);
      setImportError(null);
      notify(
        `Импортировано задач: ${result.snapshot.tasks.length}, заметок: ${result.snapshot.notes.length}`,
      );
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Не удалось прочитать файл');
    }
  };

  const submitFeedback = handleSubmit((values) => {
    addFeedback({
      name: values.name.trim() || 'Аноним',
      email: values.email.trim(),
      rating: Number(values.rating),
      message: values.message.trim(),
    });
    reset({ name: '', email: '', rating: 5, message: '' });
    notify('Спасибо! Отзыв сохранён локально');
  });

  const activeTasks = tasks.filter((task) => !task.deletedAt).length;
  const activeNotes = notes.filter((note) => !note.deletedAt).length;

  return (
    <div className="flex flex-col gap-4">
      <section className="card p-4">
        <h2 className="section-title mb-3">Оформление и представление</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <span className="label">Тема оформления</span>
            <div className="flex gap-2">
              {(Object.keys(THEME_LABELS) as ThemeMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`chip cursor-pointer ${preferences.theme === mode ? 'chip-active' : ''}`}
                  onClick={() => setTheme(mode)}
                >
                  <Icon name={mode === 'dark' ? 'moon' : 'sun'} size={13} />
                  {THEME_LABELS[mode]}
                </button>
              ))}
            </div>
          </div>
          <div className="field">
            <span className="label">Представление по умолчанию</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(VIEW_LABELS) as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`chip cursor-pointer ${preferences.view === mode ? 'chip-active' : ''}`}
                  onClick={() => setView(mode)}
                >
                  {VIEW_LABELS[mode]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="card p-4">
        <h2 className="section-title mb-1">Экспорт и импорт данных</h2>
        <p className="muted mb-3">
          Все данные хранятся в localStorage браузера. Сейчас сохранено задач: {activeTasks},
          заметок: {activeNotes}, отзывов: {feedback.length}.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-primary" onClick={handleExport}>
            <Icon name="download" size={15} />
            Выгрузить JSON
          </button>
          <button type="button" className="btn btn-soft" onClick={() => fileRef.current?.click()}>
            <Icon name="upload" size={15} />
            Загрузить из файла
          </button>
          <div className="flex gap-1.5">
            {(['merge', 'replace'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                className={`chip cursor-pointer ${importMode === mode ? 'chip-active' : ''}`}
                onClick={() => setImportMode(mode)}
              >
                {mode === 'merge' ? 'Объединить' : 'Заменить'}
              </button>
            ))}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                void handleImport(file);
              }
              event.target.value = '';
            }}
          />
        </div>
        {importError ? <p className="mt-2 text-sm text-danger">{importError}</p> : null}
      </section>

      <section className="card p-4">
        <h2 className="section-title mb-1">Обратная связь</h2>
        <p className="muted mb-3">
          Отзыв сохраняется локально. Можно также отправить его на почту поддержки:{' '}
          <a className="text-brand underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
        </p>
        <form className="grid gap-3 sm:grid-cols-2" onSubmit={submitFeedback} noValidate>
          <div className="field">
            <label className="label" htmlFor="fb-name">
              Имя
            </label>
            <input id="fb-name" className="input" placeholder="Как к вам обращаться" {...register('name')} />
          </div>
          <div className="field">
            <label className="label" htmlFor="fb-email">
              Email
            </label>
            <input
              id="fb-email"
              className="input"
              type="email"
              placeholder="mail@example.com"
              {...register('email', {
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Некорректный email' },
              })}
            />
            {errors.email ? <span className="text-xs text-danger">{errors.email.message}</span> : null}
          </div>
          <div className="field">
            <label className="label" htmlFor="fb-rating">
              Оценка
            </label>
            <select id="fb-rating" className="select" {...register('rating')}>
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {'★'.repeat(value)}
                </option>
              ))}
            </select>
          </div>
          <div className="field sm:col-span-2">
            <label className="label" htmlFor="fb-message">
              Сообщение
            </label>
            <textarea
              id="fb-message"
              className="textarea"
              placeholder="Что улучшить в приложении?"
              {...register('message', {
                required: 'Напишите сообщение',
                minLength: { value: 10, message: 'Минимум 10 символов' },
              })}
            />
            {errors.message ? (
              <span className="text-xs text-danger">{errors.message.message}</span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className="btn btn-primary">
              Отправить отзыв
            </button>
            <a
              className="btn btn-soft"
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Отзыв о приложении «Задачи и заметки»')}`}
            >
              <Icon name="mail" size={15} />
              Написать письмом
            </a>
          </div>
        </form>

        {feedback.length > 0 ? (
          <ul className="mt-4 flex flex-col gap-2">
            {feedback.slice(0, 5).map((item) => (
              <li key={item.id} className="rounded-xl border border-border px-3 py-2">
                <p className="text-sm font-semibold text-ink">
                  {item.name} · {'★'.repeat(item.rating)}
                </p>
                <p className="muted text-sm">{item.message}</p>
                <p className="muted text-[11px]">{formatDateTime(item.createdAt)}</p>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="card p-4">
        <h2 className="section-title mb-1">Управление данными</h2>
        <p className="muted mb-3">
          Демонстрационный набор поможет быстро оценить возможности приложения.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-soft"
            onClick={() => {
              loadDemoData();
              notify('Загружены демонстрационные данные');
            }}
          >
            Загрузить демо-данные
          </button>
          <button type="button" className="btn btn-danger" onClick={() => setResetOpen(true)}>
            Удалить все данные
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={resetOpen}
        title="Удалить все данные?"
        message="Задачи, заметки, отзывы и настройки будут удалены из localStorage без возможности восстановления."
        confirmLabel="Удалить всё"
        onCancel={() => setResetOpen(false)}
        onConfirm={() => {
          resetAll();
          setResetOpen(false);
          notify('Все данные удалены');
        }}
      />
    </div>
  );
}
