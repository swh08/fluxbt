'use client';

const LEGACY_STORAGE_KEY = 'fluxbt-background';
const DB_NAME = 'fluxbt-preferences';
const STORE_NAME = 'assets';
const BACKGROUND_KEY = 'background-image';

function canUseBrowserStorage() {
  return typeof window !== 'undefined';
}

function canUseIndexedDb() {
  return canUseBrowserStorage() && 'indexedDB' in window;
}

function getLegacyBackgroundImage() {
  if (!canUseBrowserStorage()) {
    return null;
  }

  try {
    return localStorage.getItem(LEGACY_STORAGE_KEY);
  } catch {
    return null;
  }
}

function clearLegacyBackgroundImage() {
  if (!canUseBrowserStorage()) {
    return;
  }

  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures so the UI can keep running.
  }
}

function openBackgroundDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('BACKGROUND_DB_OPEN_FAILED'));
  });
}

function runStoreRequest<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openBackgroundDatabase().then((database) => new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('BACKGROUND_DB_REQUEST_FAILED'));
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error('BACKGROUND_DB_TRANSACTION_FAILED'));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error('BACKGROUND_DB_TRANSACTION_ABORTED'));
    };
  }));
}

async function readIndexedDbBackgroundImage() {
  if (!canUseIndexedDb()) {
    return null;
  }

  const result = await runStoreRequest<string | undefined>('readonly', (store) => store.get(BACKGROUND_KEY));
  return result ?? null;
}

async function writeIndexedDbBackgroundImage(image: string) {
  if (!canUseIndexedDb()) {
    throw new Error('INDEXED_DB_UNAVAILABLE');
  }

  await runStoreRequest<IDBValidKey>('readwrite', (store) => store.put(image, BACKGROUND_KEY));
}

async function deleteIndexedDbBackgroundImage() {
  if (!canUseIndexedDb()) {
    return;
  }

  await runStoreRequest<undefined>('readwrite', (store) => store.delete(BACKGROUND_KEY));
}

export async function loadPersistedBackgroundImage() {
  const legacyImage = getLegacyBackgroundImage();

  if (!canUseIndexedDb()) {
    return legacyImage;
  }

  const indexedDbImage = await readIndexedDbBackgroundImage();

  if (indexedDbImage) {
    if (legacyImage) {
      clearLegacyBackgroundImage();
    }

    return indexedDbImage;
  }

  if (legacyImage) {
    await writeIndexedDbBackgroundImage(legacyImage);
    clearLegacyBackgroundImage();
    return legacyImage;
  }

  return null;
}

export async function persistBackgroundImage(image: string | null) {
  if (!image) {
    await deleteIndexedDbBackgroundImage();
    clearLegacyBackgroundImage();
    return;
  }

  if (canUseIndexedDb()) {
    await writeIndexedDbBackgroundImage(image);
    clearLegacyBackgroundImage();
    return;
  }

  if (!canUseBrowserStorage()) {
    return;
  }

  localStorage.setItem(LEGACY_STORAGE_KEY, image);
}
