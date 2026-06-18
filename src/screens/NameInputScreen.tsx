import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { useItemStore } from '../store/itemStore';
import { LargeButton } from '../components/LargeButton';
import { LargeTextInput } from '../components/LargeTextInput';
import { colors, fonts, spacing } from '../theme';

type NameInputRouteProp = RouteProp<RootStackParamList, 'NameInput'>;
type NameInputNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NameInput'>;

const NAME_MAX_LENGTH = 50;
const DESCRIPTION_MAX_LENGTH = 150;

/**
 * Name Input Screen for naming and confirming a new item.
 *
 * Flow (1 tap to complete from this screen):
 * - User enters item name (required, 1-50 chars)
 * - User optionally enters location description (0-150 chars)
 * - User taps "Save" → item is created, confirmation shown
 *
 * Full store-item flow: Add Item (tap 1) → Capture (tap 2) → Save (tap 3)
 *
 * Requirements: 1.3, 1.4, 1.5, 1.6, 1.7
 */
export const NameInputScreen: React.FC = () => {
  const navigation = useNavigation<NameInputNavigationProp>();
  const route = useRoute<NameInputRouteProp>();
  const { photoUri } = route.params;

  const addItem = useItemStore((state) => state.addItem);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [descriptionError, setDescriptionError] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);

  const validateName = (value: string): boolean => {
    if (value.trim().length === 0) {
      setNameError('Please enter a name for this item.');
      return false;
    }
    if (value.trim().length > NAME_MAX_LENGTH) {
      setNameError(`Name must be ${NAME_MAX_LENGTH} characters or fewer.`);
      return false;
    }
    setNameError(undefined);
    return true;
  };

  const validateDescription = (value: string): boolean => {
    if (value.length > DESCRIPTION_MAX_LENGTH) {
      setDescriptionError(`Description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer.`);
      return false;
    }
    setDescriptionError(undefined);
    return true;
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (nameError) {
      validateName(value);
    }
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    if (descriptionError) {
      validateDescription(value);
    }
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    const isNameValid = validateName(trimmedName);
    const isDescriptionValid = validateDescription(trimmedDescription);

    if (!isNameValid || !isDescriptionValid) {
      return;
    }

    setIsSaving(true);
    try {
      const item = await addItem({
        name: trimmedName,
        description: trimmedDescription || undefined,
        photoUri,
      });

      setConfirmationMessage(`Got it! Your ${trimmedName} is saved.`);

      // Navigate to Confirmation screen after a brief moment for the user to see the message
      setTimeout(() => {
        navigation.navigate('Confirmation', {
          itemId: item.id,
          action: 'created',
        });
      }, 1500);
    } catch (error) {
      console.error('Save item error:', error);
      setNameError('Something went wrong saving that. Let\'s try again.');
      setIsSaving(false);
    }
  };

  // Show confirmation overlay if save succeeded
  if (confirmationMessage) {
    return (
      <View style={styles.confirmationContainer} testID="name-input-confirmation">
        <Text
          style={styles.confirmationText}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {confirmationMessage}
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      testID="name-input-screen"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo preview */}
        <View style={styles.photoPreviewContainer}>
          <Image
            source={{ uri: photoUri }}
            style={styles.photoPreview}
            accessibilityRole="image"
            accessibilityLabel="Captured item photo preview"
            resizeMode="cover"
          />
        </View>

        {/* Form section */}
        <View style={styles.formContainer}>
          <Text
            style={styles.heading}
            accessibilityRole="header"
          >
            Name this item
          </Text>

          <LargeTextInput
            label="Item name"
            placeholder="e.g., Keys, Glasses, Remote"
            value={name}
            onChangeText={handleNameChange}
            error={nameError}
            maxLength={NAME_MAX_LENGTH}
            autoFocus
            returnKeyType="next"
            testID="name-input-field"
            accessibilityLabel="Item name"
          />

          <View style={styles.inputSpacing} />

          <LargeTextInput
            label="Where is it? (optional)"
            placeholder="e.g., Kitchen hook by the door"
            value={description}
            onChangeText={handleDescriptionChange}
            error={descriptionError}
            maxLength={DESCRIPTION_MAX_LENGTH}
            multiline
            numberOfLines={2}
            returnKeyType="done"
            testID="description-input-field"
            accessibilityLabel="Location description, optional"
          />

          <View style={styles.buttonSpacing} />

          <LargeButton
            title="Save"
            onPress={handleSave}
            variant="primary"
            disabled={isSaving || name.trim().length === 0}
            testID="save-button"
            accessibilityLabel="Save item"
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  photoPreviewContainer: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    flex: 1,
    padding: spacing.xl,
  },
  heading: {
    fontSize: fonts.heading,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  inputSpacing: {
    height: spacing.lg,
  },
  buttonSpacing: {
    height: spacing.xl,
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  confirmationText: {
    fontSize: fonts.heading,
    fontWeight: '700',
    color: colors.success,
    textAlign: 'center',
    lineHeight: 34,
  },
});

export default NameInputScreen;
