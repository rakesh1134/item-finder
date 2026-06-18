import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import type { ItemRecord } from '../types';
import { useItemStore } from '../store/itemStore';
import { LargeButton } from '../components/LargeButton';
import { ItemCard } from '../components/ItemCard';
import { colors, fonts, spacing, touchTargets, borderRadius } from '../theme';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

/**
 * Home Screen — the main entry point for the Item Finder app.
 *
 * Provides:
 * - Search field with autocomplete (after 2+ characters)
 * - "Add Item" button to navigate to camera
 * - "My Items" button to browse all items
 *
 * Requirements: 1.1, 2.1, 2.2, 4.1, 6.3, 6.5
 */
export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const searchItems = useItemStore((state) => state.searchItems);

  const [query, setQuery] = useState('');

  // Compute autocomplete results when query is 2+ characters
  const autocompleteResults: ItemRecord[] = useMemo(() => {
    if (query.trim().length < 2) {
      return [];
    }
    return searchItems(query.trim());
  }, [query, searchItems]);

  const showAutocomplete = query.trim().length >= 2 && autocompleteResults.length > 0;

  const handleSearchChange = (text: string) => {
    setQuery(text);
  };

  const handleItemSelect = (itemId: string) => {
    setQuery('');
    navigation.navigate('ItemDetail', { itemId });
  };

  const handleAddItem = () => {
    navigation.navigate('Camera', { mode: 'new' });
  };

  const handleMyItems = () => {
    navigation.navigate('BrowseList');
  };

  return (
    <View style={styles.container}>
      {/* Search Field */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchLabel} accessibilityRole="header">
          Search
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="What are you looking for?"
          placeholderTextColor={colors.placeholder}
          value={query}
          onChangeText={handleSearchChange}
          accessibilityLabel="Search for an item"
          accessibilityRole="search"
          autoCorrect={false}
          returnKeyType="search"
          testID="home-search-input"
        />
      </View>

      {/* Autocomplete Dropdown */}
      {showAutocomplete && (
        <View style={styles.autocompleteContainer} testID="autocomplete-dropdown">
          <FlatList
            data={autocompleteResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ItemCard
                id={item.id}
                name={item.name}
                description={item.description}
                thumbnailUri={item.thumbnailUri}
                onPress={handleItemSelect}
                testID={`autocomplete-item-${item.id}`}
              />
            )}
            keyboardShouldPersistTaps="handled"
            style={styles.autocompleteList}
          />
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <LargeButton
          title="Add Item"
          onPress={handleAddItem}
          icon={<Text style={styles.buttonIcon}>📷</Text>}
          variant="primary"
          accessibilityLabel="Add Item"
          testID="home-add-item-button"
        />

        <LargeButton
          title="My Items"
          onPress={handleMyItems}
          icon={<Text style={styles.buttonIcon}>📋</Text>}
          variant="secondary"
          accessibilityLabel="My Items"
          testID="home-my-items-button"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  searchContainer: {
    marginBottom: spacing.xl,
  },
  searchLabel: {
    fontSize: fonts.heading,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  searchInput: {
    minHeight: touchTargets.minSize,
    fontSize: fonts.body,
    color: colors.textPrimary,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  autocompleteContainer: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    marginBottom: spacing.lg,
  },
  autocompleteList: {
    maxHeight: 300,
  },
  buttonsContainer: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  buttonIcon: {
    fontSize: fonts.heading,
  },
});

export default HomeScreen;
