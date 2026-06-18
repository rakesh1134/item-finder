import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { colors, fonts, spacing, touchTargets, borderRadius } from '../theme';

export interface LargeTextInputProps extends Omit<TextInputProps, 'style'> {
  /** Visible label displayed above the input */
  label: string;
  /** Placeholder text inside the input */
  placeholder?: string;
  /** Current text value */
  value: string;
  /** Called when text changes */
  onChangeText: (text: string) => void;
  /** Optional error message displayed below the input */
  error?: string;
  /** Accessibility label override (defaults to label) */
  accessibilityLabel?: string;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Large accessible text input component.
 * - Large font size (18sp minimum)
 * - Clear visible label above the input
 * - Minimum 48dp height for touch target
 * - High-contrast text and borders
 */
export const LargeTextInput: React.FC<LargeTextInputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  accessibilityLabel,
  testID,
  ...rest
}) => {
  return (
    <View style={styles.wrapper}>
      <Text
        style={styles.label}
        accessibilityRole="text"
      >
        {label}
      </Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : undefined]}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        value={value}
        onChangeText={onChangeText}
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel || label}
        testID={testID}
        {...rest}
      />
      {error && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  label: {
    fontSize: fonts.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
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
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontSize: fonts.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default LargeTextInput;
