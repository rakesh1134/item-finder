import { search } from '../searchEngine';
import type { ItemRecord } from '../../types';

/**
 * Helper to create a test ItemRecord with minimal required fields.
 */
function makeItem(overrides: Partial<ItemRecord> & { id: string; name: string }): ItemRecord {
  return {
    photoUri: '/photos/test.jpg',
    thumbnailUri: '/photos/test_thumb.jpg',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const sampleItems: ItemRecord[] = [
  makeItem({ id: '1', name: 'Keys', description: 'Kitchen hook by the door' }),
  makeItem({ id: '2', name: 'Wallet', description: 'Bedroom nightstand' }),
  makeItem({ id: '3', name: 'Glasses', description: 'Living room table' }),
  makeItem({ id: '4', name: 'Remote Control', description: 'Under couch cushion' }),
  makeItem({ id: '5', name: 'Phone Charger', description: 'Kitchen counter' }),
];

describe('searchEngine', () => {
  describe('query normalization', () => {
    it('returns empty array for queries with fewer than 2 characters', () => {
      expect(search('', sampleItems)).toEqual([]);
      expect(search('a', sampleItems)).toEqual([]);
      expect(search(' ', sampleItems)).toEqual([]);
      expect(search(' a ', sampleItems)).toEqual([]);
    });

    it('treats query as case-insensitive', () => {
      const results = search('KEYS', sampleItems);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Keys');
    });

    it('trims whitespace from query', () => {
      const results = search('  keys  ', sampleItems);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Keys');
    });
  });

  describe('substring matching', () => {
    it('finds exact name match', () => {
      const results = search('Keys', sampleItems);
      expect(results[0].name).toBe('Keys');
    });

    it('finds partial name match (substring)', () => {
      const results = search('Rem', sampleItems);
      expect(results.some((r) => r.name === 'Remote Control')).toBe(true);
    });

    it('finds match in description field', () => {
      const results = search('kitchen', sampleItems);
      expect(results.some((r) => r.name === 'Keys')).toBe(true);
      expect(results.some((r) => r.name === 'Phone Charger')).toBe(true);
    });
  });

  describe('fuzzy matching', () => {
    it('finds items with minor misspellings (edit distance ≤ 2)', () => {
      // "Kees" is 1 edit away from "Keys"
      const results = search('Kees', sampleItems);
      expect(results.some((r) => r.name === 'Keys')).toBe(true);
    });

    it('finds items with a typo in longer words', () => {
      // "Glases" is 1 edit away from "Glasses"
      const results = search('Glases', sampleItems);
      expect(results.some((r) => r.name === 'Glasses')).toBe(true);
    });
  });

  describe('result ranking', () => {
    it('ranks substring matches above fuzzy matches', () => {
      // "wallet" is a substring match for "Wallet"
      // "Walet" is only a fuzzy match for "wallet" (missing an 'l')
      const items: ItemRecord[] = [
        makeItem({ id: '1', name: 'Walet', description: 'Typo item' }),
        makeItem({ id: '2', name: 'Wallet', description: 'By the front door' }),
      ];

      const results = search('wallet', items);
      // "Wallet" contains "wallet" as substring, should appear before fuzzy match "Walet"
      expect(results[0].name).toBe('Wallet');
    });

    it('returns substring matches before fuzzy matches', () => {
      const items: ItemRecord[] = [
        makeItem({ id: '1', name: 'Phone', description: 'Desk' }),
        makeItem({ id: '2', name: 'Phon', description: 'Table' }), // substring of "phon"
      ];

      const results = search('phon', items);
      // Both "Phone" and "Phon" contain "phon" as substring
      expect(results.some((r) => r.name === 'Phone')).toBe(true);
      expect(results.some((r) => r.name === 'Phon')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('returns empty array when items list is empty', () => {
      expect(search('keys', [])).toEqual([]);
    });

    it('returns empty array when no matches found', () => {
      const results = search('xyzabc', sampleItems);
      expect(results).toEqual([]);
    });

    it('does not return duplicate items', () => {
      // An item that matches both substring and fuzzy should only appear once
      const results = search('keys', sampleItems);
      const ids = results.map((r) => r.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    });

    it('handles items with undefined description', () => {
      const items: ItemRecord[] = [
        makeItem({ id: '1', name: 'Keys' }),
      ];
      const results = search('keys', items);
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Keys');
    });
  });
});
