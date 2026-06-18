import React, { useCallback, useEffect } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LargeButton } from '../components/LargeButton';
import { useItemStore } from '../store/itemStore';
import { colors, fonts, spacing } from '../theme';
import type { RootStackParamList } from '../types';

type ItemDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ItemDetail'
>;

const { width: screenWidth } = Dimensions.get('window');
/** Photo must be at least 70% of screen width per Requirement 2.3 */
const PHOTO_SIZE = Math.round(screenWidth * 0.85);

/**
 * Formats the updatedAt timestamp into a human-readable string.
 */
function formatLastUpdated(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'Last updated just now';
  }
  if (diffMinutes < 60) {
    return `Last updated ${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }
  if (diffHours < 24) {
    return `Last updated ${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }
  if (diffDays < 7) {
    return `Last updated ${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }

  return `Last updated ${date.toLocaleDateString()}`;
}

/**
 * Item Detail Screen — displays full item information with action buttons.
 * Requirements addressed: 2.3, 5.1
 *
 * - Shows item photo at large size (minimum 70% screen width)
 * - Displays item name as heading, description below
 * - Shows human-readable "Last updated" timestamp
 * - "Update Location" button navigates to Camera in update mode
 * - "Delete Item" button shows confirmation dialog before deletion
 * - Handles case where item is not found by navigating back
 */
export const ItemDetailScreen: React.FC<ItemDetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { itemId } = route.params;

  const items = useItemStore((state) => state.items);
  const deleteItem = useItemStore((state) => state.deleteItem);

  const item = items.find((i) => i.id === itemId);

  // If item not found, navigate back
  useEffect(() => {
    if (!item) {
      navigation.goBack();
    }
  }, [item, navigation]);

  const handleUpdateLocation = useCallback(() => {
    navigation.navigate('Camera', { mode: 'update', itemId });
  }, [navigation, itemId]);

  const handleDeleteItem = useCallback(() => {
    if (!item) return;

    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete ${item.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteItem(item.id);
            navigation.goBack();
          },
        },
      ],
    );
  }, [item, deleteItem, navigation]);

  // While item is not found (before useEffect fires goBack), show nothing
  if (!item) {
    return null;
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      testID="item-detail-screen"
    >
      {/* Large item photo */}
      <Image
        source={{ uri: item.photoUri }}
        style={styles.photo}
        resizeMode="cover"
        accessibilityRole="image"
        accessibilityLabel={`Photo of ${item.name}${item.description ? ` at ${item.description}` : ''}`}
        testID="item-detail-photo"
      />

      {/* Item name */}
      <Text
        style={styles.name}
        accessibilityRole="header"
        testID="item-detail-name"
      >
        {item.name}
      </Text>

      {/* Location description */}
      {item.description ? (
        <Text style={styles.description} testID="item-detail-description">
          {item.description}
        </Text>
      ) : null}

      {/* Last updated timestamp */}
      <Text style={styles.timestamp} testID="item-detail-timestamp">
        {formatLastUpdated(item.updatedAt)}
      </Text>

      {/* Action buttons */}
      <View style={styles.actions}>
        <LargeButton
          title="Update Location"
          onPress={handleUpdateLocation}
          variant="primary"
          accessibilityLabel="Update Location"
          testID="update-location-button"
        />

        <LargeButton
          title="Delete Item"
          onPress={handleDeleteItem}
          variant="destructive"
          accessibilityLabel={`Delete ${item.name}`}
          testID="delete-item-button"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
    borderRadius: 8,
    marginBottom: spacing.xl,
  },
  name: {
    fontSize: fonts.title,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fonts.heading,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  timestamp: {
    fontSize: fonts.body,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
});

export default ItemDetailScreen;
