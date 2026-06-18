import React, { useCallback, useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ItemCard } from '../components/ItemCard';
import { LargeButton } from '../components/LargeButton';
import { useItemStore } from '../store/itemStore';
import { colors, fonts, spacing } from '../theme';
import type { ItemRecord, RootStackParamList } from '../types';

type SearchResultsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'SearchResults'
>;

/**
 * Formats an ISO 8601 timestamp into a user-friendly "Last updated" string.
 */
function formatLastUpdated(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Updated today';
  if (diffDays === 1) return 'Updated yesterday';
  if (diffDays < 7) return `Updated ${diffDays} days ago`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Updated ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }
  // Fallback to a simple date string
  return `Updated ${date.toLocaleDateString()}`;
}

/**
 * Search Results Screen — displays items matching the search query.
 * Requirements addressed: 2.3, 2.4, 2.5, 3.3
 *
 * - Receives a `query` navigation param
 * - Calls searchItems(query) to find matching items
 * - Displays results in a FlatList with thumbnail, name, and "Last updated" timestamp
 * - Tapping an item navigates to ItemDetail
 * - Shows friendly "no results" message with button to navigate to Add Item (Camera)
 */
export const SearchResultsScreen: React.FC<SearchResultsScreenProps> = ({
  route,
  navigation,
}) => {
  const { query } = route.params;
  const searchItems = useItemStore((state) => state.searchItems);

  const results: ItemRecord[] = useMemo(
    () => searchItems(query),
    [searchItems, query],
  );

  const handleItemPress = useCallback(
    (itemId: string) => {
      navigation.navigate('ItemDetail', { itemId });
    },
    [navigation],
  );

  const handleAddItem = useCallback(() => {
    navigation.navigate('Camera', { mode: 'new' });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: ItemRecord }) => (
      <View>
        <ItemCard
          id={item.id}
          name={item.name}
          description={item.description}
          thumbnailUri={item.thumbnailUri}
          onPress={handleItemPress}
          testID={`search-result-${item.id}`}
        />
        <Text
          style={styles.timestamp}
          accessibilityLabel={`${item.name}, ${formatLastUpdated(item.updatedAt)}`}
        >
          {formatLastUpdated(item.updatedAt)}
        </Text>
      </View>
    ),
    [handleItemPress],
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer} testID="search-no-results">
      <Text style={styles.emptyText} accessibilityRole="text">
        Hmm, I don't have that one yet. Want to add it?
      </Text>
      <View style={styles.addButtonContainer}>
        <LargeButton
          title="Add Item"
          onPress={handleAddItem}
          variant="primary"
          accessibilityLabel="Add a new item"
          testID="search-add-item-button"
        />
      </View>
    </View>
  );

  return (
    <View style={styles.screen} testID="search-results-screen">
      <Text style={styles.headerText} accessibilityRole="header">
        Results for "{query}"
      </Text>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          results.length === 0 ? styles.emptyList : undefined
        }
        testID="search-results-list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerText: {
    fontSize: fonts.heading,
    fontWeight: '600',
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  timestamp: {
    fontSize: fonts.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    marginLeft: 64 + spacing.md, // Align with text after thumbnail
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: fonts.heading,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  addButtonContainer: {
    width: '100%',
    paddingHorizontal: spacing.lg,
  },
});

export default SearchResultsScreen;
