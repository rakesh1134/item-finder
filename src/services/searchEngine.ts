import Fuse from 'fuse.js';
import type { ItemRecord } from '../types';

/**
 * Fuse.js configuration for fuzzy matching.
 * - threshold 0.4 allows approximately 2 character edit distance
 * - keys: searches both name and description fields
 * - includeScore: enables ranking by match quality
 */
const fuseOptions: Fuse.IFuseOptions<ItemRecord> = {
  keys: ['name', 'description'],
  threshold: 0.4,
  includeScore: true,
};

/**
 * Normalizes a search query by trimming whitespace and converting to lowercase.
 */
function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

/**
 * Searches items using fuzzy string matching.
 * - Returns empty array for queries with fewer than 2 characters.
 * - Ranks exact substring matches above fuzzy matches.
 *
 * @param query - The user's search query
 * @param items - The full list of items to search through
 * @returns Matching items ranked by relevance (exact > substring > fuzzy)
 */
export function search(query: string, items: ItemRecord[]): ItemRecord[] {
  const normalized = normalizeQuery(query);

  if (normalized.length < 2) {
    return [];
  }

  // Separate exact substring matches (highest priority)
  const substringMatches = items.filter(
    (item) =>
      item.name.toLowerCase().includes(normalized) ||
      (item.description && item.description.toLowerCase().includes(normalized))
  );

  // Use Fuse.js for fuzzy matching
  const fuse = new Fuse(items, fuseOptions);
  const fuseResults = fuse.search(normalized);

  // Collect fuzzy matches that aren't already in substring matches
  const substringIds = new Set(substringMatches.map((item) => item.id));
  const fuzzyOnly = fuseResults
    .map((result) => result.item)
    .filter((item) => !substringIds.has(item.id));

  // Return exact/substring matches first, then fuzzy matches
  return [...substringMatches, ...fuzzyOnly];
}
