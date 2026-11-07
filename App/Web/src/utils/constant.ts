export const TIME_MS = {
  SECOND: 1000, // 1 second = 1000 milliseconds
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

export const TOKEN_EXPIRY = {
  SHORT: TIME_MS.HOUR,           // 1 hour for sensitive operations
  MEDIUM: TIME_MS.HOUR * 8,      // 8 hours for regular sessions
  LONG: TIME_MS.DAY,             // 24 hours for extended sessions
  REMEMBER_ME: TIME_MS.WEEK,     // 7 days for "remember me" option
} as const;