/**
 * Theme constants for the Item Finder app.
 * Designed for elderly users with accessibility requirements:
 * - Minimum 18sp body text, 24sp headings
 * - High-contrast colors (minimum 4.5:1 ratio)
 * - Minimum 48x48dp touch targets
 * - Consistent spacing for clarity
 */

export const fonts = {
  /** Body text: 18sp minimum */
  body: 18,
  /** Headings: 24sp minimum */
  heading: 24,
  /** Large headings for screen titles */
  title: 28,
  /** Caption/secondary text */
  caption: 16,
} as const;

export const colors = {
  /** Primary action color — dark blue for high contrast on white */
  primary: '#1A56DB',
  /** Primary text on light backgrounds — near-black for maximum contrast */
  textPrimary: '#1F2937',
  /** Secondary text for descriptions — dark gray, 4.5:1 on white */
  textSecondary: '#4B5563',
  /** White background */
  background: '#FFFFFF',
  /** Light gray surface for cards */
  surface: '#F9FAFB',
  /** Border/divider color */
  border: '#D1D5DB',
  /** Error/destructive actions — dark red for high contrast */
  error: '#B91C1C',
  /** Success/confirmation — dark green for high contrast */
  success: '#15803D',
  /** White text for use on dark backgrounds */
  textOnPrimary: '#FFFFFF',
  /** Disabled state */
  disabled: '#9CA3AF',
  /** Placeholder text — meets contrast requirements on white */
  placeholder: '#6B7280',
} as const;

export const spacing = {
  /** Extra small: 4dp */
  xs: 4,
  /** Small: 8dp — minimum between adjacent touch targets */
  sm: 8,
  /** Medium: 12dp */
  md: 12,
  /** Large: 16dp — default content padding */
  lg: 16,
  /** Extra large: 24dp */
  xl: 24,
  /** Double extra large: 32dp */
  xxl: 32,
} as const;

export const touchTargets = {
  /** Minimum touch target size: 48x48dp */
  minSize: 48,
  /** Minimum spacing between adjacent targets: 8dp */
  minSpacing: 8,
} as const;

export const borderRadius = {
  /** Small: 4dp */
  sm: 4,
  /** Medium: 8dp */
  md: 8,
  /** Large: 12dp */
  lg: 12,
} as const;

const theme = {
  fonts,
  colors,
  spacing,
  touchTargets,
  borderRadius,
} as const;

export default theme;
