/**
 * Core type definitions for the Item Finder app.
 */

/**
 * Represents a stored item record with photo and location information.
 * Corresponds to a row in the SQLite `items` table.
 */
export interface ItemRecord {
  /** UUID, auto-generated */
  id: string;
  /** Item name (1-50 characters) */
  name: string;
  /** Optional location description (0-150 characters) */
  description?: string;
  /** Local file path to full-size photo */
  photoUri: string;
  /** Local file path to compressed thumbnail (200x200) */
  thumbnailUri: string;
  /** ISO 8601 timestamp of when the item was first stored */
  createdAt: string;
  /** ISO 8601 timestamp of when the item was last updated */
  updatedAt: string;
}

/**
 * User-configurable settings for the app.
 * fontSize maps to: default = 18sp, large = 24sp, extra-large = 30sp
 */
export interface UserSettings {
  fontSize: 'default' | 'large' | 'extra-large';
}

/**
 * Sort options for the browse list.
 */
export type SortOption = 'name' | 'updatedAt';

/**
 * Navigation parameter list for React Navigation stack.
 *
 * Navigation structure:
 * - Home Screen → Search Results → Item Detail
 * - Home Screen → Camera → Name Input → Confirmation
 * - Home Screen → Browse List → Item Detail
 * - Item Detail → Camera → Confirmation (Update Location)
 */
export type RootStackParamList = {
  Home: undefined;
  Camera: { mode: 'new' } | { mode: 'update'; itemId: string };
  NameInput: { photoUri: string };
  Confirmation: { itemId: string; action: 'created' | 'updated' };
  SearchResults: { query: string };
  ItemDetail: { itemId: string };
  BrowseList: undefined;
  Settings: undefined;
};
