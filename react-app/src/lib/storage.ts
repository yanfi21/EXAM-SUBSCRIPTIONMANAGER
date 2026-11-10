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

function resolveStorage(): Storage {
  try {
    const probe = '__tasknotes_probe__';
    globalThis.localStorage.setItem(probe, '1');
    globalThis.localStorage.removeItem(probe);
    return globalThis.localStorage;
  } catch {
    return createMemoryStorage();
  }
}

let storage: Storage | null = null;

function backend(): Storage {
  if (!storage) {
    storage = resolveStorage();
  }
  return storage;
}

export function readValue<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = backend().getItem(key);
    if (raw === null) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeValue<T>(key: StorageKey, value: T): boolean {
  try {
    backend().setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeValue(key: StorageKey): void {
  try {
    backend().removeItem(key);
  } catch {
    return;
  }
}

export function clearAll(): void {
  Object.values(STORAGE_KEYS).forEach((key) => removeValue(key));
}

export function resetStorageForTests(): void {
  storage = null;
}
