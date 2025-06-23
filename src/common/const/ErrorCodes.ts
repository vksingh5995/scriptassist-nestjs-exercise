export function getEnumKeyValuePairs<T extends object>(
  enumObj: T,
): { key: string; value: string }[] {
  return Object.keys(enumObj)
    .filter(key => typeof enumObj[key as keyof T] === 'string') // Filter out numeric values in reverse-mapped enums (if any)
    .map(key => ({
      key,
      value: enumObj[key as keyof T] as string,
    }));
}

export enum ErrorCodes {
  // 400 - Bad Request Errors
  BAD_REQUEST = 'Bad Request',
  INVALID_INPUT = 'The input provided is not valid. Please check your request data.',
  // 401 - Unauthorized Errors
  UNAUTHORIZED = 'You are not authorized to access this resource.',
  INVALID_TOKEN = 'The token provided is invalid or expired. Please log in again.',
  NOT_AUTHENTICATED_LOGIN = 'You are not authenticated. Please log in to access this resource.',
  NOT_UNAUTHORIZED_ACTION = 'You are not authorized to perform this action.',

  // 403 - Forbidden Errors
  FORBIDDEN = 'Access is forbidden.',
  INVALID_CREDENTIALS = 'Invalid credentials provided. Please check your username and password.',
  ACCESS_DENIED = 'You do not have permission to access this resource.',

  // 404 - Not Found Errors
  NOT_FOUND = 'Not Found',
  ITEM_NOT_FOUND = 'Item not found, Please check the given item ID',

  // 409 - Conflict Errors
  CONFLICT = 'Conflict',
  DUPLICATE_ENTRY = 'A resource with the same unique identifier already exists.',

  // 500 - Internal Server Errors
  INTERNAL_SERVER_ERROR = 'Internal Server Error',
  SERVER_ERROR = 'An unexpected error occurred on the server. Please try again later.',

  // 503 - Service Unavailable
  SERVICE_UNAVAILABLE = 'Service is Unavailable. Please try again later.',
  MAINTENANCE_MODE = 'The service is temporarily unavailable due to maintenance. Please try again later.',

  // Custom Error Codes
  ID_NOT_FOUND = 'Please provide a valid ID.',
  USER_NOT_FOUND = 'User with {{email}} not found, Please provide a valid email address',
  INVALID_ROLE = 'Invalid role provided, Please check the role ID',
  ROLE_ASSIGNED_TO_USER = 'Role is assigned to user, Please remove the role from the user and try again',
  UNAUTHORIZED_ACTION = 'You are not authorized to perform this action',
  DUPLICATE_EMAIL_INPUT = 'User with this {{email}} already exists, Please provide a unique email address',
  USER_WITH_ROLE_NOT_FOUND = 'User with this role not found, Please provide a valid role ID',
  USER_CANNOT_CHANGE_EMAIL = 'User cannot change his/her email, Please provide a valid email address',

  // AUTHENTICATION ERRORS and MESSAGES
  AUTH_TOKEN = 'Authentication token is required',
  AUTH_TOKEN_INVALID = 'Invalid token provided',
  AUTH_TOKEN_EXPIRED = 'Token has expired, Please log in again',
  AUTH_TOKEN_NOT_FOUND = 'Authentication Token is not found ',
}
