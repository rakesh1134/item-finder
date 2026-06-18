import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useItemStore } from '../store/itemStore';
import { LargeButton } from '../components/LargeButton';
import { colors, fonts, spacing } from '../theme';
import type { RootStackParamList } from '../types';

type ConfirmationScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Confirmation'
>;

/**
 * Confirmation Screen — displays an encouraging success message after
 * an item is created or its location is updated.
 *
 * Messages:
 * - 'created': "Got it! Your [item name] is saved."
 * - 'updated': "Updated! Your [item name] is now saved in its new spot."
 *
 * Requirements: 1.6, 5.5
 */
export const ConfirmationScreen: React.FC<ConfirmationScreenProps> = ({
  route,
  navigation,
}) => {
  const { itemId, action } = route.params;
  const items = useItemStore((state) => state.items);
  const item = items.find((i) => i.id === itemId);

  const itemName = item?.name ?? 'item';

  const message =
    action === 'updated'
      ? `Updated! Your ${itemName} is now saved in its new spot.`
      : `Got it! Your ${itemName} is saved.`;

  const handleDone = () => {
    // Navigate back to Home, resetting the stack so the user
    // doesn't go back through Camera/NameInput screens
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleViewItem = () => {
    navigation.navigate('ItemDetail', { itemId });
  };

  return (
    <View style={styles.container} testID="confirmation-screen">
      {/* Success icon (checkmark circle using unicode) */}
      <Text style={styles.icon} accessibilityElementsHidden>
        ✓
      </Text>

      {/* Confirmation message */}
      <Text
        style={styles.message}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        testID="confirmation-message"
      >
        {message}
      </Text>

      {/* Action buttons */}
      <View style={styles.actions}>
        <LargeButton
          title="View Item"
          onPress={handleViewItem}
          variant="primary"
          testID="confirmation-view-item-button"
          accessibilityLabel={`View ${itemName}`}
        />
        <LargeButton
          title="Back to Home"
          onPress={handleDone}
          variant="secondary"
          testID="confirmation-done-button"
          accessibilityLabel="Go back to home screen"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  icon: {
    fontSize: 64,
    color: colors.success,
    marginBottom: spacing.xl,
  },
  message: {
    fontSize: fonts.heading,
    fontWeight: '700',
    color: colors.success,
    textAlign: 'center',
    lineHeight: 34,
    marginBottom: spacing.xxl,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
});

export default ConfirmationScreen;
