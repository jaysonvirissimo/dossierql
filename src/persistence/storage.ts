/** The one doorway to browser storage (SDD 7.4). */
export interface StorageAdapter {
  /** False when the game cannot remember anything between visits. */
  readonly durable: boolean;
  read(key: string): string | null;
  write(key: string, value: string): boolean;
  remove(key: string): void;
}

export function memoryStorage(): StorageAdapter {
  const values = new Map<string, string>();
  return {
    durable: false,
    read: (key) => values.get(key) ?? null,
    write: (key, value) => {
      values.set(key, value);
      return true;
    },
    remove: (key) => void values.delete(key),
  };
}

/**
 * Browser storage, or memory if the browser refuses. The game stays
 * playable either way and simply does not remember.
 */
export function browserStorage(): StorageAdapter {
  let store: Storage;
  try {
    store = window.localStorage;
    const probe = "dossierql:probe";
    store.setItem(probe, "1");
    store.removeItem(probe);
  } catch {
    return memoryStorage();
  }
  return {
    durable: true,
    read(key) {
      try {
        return store.getItem(key);
      } catch {
        return null;
      }
    },
    write(key, value) {
      try {
        store.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        store.removeItem(key);
      } catch {
        // Nothing to remove from storage that cannot be reached.
      }
    },
  };
}
