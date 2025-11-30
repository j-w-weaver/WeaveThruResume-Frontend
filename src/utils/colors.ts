/**
 * WeavThru Design System - Grammarly-Inspired Dark Theme
 *
 * Jet blacks, dark greys, cream fonts for professional elegance
 */

export const colors = {
  // Backgrounds - Jet blacks and dark greys
  bg: {
    primary: "#0B0F19", // Main background - deep black
    secondary: "#161B26", // Elevated surfaces - cards, sidebar
    tertiary: "#1E2533", // Hover states
    overlay: "#0B0F19E6", // Overlay with opacity
  },

  // Text - Cream colors (not harsh white)
  text: {
    primary: "#F7F4ED", // Main text - warm cream
    secondary: "#C9C5BA", // Secondary text - muted cream
    tertiary: "#9A9891", // Tertiary text - darker cream
    disabled: "#6B6960", // Disabled state
  },

  // Accent - Professional blue (Grammarly green → our blue)
  accent: {
    primary: "#5B9FFF", // Primary blue
    hover: "#7BB3FF", // Hover state
    pressed: "#4A8AE6", // Pressed state
    subtle: "#2D4A73", // Subtle backgrounds
  },

  // Borders and dividers
  border: {
    default: "#2D3748", // Standard borders
    subtle: "#1E2533", // Subtle borders
    focus: "#5B9FFF", // Focus states
  },

  // Semantic colors
  success: "#4CAF50",
  warning: "#FF9800",
  error: "#EF4444",
} as const;

export default colors;
