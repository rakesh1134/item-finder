import { create } from 'zustand';
import { generateId } from '../utils/generateId';
import type { ItemRecord, UserSettings, SortOption } from '../types';
import * as database from '../services/database';
import * as photoStorage from '../services/photoStorage';
import { search } from '../services/searchEngine';

/**
 * State shape for the item store.
 */
interface ItemStoreState {
  items: ItemRecord[];
  settings: UserSettings;
  isLoading: boolean;
}

/**
 * Actions available on the item store.
 */
interface ItemStoreActions {
  /** Fetches all items from the database and updates state. */
  loadItems: (sortBy?: SortOption) => Promise<void>;

  /** Saves a photo, creates an item in the database, and adds it to state. */
  addItem: (params: {
    name: string;
    description?: string;
    photoUri: string;
  }) => Promise<ItemRecord>;

  /** Updates an item in the database and refreshes state. */
  updateItem: (id: string, updates: Partial<ItemRecord>) => Promise<void>;

  /** Deletes an item from the database, removes photos, and removes from state. */
  deleteItem: (id: string) => Promise<void>;

  /** Delegates to the search engine with the current items list. */
  searchItems: (query: string) => ItemRecord[];

  /** Updates user settings in state. */
  updateSettings: (settings: Partial<UserSettings>) => void;
}

type ItemStore = ItemStoreState & ItemStoreActions;

/**
 * Default user settings.
 */
const DEFAULT_SETTINGS: UserSettings = {
  fontSize: 'default',
};

/**
 * Zustand store for managing items and user settings.
 * Integrates with the database service for persistence and the search engine for queries.
 */
export const useItemStore = create<ItemStore>((set, get) => ({
  // State
  items: [],
  settings: DEFAULT_SETTINGS,
  isLoading: false,

  // Actions
  loadItems: async (sortBy: SortOption = 'name') => {
    set({ isLoading: true });
    try {
      const items = await database.getAllItems(sortBy);
      set({ items, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  addItem: async ({ name, description, photoUri }) => {
    set({ isLoading: true });
    try {
      console.log('[addItem] Starting save for:', name, 'photo:', photoUri);
      // Save photo to local storage (resize + thumbnail)
      const { photoUri: savedPhotoUri, thumbnailUri } =
        await photoStorage.savePhoto(photoUri);
      console.log('[addItem] Photo saved:', savedPhotoUri);

      const now = new Date().toISOString();
      const item: ItemRecord = {
        id: generateId(),
        name,
        description,
        photoUri: savedPhotoUri,
        thumbnailUri,
        createdAt: now,
        updatedAt: now,
      };

      // Persist to database
      console.log('[addItem] Persisting to database...');
      await database.createItem(item);
      console.log('[addItem] Saved to database');

      // Update state
      set((state) => ({
        items: [...state.items, item],
        isLoading: false,
      }));

      return item;
    } catch (error) {
      console.error('[addItem] Error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateItem: async (id, updates) => {
    set({ isLoading: true });
    try {
      // Persist update to database (automatically updates timestamp)
      await database.updateItem(id, updates);

      // Refresh item from database to get the updated timestamp
      const updatedItem = await database.getItemById(id);

      set((state) => ({
        items: state.items.map((item) =>
          item.id === id && updatedItem ? updatedItem : item
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  deleteItem: async (id) => {
    set({ isLoading: true });
    try {
      // Find the item to get photo URIs before deletion
      const item = get().items.find((i) => i.id === id);

      if (item) {
        // Delete photo files from device
        await photoStorage.deletePhoto(item.photoUri, item.thumbnailUri);
      }

      // Remove from database
      await database.deleteItem(id);

      // Remove from state
      set((state) => ({
        items: state.items.filter((i) => i.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  searchItems: (query) => {
    const { items } = get();
    return search(query, items);
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: { ...state.settings, ...newSettings },
    }));
  },
}));
