import { Injectable, computed, effect, inject, signal } from '@angular/core';
import type { Feedback } from '../models/models';
import { normalizeFeedback } from '../utils/backup.util';
import { createId } from '../utils/id.util';
import { STORAGE_KEYS, StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly storage = inject(StorageService);
  private readonly state = signal<Feedback[]>(this.load());

  readonly entries = this.state.asReadonly();
  readonly count = computed(() => this.state().length);

  constructor() {
    effect(() => {
      this.storage.write(STORAGE_KEYS.feedback, this.state());
    });
  }

  add(input: Omit<Feedback, 'id' | 'createdAt'>): Feedback {
    const entry: Feedback = { ...input, id: createId('fb'), createdAt: new Date().toISOString() };
    this.state.update((entries) => [entry, ...entries]);
    return entry;
  }

  remove(id: string): void {
    this.state.update((entries) => entries.filter((entry) => entry.id !== id));
  }

  replaceAll(entries: Feedback[]): void {
    this.state.set(entries);
  }

  clear(): void {
    this.state.set([]);
  }

  private load(): Feedback[] {
    const raw = this.storage.read<unknown[]>(STORAGE_KEYS.feedback, []);
    return Array.isArray(raw)
      ? raw.map(normalizeFeedback).filter((entry): entry is Feedback => entry !== null)
      : [];
  }
}
