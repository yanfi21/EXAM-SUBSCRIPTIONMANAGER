import { Injectable, computed, effect, inject, signal } from '@angular/core';
import type { Note, NoteDraft } from '../models/models';
import { normalizeNote } from '../utils/backup.util';
import { buildDemoNotes } from '../utils/demo.util';
import { createId } from '../utils/id.util';
import { STORAGE_KEYS, StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private readonly storage = inject(StorageService);

  private readonly state = signal<Note[]>(this.load());
  private readonly query = signal('');

  readonly notes = this.state.asReadonly();
  readonly search = this.query.asReadonly();
  readonly activeNotes = computed(() =>
    this.state()
      .filter((note) => !note.deletedAt)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
  );
  readonly deletedNotes = computed(() =>
    this.state()
      .filter((note) => note.deletedAt)
      .sort((a, b) => (b.deletedAt ?? '').localeCompare(a.deletedAt ?? '')),
  );
  readonly visibleNotes = computed(() => {
    const term = this.query().trim().toLowerCase();
    if (!term) {
      return this.activeNotes();
    }
    return this.activeNotes().filter((note) =>
      `${note.title} ${note.content}`.toLowerCase().includes(term),
    );
  });

  constructor() {
    effect(() => {
      this.storage.write(STORAGE_KEYS.notes, this.state());
    });
  }

  setSearch(value: string): void {
    this.query.set(value);
  }

  create(draft: NoteDraft): Note {
    const now = new Date().toISOString();
    const note: Note = {
      id: createId('note'),
      title: draft.title.trim() || 'Без названия',
      content: draft.content,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
    this.state.update((notes) => [note, ...notes]);
    return note;
  }

  update(id: string, patch: Partial<NoteDraft>): void {
    const now = new Date().toISOString();
    this.state.update((notes) =>
      notes.map((note) => (note.id === id ? { ...note, ...patch, updatedAt: now } : note)),
    );
  }

  softDelete(id: string): void {
    const now = new Date().toISOString();
    this.state.update((notes) =>
      notes.map((note) => (note.id === id ? { ...note, deletedAt: now, updatedAt: now } : note)),
    );
  }

  restore(id: string): void {
    const now = new Date().toISOString();
    this.state.update((notes) =>
      notes.map((note) => (note.id === id ? { ...note, deletedAt: null, updatedAt: now } : note)),
    );
  }

  purge(id: string): void {
    this.state.update((notes) => notes.filter((note) => note.id !== id));
  }

  purgeDeleted(): void {
    this.state.update((notes) => notes.filter((note) => !note.deletedAt));
  }

  replaceAll(notes: Note[]): void {
    this.state.set(notes);
  }

  mergeAll(notes: Note[]): void {
    this.state.update((current) => {
      const map = new Map(current.map((note) => [note.id, note]));
      notes.forEach((note) => map.set(note.id, note));
      return [...map.values()];
    });
  }

  loadDemo(): void {
    this.state.set(buildDemoNotes());
  }

  clear(): void {
    this.state.set([]);
  }

  private load(): Note[] {
    if (!this.storage.has(STORAGE_KEYS.notes)) {
      return buildDemoNotes();
    }
    const raw = this.storage.read<unknown[]>(STORAGE_KEYS.notes, []);
    return Array.isArray(raw)
      ? raw.map(normalizeNote).filter((note): note is Note => note !== null)
      : [];
  }
}
