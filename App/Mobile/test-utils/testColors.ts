/**
 * Theme colors for tests
 * Use these constants in tests instead of hardcoded hex colors
 */

export const testColors = {
  // Test colors that match theme variables
  focused: '#6366f1',    // matches --color-main (indigo-600)
  unfocused: '#6b7280',  // matches --color-text-secondary (gray-500)
  
  // Alternative - using CSS var references
  focusedVar: 'rgb(var(--color-main))',
  unfocusedVar: 'rgb(var(--color-text-secondary))',
} as const;