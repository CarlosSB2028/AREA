/**
 * Custom error classes for better error handling
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class EmailNotVerifiedError extends ApiError {
  constructor(message = 'Please verify your email address to access this feature') {
    super(message, 403, 'EMAIL_NOT_VERIFIED');
    this.name = 'EmailNotVerifiedError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized. Please login again.') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'The requested resource was not found.') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends ApiError {
  constructor(message = 'Network error. Please check your connection.') {
    super(message, 0, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Helper to determine error type from message
 */
export function parseErrorMessage(message: string): ApiError {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('verify') && lowerMessage.includes('email'))
    return new EmailNotVerifiedError(message);
  if (lowerMessage.includes('unauthorized'))
    return new UnauthorizedError(message);
  if (lowerMessage.includes('forbidden') || lowerMessage.includes('permission'))
    return new ForbiddenError(message);
  if (lowerMessage.includes('not found'))
    return new NotFoundError(message);
  return new ApiError(message);
}
