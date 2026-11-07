/**
 * Simple Theme Colors
 * Use these instead of hardcoded colors like 'bg-white', 'text-black', etc.
 */

export const themeColors = {
  // Main brand colors
  main: 'main',           // Use as: bg-main, text-main
  mainDark: 'main-dark',  // Use as: bg-main-dark, text-main-dark
  
  // Surface colors (for cards, backgrounds)
  surface: 'surface',           // Use as: bg-surface (replaces bg-white)
  surfaceMuted: 'surface-muted', // Use as: bg-surface-muted (light gray bg)
  
  // Accent color (for buttons, highlights)
  accent: 'accent',       // Use as: bg-accent, text-accent
  
  // Text colors
  textPrimary: 'text-primary',     // Use as: text-text-primary (replaces text-black)
  textSecondary: 'text-secondary', // Use as: text-text-secondary (gray text)
  
  // Utility colors
  highlight: 'highlight',         // Use as: bg-highlight (replaces bg-yellow-500)
  borderLight: 'border-light',    // Use as: border-border-light (replaces border-gray-200)
  
  // Semantic colors (from existing theme)
  error: 'error-500',
  success: 'success-500', 
  warning: 'warning-500',
  info: 'info-500',
  
  // Background variations
  background: 'background-0',
  backgroundMuted: 'background-muted',
} as const;

/**
 * Quick helper to get theme color classes
 * Usage examples:
 * 
 * // Backgrounds
 * bg(themeColors.surface)     // 'bg-surface' 
 * bg(themeColors.main)        // 'bg-main'
 * 
 * // Text
 * text(themeColors.textPrimary) // 'text-text-primary'
 */
export const bg = (color: string) => `bg-${color}`;
export const text = (color: string) => `text-${color}`;
export const border = (color: string) => `border-${color}`;