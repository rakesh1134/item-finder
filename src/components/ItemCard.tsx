import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  StyleSheet,
} from 'react-native';
import { colors, fonts, spacing, touchTargets, borderRadius } from '../theme';

export interface ItemCardProps {
  /** Item ID */
  id: string;
  /** Item name displayed in large text */
  name: string;
  /** Optional location description (truncated if too long) */
  description?: string;
  /** URI for the thumbnail image (200x200) */
  thumbnailUri: string;
  /** Called when the card is tapped */
  onPress: (id: string) => void;
  /** Test ID for testing */
  testID?: string;
}

/** Maximum characters for description preview before truncation */
const DESCRIPTION_MAX_LENGTH = 60;

/**
 * Item card component for list views.
 * - 200x200 thumbnail image
 * - Item name in large text
 * - Truncated description preview
 * - Tappable for navigation to item detail
 * - Minimum 48dp touch target height
 * - Accessible with item name and description
 */
export const ItemCard: React.FC<ItemCardProps> = ({
  id,
  name,
  description,
  thumbnailUri,
  onPress,
  testID,
}) => {
  const truncatedDescription =
    description && description.length > DESCRIPTION_MAX_LENGTH
      ? `${description.slice(0, DESCRIPTION_MAX_LENGTH)}…`
      : description;

  const accessibilityDescription = description
    ? `${name}, ${description}`
    : name;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(id)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityDescription}
      activeOpacity={0.7}
      testID={testID}
    >
      <Image
        source={{ uri: thumbnailUri }}
        style={styles.thumbnail}
        accessibilityRole="image"
        accessibilityLabel={`Photo of ${name}`}
      />
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        {truncatedDescription && (
          <Text style={styles.description} numberOfLines={2}>
            {truncatedDescription}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    minHeight: touchTargets.minSize,
  },
  name: {
    fontSize: fonts.heading,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  description: {
    fontSize: fonts.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default ItemCard;
