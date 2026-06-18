import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ItemCard } from '../components/ItemCard';
import { useItemStore } from '../store/itemStore';
import { colors, fonts, spacing, touchTargets, borderRadius } from '../theme';
import type { RootStackParamList, SortOption } from '../types';

type BrowseListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'BrowseList'
>;

/**
 * Browse List Screen — displays all stored items in a scrollable list.
 * Requirements addressed: 4.1, 4.2, 4.3, 4.4, 4.5
 *
 * - Shows all items in a FlatList with thumbnail, name, and description
 * - Default sort: alphabetical by name (A-Z)
 * - Toggle between "A-Z" and "Recent" sort options
 * - Tapping an item navigates to ItemDetail screen
 * - Empty state message when no items exist
 */
export const BrowseListScreen: React.FC<BrowseListScreenProps> = ({
  navigation,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('name');

  const items = useItemStore((state) => state.items);
  const isLoading = useItemStore((state) => state.isLoading);
  const loadItems = useItemStore((state) => state.loadItems);

  useEffect(() => {
    loadItems(sortBy);
  }, [sortBy, loadItems]);

  const handleItemPress = useCallback(
    (itemId: string) => {
      navigation.navigate('ItemDetail', { itemId });
    },
    [navigation],
  );

  const handleSortChange = useCallback((option: SortOption) => {
    setSortBy(option);
  }, []);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer} testID="browse-empty-state">
      <Text style={styles.emptyText}>
        No items yet! Tap Add Item to get started.
      </Text>
    </View>
  );

  return (
    <View style={styles.screen} testID="browse-list-screen">
      {/* Sort toggle */}
      <View style={styles.sortContainer} testID="sort-toggle">
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'name' && styles.sortButtonActive,
          ]}
          onPress={() => handleSortChange('name')}
          accessibilityRole="button"
          accessibilityLabel="Sort alphabetically"
          accessibilityState={{ selected: sortBy === 'name' }}
          testID="sort-button-az"
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'name' && styles.sortButtonTextActive,
            ]}
          >
            A-Z
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.sortButton,
            sortBy === 'updatedAt' && styles.sortButtonActive,
          ]}
          onPress={() => handleSortChange('updatedAt')}
          accessibilityRole="button"
          accessibilityLabel="Sort by most recent"
          accessibilityState={{ selected: sortBy === 'updatedAt' }}
          testID="sort-button-recent"
        >
          <Text
            style={[
              styles.sortButtonText,
              sortBy === 'updatedAt' && styles.sortButtonTextActive,
            ]}
          >
            Recent
          </Text>
        </TouchableOpacity>
      </View>

      {/* Item list */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ItemCard
            id={item.id}
            name={item.name}
            description={item.description}
            thumbnailUri={item.thumbnailUri}
            onPress={handleItemPress}
            testID={`item-card-${item.id}`}
          />
        )}
        ListEmptyComponent={isLoading ? null : renderEmptyState}
        contentContainerStyle={items.length === 0 ? styles.emptyList : undefined}
        testID="browse-flat-list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sortButton: {
    minHeight: touchTargets.minSize,
    minWidth: touchTargets.minSize,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  sortButtonText: {
    fontSize: fonts.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sortButtonTextActive: {
    color: colors.textOnPrimary,
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
  },
});

export default BrowseListScreen;
