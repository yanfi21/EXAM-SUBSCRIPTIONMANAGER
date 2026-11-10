import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import {
  DEFAULT_FILTERS,
  DEFAULT_PREFERENCES,
  type Preferences,
  type TaskFilters,
  type ThemeMode,
  type ViewMode,
} from '../models/models';
import { normalizePreferences } from '../utils/backup.util';
import { STORAGE_KEYS, StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  private readonly storage = inject(StorageService);
  private readonly document = inject(DOCUMENT);

  private readonly state = signal<Preferences>(this.load());

  readonly preferences = this.state.asReadonly();
  readonly theme = computed(() => this.state().theme);
  readonly view = computed(() => this.state().view);
  readonly filters = computed(() => this.state().filters);
  readonly filtersDirty = computed(() => {
    const filters = this.state().filters;
    return (
      filters.search !== '' ||
      filters.status !== 'all' ||
      filters.priority !== 'all' ||
      filters.tags.length > 0 ||
      filters.onlyOverdue
    );
  });

  constructor() {
    effect(() => {
      const preferences = this.state();
      this.storage.write(STORAGE_KEYS.preferences, preferences);
      this.document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
    });
  }

  setTheme(theme: ThemeMode): void {
    this.state.update((current) => ({ ...current, theme }));
  }

  toggleTheme(): void {
    this.setTheme(this.state().theme === 'dark' ? 'light' : 'dark');
  }

  setView(view: ViewMode): void {
    if (this.state().view !== view) {
      this.state.update((current) => ({ ...current, view }));
    }
  }

  patchFilters(patch: Partial<TaskFilters>): void {
    this.state.update((current) => ({
      ...current,
      filters: { ...current.filters, ...patch },
    }));
  }

  toggleTag(tag: string): void {
    this.state.update((current) => {
      const tags = current.filters.tags.includes(tag)
        ? current.filters.tags.filter((item) => item !== tag)
        : [...current.filters.tags, tag];
      return { ...current, filters: { ...current.filters, tags } };
    });
  }

  resetFilters(): void {
    this.state.update((current) => ({ ...current, filters: { ...DEFAULT_FILTERS } }));
  }

  replace(preferences: Preferences): void {
    this.state.set(normalizePreferences(preferences));
  }

  reset(): void {
    this.state.set({ ...DEFAULT_PREFERENCES, filters: { ...DEFAULT_FILTERS } });
  }

  private load(): Preferences {
    if (this.storage.has(STORAGE_KEYS.preferences)) {
      return normalizePreferences(this.storage.read<unknown>(STORAGE_KEYS.preferences, null));
    }
    const prefersDark =
      typeof globalThis.matchMedia === 'function' &&
      globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      ...DEFAULT_PREFERENCES,
      theme: prefersDark ? 'dark' : 'light',
      filters: { ...DEFAULT_FILTERS },
    };
  }
}
