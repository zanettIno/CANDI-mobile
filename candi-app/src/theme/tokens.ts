/**
 * Design Tokens for CANDI
 *
 * Centralized design system values for consistent UI across the app.
 * Used for spacing, colors, typography, and other design properties.
 *
 * Focus: Accessibility, consistency, and clarity for cancer patient users
 */

// ============================================================================
// SPACING SCALE (Base: 8px)
// ============================================================================
export const spacing = {
  xs: 4,      // Extra small - micro spacing
  sm: 8,      // Small - standard spacing between elements
  md: 12,     // Medium - comfortable spacing
  base: 16,   // Base/Standard - primary spacing unit
  lg: 24,     // Large - section spacing
  xl: 32,     // Extra large - major sections
  xxl: 48,    // Double extra large - page margins
} as const;

// ============================================================================
// COLORS
// ============================================================================
export const colors = {
  // Primary Brand Colors
  primary: {
    rosa_full: '#FFC4C4',       // Primary pink - use for main CTAs and accents
    rosa_light: '#FFE9E9',      // Lighter pink - hover/secondary states
  },

  // Secondary Brand Colors
  secondary: {
    mint: '#CFFFE5',            // Mint green - secondary actions
    blue: '#759AAB',            // Muted blue - tertiary actions
    blue_light: '#8cb2c4',      // Light blue
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',           // Card background, primary background
    light_gray: '#f6f6f6',      // Page background
    form_field: '#eeeeeeff',    // Input background when inactive
    placeholder: '#EAEAEA',     // Placeholder backgrounds
    gray: '#CCCCCC',            // Borders, dots, dividers
    gray_medium: '#888',        // Medium gray text
  },

  // Text Colors (Accessibility focus: sufficient contrast)
  text: {
    primary: '#333333',         // Primary text - highest contrast
    secondary: '#545F71',       // Secondary text
    tertiary: '#666666',        // Tertiary text
    phone: '#555555',           // Phone number specific
    placeholder: '#888888',     // Placeholder text
  },

  // States
  states: {
    error: '#ff6b6b',           // Error/validation red
    success: '#4CAF50',         // Success green
    warning: '#FFA500',         // Warning orange
    info: '#2196F3',            // Info blue
    disabled: '#CCCCCC',        // Disabled elements
  },

  // Shadows
  shadow: '#000000',
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================
export const typography = {
  // Font Families
  fonts: {
    body: 'Inter_400Regular',           // Body text font
    body_medium: 'Inter_500Medium',     // Medium weight body
    heading: 'Kadwa_700Bold',           // Headings and titles
    heading_regular: 'Kadwa_400Regular', // Display text
  },

  // Font Sizes (Minimum 16px for accessible reading)
  sizes: {
    // Labels and small text
    label_small: 11,            // ⚠️ Only for badges/tags (use sparingly)
    label_medium: 12,           // ⚠️ Only for labels/secondary text
    label_large: 14,            // Labels, button text

    // Body text (minimum 16px for reading)
    body_small: 12,             // Secondary/helper text only
    body_medium: 14,            // Secondary text
    body_large: 16,             // 🎯 Primary reading text - MINIMUM

    // Titles (use Kadwa Bold)
    title_small: 14,            // Small titles
    title_medium: 16,           // Medium titles
    title_large: 22,            // Large titles

    // Headings (use Kadwa Bold)
    heading_small: 24,          // Section headings
    heading_medium: 28,         // Page headings
    heading_large: 32,          // Major headings

    // Display text (use Kadwa Regular)
    display_small: 36,          // Hero text
    display_medium: 45,         // Very large display
    display_large: 57,          // Extra large display
  },

  // Font Weights
  weights: {
    regular: 400 as const,
    medium: 500 as const,
    bold: 700 as const,
  },

  // Line Heights
  lineHeights: {
    tight: 1.2,     // Headings
    normal: 1.5,    // Body text (for accessibility)
    relaxed: 1.75,  // Long form text
  },
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================
export const borderRadius = {
  none: 0,
  small: 8,       // Subtle rounding
  medium: 12,     // Standard rounding for inputs
  large: 24,      // Large rounding for buttons/cards
  full: 50,       // Fully rounded (pill-shaped)
} as const;

// ============================================================================
// BUTTON STYLES (Predefined variants)
// ============================================================================
export const buttonStyles = {
  primary: {
    backgroundColor: colors.primary.rosa_full,
    textColor: colors.text.primary,
    borderColor: colors.primary.rosa_full,
    height: 56,
    padding: {
      horizontal: spacing.lg,    // 24px
      vertical: spacing.base,    // 16px
    },
    borderRadius: borderRadius.full,
    fontSize: typography.sizes.label_large,
    fontWeight: typography.weights.medium,
  },

  secondary: {
    backgroundColor: colors.secondary.mint,
    textColor: colors.text.primary,
    borderColor: colors.secondary.mint,
    height: 56,
    padding: {
      horizontal: spacing.lg,
      vertical: spacing.base,
    },
    borderRadius: borderRadius.full,
    fontSize: typography.sizes.label_large,
    fontWeight: typography.weights.medium,
  },

  outline: {
    backgroundColor: colors.neutral.white,
    textColor: colors.text.primary,
    borderColor: colors.secondary.blue,
    borderWidth: 2,
    height: 56,
    padding: {
      horizontal: spacing.lg,
      vertical: spacing.base,
    },
    borderRadius: borderRadius.full,
    fontSize: typography.sizes.label_large,
    fontWeight: typography.weights.medium,
  },
} as const;

// ============================================================================
// INPUT STYLES (Predefined variants)
// ============================================================================
export const inputStyles = {
  default: {
    backgroundColor: colors.neutral.form_field,
    borderColor: colors.neutral.gray,
    focusBorderColor: colors.primary.rosa_full,
    errorBorderColor: colors.states.error,
    textColor: colors.text.primary,
    placeholderColor: colors.text.placeholder,
    height: 56,
    padding: {
      horizontal: spacing.base,   // 16px
      vertical: spacing.base,     // 16px (will be adjusted for text centering)
    },
    borderRadius: borderRadius.full,
    iconPadding: spacing.lg,      // 24px from right
    fontSize: typography.sizes.body_large,
  },
} as const;

// ============================================================================
// SHADOWS
// ============================================================================
export const shadows = {
  none: {
    elevation: 0,
  },
  small: {
    elevation: 2,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  medium: {
    elevation: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  large: {
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
} as const;

// ============================================================================
// ANIMATION
// ============================================================================
export const animation = {
  duration: {
    fast: 150,      // Quick interactions
    normal: 300,    // Standard transitions
    slow: 500,      // Slower animations
  },
  timing: {
    ease: 'ease',
    easeIn: 'easeIn',
    easeOut: 'easeOut',
    easeInOut: 'easeInOut',
  },
} as const;

// ============================================================================
// ICON STYLES
// ============================================================================
export const iconStyles = {
  small: {
    size: 16,
    strokeWidth: 2.5,  // Bold stroke for accessibility
  },
  medium: {
    size: 24,
    strokeWidth: 2.5,  // Bold stroke for accessibility
  },
  large: {
    size: 32,
    strokeWidth: 2.5,  // Bold stroke for accessibility
  },
} as const;

/**
 * USAGE GUIDELINES
 *
 * SPACING:
 * - Use spacing.base (16px) as the standard unit
 * - For close-related elements: spacing.sm (8px)
 * - For sections: spacing.lg (24px) or spacing.xl (32px)
 * - Never use arbitrary values like marginTop: 13 or padding: "5%"
 *
 * TYPOGRAPHY:
 * - Minimum font size for reading: 16px (body_large)
 * - Label text: 14px (label_large)
 * - Always use line-height: 1.5 for body text
 *
 * COLORS:
 * - Use color tokens, never hardcode hex values
 * - Primary pink (rosa_full) for main CTAs
 * - Blue (colors.secondary.blue) for secondary actions
 * - Always ensure text contrast ratios meet WCAG AA standards
 *
 * BUTTONS:
 * - Primary: rosa_full background, 56px height
 * - Secondary: mint background
 * - Outline: white background with blue border
 * - Use buttonStyles for consistent styling
 *
 * INPUTS:
 * - Rounded borders (borderRadius.full)
 * - Light gray background when inactive
 * - Rosa_full border on focus
 * - Minimum 16px text size
 * - Use inputStyles for consistent styling
 */
