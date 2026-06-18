import { initDatabase, getDatabase } from '../database';

// Mock expo-sqlite with an in-memory implementation
const mockExecSync = jest.fn();
const mockDb = {
  execSync: mockExecSync,
};

jest.mock('expo-sqlite', () => ({
  openDatabaseSync: jest.fn(() => mockDb),
}));

describe('database service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDatabase', () => {
    it('throws if initDatabase has not been called', () => {
      // Reset module to clear the db reference
      jest.resetModules();
      const { getDatabase: freshGetDatabase } = require('../database');
      expect(() => freshGetDatabase()).toThrow(
        'Database not initialized. Call initDatabase() before accessing the database.'
      );
    });
  });

  describe('initDatabase', () => {
    it('opens the database and creates the items table', () => {
      initDatabase();

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS items')
      );
    });

    it('creates the items table with correct columns', () => {
      initDatabase();

      const createTableCall = mockExecSync.mock.calls.find((call: string[]) =>
        call[0].includes('CREATE TABLE IF NOT EXISTS items')
      );
      expect(createTableCall).toBeDefined();
      const sql = createTableCall![0];
      expect(sql).toContain('id TEXT PRIMARY KEY');
      expect(sql).toContain('name TEXT NOT NULL CHECK(length(name) BETWEEN 1 AND 50)');
      expect(sql).toContain('description TEXT CHECK(length(description) <= 150)');
      expect(sql).toContain('photo_uri TEXT NOT NULL');
      expect(sql).toContain('thumbnail_uri TEXT NOT NULL');
      expect(sql).toContain('created_at TEXT NOT NULL');
      expect(sql).toContain('updated_at TEXT NOT NULL');
    });

    it('creates index on name column', () => {
      initDatabase();

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_items_name ON items(name)')
      );
    });

    it('creates index on updated_at column', () => {
      initDatabase();

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE INDEX IF NOT EXISTS idx_items_updated ON items(updated_at)')
      );
    });

    it('creates the user_settings table', () => {
      initDatabase();

      expect(mockExecSync).toHaveBeenCalledWith(
        expect.stringContaining('CREATE TABLE IF NOT EXISTS user_settings')
      );
    });

    it('creates user_settings table with correct columns', () => {
      initDatabase();

      const createSettingsCall = mockExecSync.mock.calls.find((call: string[]) =>
        call[0].includes('CREATE TABLE IF NOT EXISTS user_settings')
      );
      expect(createSettingsCall).toBeDefined();
      const sql = createSettingsCall![0];
      expect(sql).toContain('key TEXT PRIMARY KEY');
      expect(sql).toContain('value TEXT NOT NULL');
    });

    it('returns a valid database instance after initialization', () => {
      initDatabase();

      const db = getDatabase();
      expect(db).toBe(mockDb);
    });
  });
});
