import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, fonts, spacing, touchTargets, borderRadius } from '../theme';

export interface LargeButtonProps {
  /** Button label text (required — no icon-only buttons) */
  title: string;
  /** Called when button is pressed */
  onPress: () => void;
  /** Optional icon element displayed before the title */
  icon?: React.ReactNode;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'destructive';
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Accessibility label override (defaults to title) */
  accessibilityLabel?: string;
  /** Optional additional style for the container */
  style?: ViewStyle;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Large accessible button component.
 * - Minimum 48x48dp touch target
 * - Full-width styling
 * - Supports text + icon
 * - Clear descriptive label (no icon-only)
 */
export const LargeButton: React.FC<LargeButtonProps> = ({
  title,
  onPress,
  icon,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
  style,
  testID,
}) => {
  const containerStyle: ViewStyle[] = [
    styles.container,
    styles[variant],
    disabled ? styles.disabled : undefined,
    style,
  ].filter(Boolean) as ViewStyle[];

  const textStyle: TextStyle[] = [
    styles.text,
    variant === 'secondary' ? styles.textSecondary : styles.textOnDark,
    disabled ? styles.textDisabled : undefined,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityState={{ disabled }}
      activeOpacity={0.7}
      testID={testID}
    >
      {icon && icon}
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: touchTargets.minSize,
    minWidth: touchTargets.minSize,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  destructive: {
    backgroundColor: colors.error,
  },
  disabled: {
    backgroundColor: colors.disabled,
    borderColor: colors.disabled,
  },
  text: {
    fontSize: fonts.body,
    fontWeight: '600',
  },
  textOnDark: {
    color: colors.textOnPrimary,
  },
  textSecondary: {
    color: colors.primary,
  },
  textDisabled: {
    color: colors.background,
  },
});

export default LargeButton;
