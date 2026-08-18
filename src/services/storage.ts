import { MoodItem, MoodboardNode } from '../types';
import { INITIAL_ARCHIVE } from '../data/initialArchive';

const DB_NAME = 'MoodArchiveDB';
const DB_VERSION = 1;
const STORE_ITEMS = 'items';
const STORE_BOARDS = 'boards';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_ITEMS)) {
        db.createObjectStore(STORE_ITEMS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_BOARDS)) {
        db.createObjectStore(STORE_BOARDS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getAllMoodItems(): Promise<MoodItem[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_ITEMS, 'readonly');
    const store = tx.objectStore(STORE_ITEMS);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const items = request.result as MoodItem[];
        if (items.length === 0) {
          // Initialize with default dataset
          saveInitialArchive(INITIAL_ARCHIVE).then(() => resolve(INITIAL_ARCHIVE));
        } else {
          resolve(items);
        }
      };
      request.onerror = () => resolve(INITIAL_ARCHIVE);
    });
  } catch (err) {
    console.warn('IndexedDB failed, falling back to LocalStorage', err);
    const saved = localStorage.getItem('mood_archive_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_ARCHIVE;
      }
    }
    return INITIAL_ARCHIVE;
  }
}

export async function saveInitialArchive(items: MoodItem[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_ITEMS, 'readwrite');
    const store = tx.objectStore(STORE_ITEMS);
    for (const item of items) {
      store.put(item);
    }
  } catch (e) {
    localStorage.setItem('mood_archive_items', JSON.stringify(items));
  }
}

export async function saveMoodItem(item: MoodItem): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_ITEMS, 'readwrite');
    tx.objectStore(STORE_ITEMS).put(item);
  } catch (e) {
    const current = await getAllMoodItems();
    const updated = [item, ...current.filter((i) => i.id !== item.id)];
    localStorage.setItem('mood_archive_items', JSON.stringify(updated));
  }
}

export async function deleteMoodItem(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_ITEMS, 'readwrite');
    tx.objectStore(STORE_ITEMS).delete(id);
  } catch (e) {
    const current = await getAllMoodItems();
    const updated = current.filter((i) => i.id !== id);
    localStorage.setItem('mood_archive_items', JSON.stringify(updated));
  }
}

export async function toggleFavoriteItem(id: string): Promise<MoodItem[]> {
  const items = await getAllMoodItems();
  const updated = items.map((item) =>
    item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
  );
  const itemToUpdate = updated.find((i) => i.id === id);
  if (itemToUpdate) {
    await saveMoodItem(itemToUpdate);
  }
  return updated;
}

export async function saveMoodboardState(nodes: MoodboardNode[]): Promise<void> {
  localStorage.setItem('mood_board_active_nodes', JSON.stringify(nodes));
}

export async function getMoodboardState(): Promise<MoodboardNode[]> {
  const saved = localStorage.getItem('mood_board_active_nodes');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      return [];
    }
  }
  return [];
}
