import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';
import type { ItemRecord } from '../types';

const DATABASE_NAME = 'item_finder.db';

let db: SQLiteDatabase | null = null;

/**
 * Returns the SQLite database instance.
 * Must call initDatabase() before using this.
 */
export function getDatabase(): SQLiteDatabase {
  if (!db) {
    throw new Error(
      'Database not initialized. Call initDatabase() before accessing the database.'
    );
  }
  return db;
}

/**
 * Initializes the SQLite database, creating tables and indexes if they don't exist.
 * Safe to call multiple times — uses IF NOT EXISTS clauses.
 */
export function initDatabase(): void {
  db = openDatabaseSync(DATABASE_NAME);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 50),
      description TEXT CHECK(length(description) <= 150),
      photo_uri TEXT NOT NULL,
      thumbnail_uri TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
  `);

  db.execSync(`
    CREATE INDEX IF NOT EXISTS idx_items_updated ON items(updated_at);
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

/**
 * Row shape returned by SQLite queries on the items table.
 * Uses snake_case column names matching the database schema.
 */
interface ItemRow {
  id: string;
  name: string;
  description: string | null;
  photo_uri: string;
  thumbnail_uri: string;
  created_at: string;
  updated_at: string;
}

/**
 * Maps a database row (snake_case) to an ItemRecord (camelCase).
 */
function rowToItemRecord(row: ItemRow): ItemRecord {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    photoUri: row.photo_uri,
    thumbnailUri: row.thumbnail_uri,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Inserts a new item record into the database.
 */
export async function createItem(item: ItemRecord): Promise<void> {
  const database = getDatabase();
  database.runSync(
    `INSERT INTO items (id, name, description, photo_uri, thumbnail_uri, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.name,
      item.description ?? null,
      item.photoUri,
      item.thumbnailUri,
      item.createdAt,
      item.updatedAt,
    ]
  );
}

/**
 * Retrieves a single item by its ID.
 * Returns null if no item is found.
 */
export async function getItemById(id: string): Promise<ItemRecord | null> {
  const database = getDatabase();
  const row = database.getFirstSync<ItemRow>(
    'SELECT * FROM items WHERE id = ?',
    [id]
  );
  if (!row) {
    return null;
  }
  return rowToItemRecord(row);
}

/**
 * Retrieves all items from the database with the specified sort order.
 * - 'name': sorts alphabetically by name (case-insensitive)
 * - 'updatedAt': sorts by most recently updated first (descending)
 */
export async function getAllItems(sortBy: 'name' | 'updatedAt'): Promise<ItemRecord[]> {
  const database = getDatabase();
  const orderClause =
    sortBy === 'name'
      ? 'ORDER BY name COLLATE NOCASE ASC'
      : 'ORDER BY updated_at DESC';

  const rows = database.getAllSync<ItemRow>(
    `SELECT * FROM items ${orderClause}`
  );
  return rows.map(rowToItemRecord);
}

/**
 * Updates an item's fields in the database.
 * Automatically sets updatedAt to the current ISO timestamp.
 */
export async function updateItem(id: string, updates: Partial<ItemRecord>): Promise<void> {
  const database = getDatabase();
  const now = new Date().toISOString();

  // Build dynamic SET clause from provided updates
  const setClauses: string[] = [];
  const values: (string | null)[] = [];

  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    values.push(updates.name);
  }
  if (updates.description !== undefined) {
    setClauses.push('description = ?');
    values.push(updates.description ?? null);
  }
  if (updates.photoUri !== undefined) {
    setClauses.push('photo_uri = ?');
    values.push(updates.photoUri);
  }
  if (updates.thumbnailUri !== undefined) {
    setClauses.push('thumbnail_uri = ?');
    values.push(updates.thumbnailUri);
  }

  // Always update the updated_at timestamp
  setClauses.push('updated_at = ?');
  values.push(now);

  // Add the id for the WHERE clause
  values.push(id);

  database.runSync(
    `UPDATE items SET ${setClauses.join(', ')} WHERE id = ?`,
    values
  );
}

/**
 * Removes an item from the database by its ID.
 */
export async function deleteItem(id: string): Promise<void> {
  const database = getDatabase();
  database.runSync('DELETE FROM items WHERE id = ?', [id]);
}
