import { Injectable } from '@angular/core';

export const STORAGE_KEYS = {
  tasks: 'tasknotes.tasks',
  notes: 'tasknotes.notes',
  preferences: 'tasknotes.preferences',
  feedback: 'tasknotes.feedback',
  schemaVersion: 'tasknotes.schemaVersion',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key: string) => map.get(key) ?? null,
    key: (index: number) => [...map.keys()][index] ?? null,
    removeItem: (key: string) => void map.delete(key),
    setItem: (key: string, value: string) => void map.set(key, value),
  } as Storage;
}

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly backend: Storage = StorageService.resolveBackend();

  private static resolveBackend(): Storage {
    try {
      const probe = '__tasknotes_probe__';
      globalThis.localStorage.setItem(probe, '1');
      globalThis.localStorage.removeItem(probe);
      return globalThis.localStorage;
    } catch {
      return createMemoryStorage();
    }
  }

  read<T>(key: StorageKey, fallback: T): T {
    try {
      const raw = this.backend.getItem(key);
      if (raw === null) {
        return fallback;
      }
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }

  write<T>(key: StorageKey, value: T): boolean {
    try {
      this.backend.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  remove(key: StorageKey): void {
    try {
      this.backend.removeItem(key);
    } catch {
      return;
    }
  }

  has(key: StorageKey): boolean {
    try {
      return this.backend.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  clearAll(): void {
    Object.values(STORAGE_KEYS).forEach((key) => this.remove(key));
  }

  usedBytes(): number {
    return Object.values(STORAGE_KEYS).reduce((sum, key) => {
      const raw = this.backend.getItem(key);
      return sum + (raw ? raw.length : 0);
    }, 0);
  }
}
