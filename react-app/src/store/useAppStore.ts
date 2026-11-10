import { create } from 'zustand';
import {
  DEFAULT_FILTERS,
  DEFAULT_PREFERENCES,
  SCHEMA_VERSION,
  type AppSnapshot,
  type Feedback,
  type Note,
  type NoteDraft,
  type Preferences,
  type Task,
  type TaskDraft,
  type TaskFilters,
  type TaskStatus,
  type ThemeMode,
  type ViewMode,
} from '../domain/models';
import { createId } from '../lib/id';
import { STORAGE_KEYS, readValue, writeValue } from '../lib/storage';
import { createSnapshot, normalizeNote, normalizePreferences, normalizeTask } from '../lib/backup';
import { buildDemoNotes, buildDemoTasks } from '../lib/demo';

interface AppState {
  tasks: Task[];
  notes: Note[];
  feedback: Feedback[];
  preferences: Preferences;
  createTask: (draft: TaskDraft) => Task;
  updateTask: (id: string, patch: Partial<TaskDraft>) => void;
  toggleTask: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  moveTask: (activeId: string, overId: string | null, status: TaskStatus) => void;
  deleteTask: (id: string) => void;
  restoreTask: (id: string) => void;
  purgeTask: (id: string) => void;
  createNote: (draft: NoteDraft) => Note;
  updateNote: (id: string, patch: Partial<NoteDraft>) => void;
  deleteNote: (id: string) => void;
  restoreNote: (id: string) => void;
  purgeNote: (id: string) => void;
  emptyTrash: () => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setView: (view: ViewMode) => void;
  setFilters: (patch: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  toggleTagFilter: (tag: string) => void;
  addFeedback: (input: Omit<Feedback, 'id' | 'createdAt'>) => Feedback;
  applySnapshot: (snapshot: AppSnapshot, mode: 'replace' | 'merge') => void;
  exportSnapshot: () => AppSnapshot;
  loadDemoData: () => void;
  resetAll: () => void;
}

function readTasks(): Task[] {
  const raw = readValue<unknown[]>(STORAGE_KEYS.tasks, []);
  return Array.isArray(raw)
    ? raw.map(normalizeTask).filter((task): task is Task => task !== null)
    : [];
}

function readNotes(): Note[] {
  const raw = readValue<unknown[]>(STORAGE_KEYS.notes, []);
  return Array.isArray(raw)
    ? raw.map(normalizeNote).filter((note): note is Note => note !== null)
    : [];
}

function readFeedback(): Feedback[] {
  const raw = readValue<Feedback[]>(STORAGE_KEYS.feedback, []);
  return Array.isArray(raw) ? raw : [];
}

function initialPreferences(): Preferences {
  const stored = readValue<unknown>(STORAGE_KEYS.preferences, null);
  if (stored) {
    return normalizePreferences(stored);
  }
  const prefersDark =
    typeof globalThis.matchMedia === 'function' &&
    globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
  return { ...DEFAULT_PREFERENCES, theme: prefersDark ? 'dark' : 'light' };
}

function bootstrap(): Pick<AppState, 'tasks' | 'notes' | 'feedback' | 'preferences'> {
  const initialized = readValue<number | null>(STORAGE_KEYS.schemaVersion, null);
  if (initialized === null) {
    const tasks = buildDemoTasks();
    const notes = buildDemoNotes();
    writeValue(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION);
    writeValue(STORAGE_KEYS.tasks, tasks);
    writeValue(STORAGE_KEYS.notes, notes);
    return { tasks, notes, feedback: [], preferences: initialPreferences() };
  }
  return {
    tasks: readTasks(),
    notes: readNotes(),
    feedback: readFeedback(),
    preferences: initialPreferences(),
  };
}

function stamp(): string {
  return new Date().toISOString();
}

function withCompletion(task: Task, status: TaskStatus, now: string): Task {
  return {
    ...task,
    status,
    completedAt: status === 'done' ? (task.completedAt ?? now) : null,
    updatedAt: now,
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  ...bootstrap(),

  createTask: (draft) => {
    const now = stamp();
    const task: Task = {
      id: createId('task'),
      title: draft.title.trim(),
      description: draft.description.trim(),
      priority: draft.priority,
      status: draft.status,
      dueDate: draft.dueDate,
      tags: draft.tags,
      createdAt: now,
      updatedAt: now,
      completedAt: draft.status === 'done' ? now : null,
      deletedAt: null,
    };
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  updateTask: (id, patch) => {
    const now = stamp();
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) {
          return task;
        }
        const next: Task = { ...task, ...patch, updatedAt: now };
        if (patch.status && patch.status !== task.status) {
          return withCompletion(next, patch.status, now);
        }
        return next;
      }),
    }));
  },

  toggleTask: (id) => {
    const task = get().tasks.find((item) => item.id === id);
    if (!task) {
      return;
    }
    get().setTaskStatus(id, task.status === 'done' ? 'todo' : 'done');
  },

  setTaskStatus: (id, status) => {
    const now = stamp();
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? withCompletion(task, status, now) : task)),
    }));
  },

  moveTask: (activeId, overId, status) => {
    set((state) => {
      const now = stamp();
      const tasks = state.tasks.map((task) =>
        task.id === activeId && task.status !== status ? withCompletion(task, status, now) : task,
      );
      const fromIndex = tasks.findIndex((task) => task.id === activeId);
      if (fromIndex < 0) {
        return { tasks };
      }
      const [moved] = tasks.splice(fromIndex, 1);
      const toIndex = overId ? tasks.findIndex((task) => task.id === overId) : -1;
      if (toIndex < 0) {
        tasks.push(moved);
      } else {
        tasks.splice(toIndex, 0, moved);
      }
      return { tasks };
    });
  },

  deleteTask: (id) => {
    const now = stamp();
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, deletedAt: now, updatedAt: now } : task,
      ),
    }));
  },

  restoreTask: (id) => {
    const now = stamp();
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, deletedAt: null, updatedAt: now } : task,
      ),
    }));
  },

  purgeTask: (id) => {
    set((state) => ({ tasks: state.tasks.filter((task) => task.id !== id) }));
  },

  createNote: (draft) => {
    const now = stamp();
    const note: Note = {
      id: createId('note'),
      title: draft.title.trim() || 'Без названия',
      content: draft.content,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    set((state) => ({ notes: [note, ...state.notes] }));
    return note;
  },

  updateNote: (id, patch) => {
    const now = stamp();
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, ...patch, updatedAt: now } : note,
      ),
    }));
  },

  deleteNote: (id) => {
    const now = stamp();
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, deletedAt: now, updatedAt: now } : note,
      ),
    }));
  },

  restoreNote: (id) => {
    const now = stamp();
    set((state) => ({
      notes: state.notes.map((note) =>
        note.id === id ? { ...note, deletedAt: null, updatedAt: now } : note,
      ),
    }));
  },

  purgeNote: (id) => {
    set((state) => ({ notes: state.notes.filter((note) => note.id !== id) }));
  },

  emptyTrash: () => {
    set((state) => ({
      tasks: state.tasks.filter((task) => !task.deletedAt),
      notes: state.notes.filter((note) => !note.deletedAt),
    }));
  },

  setTheme: (theme) => {
    set((state) => ({ preferences: { ...state.preferences, theme } }));
  },

  toggleTheme: () => {
    set((state) => ({
      preferences: {
        ...state.preferences,
        theme: state.preferences.theme === 'dark' ? 'light' : 'dark',
      },
    }));
  },

  setView: (view) => {
    set((state) => ({ preferences: { ...state.preferences, view } }));
  },

  setFilters: (patch) => {
    set((state) => ({
      preferences: { ...state.preferences, filters: { ...state.preferences.filters, ...patch } },
    }));
  },

  resetFilters: () => {
    set((state) => ({ preferences: { ...state.preferences, filters: { ...DEFAULT_FILTERS } } }));
  },

  toggleTagFilter: (tag) => {
    set((state) => {
      const tags = state.preferences.filters.tags.includes(tag)
        ? state.preferences.filters.tags.filter((item) => item !== tag)
        : [...state.preferences.filters.tags, tag];
      return { preferences: { ...state.preferences, filters: { ...state.preferences.filters, tags } } };
    });
  },

  addFeedback: (input) => {
    const entry: Feedback = { ...input, id: createId('fb'), createdAt: stamp() };
    set((state) => ({ feedback: [entry, ...state.feedback] }));
    return entry;
  },

  applySnapshot: (snapshot, mode) => {
    set((state) => {
      if (mode === 'replace') {
        return {
          tasks: snapshot.tasks,
          notes: snapshot.notes,
          feedback: snapshot.feedback,
          preferences: snapshot.preferences,
        };
      }
      const taskMap = new Map(state.tasks.map((task) => [task.id, task]));
      snapshot.tasks.forEach((task) => taskMap.set(task.id, task));
      const noteMap = new Map(state.notes.map((note) => [note.id, note]));
      snapshot.notes.forEach((note) => noteMap.set(note.id, note));
      return {
        tasks: [...taskMap.values()],
        notes: [...noteMap.values()],
        feedback: [...state.feedback, ...snapshot.feedback],
      };
    });
  },

  exportSnapshot: () => {
    const state = get();
    return createSnapshot(state.tasks, state.notes, state.feedback, state.preferences);
  },

  loadDemoData: () => {
    set({ tasks: buildDemoTasks(), notes: buildDemoNotes() });
  },

  resetAll: () => {
    set({ tasks: [], notes: [], feedback: [], preferences: { ...DEFAULT_PREFERENCES } });
  },
}));

export function startPersistence(): () => void {
  const initial = useAppStore.getState();
  writeValue(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION);
  writeValue(STORAGE_KEYS.tasks, initial.tasks);
  writeValue(STORAGE_KEYS.notes, initial.notes);
  writeValue(STORAGE_KEYS.feedback, initial.feedback);
  writeValue(STORAGE_KEYS.preferences, initial.preferences);

  return useAppStore.subscribe((state, previous) => {
    if (state.tasks !== previous.tasks) {
      writeValue(STORAGE_KEYS.tasks, state.tasks);
    }
    if (state.notes !== previous.notes) {
      writeValue(STORAGE_KEYS.notes, state.notes);
    }
    if (state.feedback !== previous.feedback) {
      writeValue(STORAGE_KEYS.feedback, state.feedback);
    }
    if (state.preferences !== previous.preferences) {
      writeValue(STORAGE_KEYS.preferences, state.preferences);
    }
  });
}
