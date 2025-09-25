// ===========================================
// src/errors.ts - Custom Error Types
// ===========================================

/**
 * Base class for all application-specific errors
 */
export abstract class AppError extends Error {
  abstract readonly code: string;
  
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = this.constructor.name;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Configuration-related errors
 */
export class ConfigurationError extends AppError {
  readonly code = 'CONFIG_ERROR';
  
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}

/**
 * Invalid person ID errors
 */
export class InvalidPersonIdError extends AppError {
  readonly code = 'INVALID_PERSON_ID';
  
  constructor(id: string, options?: ErrorOptions) {
    super(`Invalid person ID: ${id}`, options);
  }
}

/**
 * Person not found errors
 */
export class PersonNotFoundError extends AppError {
  readonly code = 'PERSON_NOT_FOUND';
  
  constructor(id: string, options?: ErrorOptions) {
    super(`Person not found: ${id}`, options);
  }
}

/**
 * Connector-related errors
 */
export class ConnectorError extends AppError {
  readonly code = 'CONNECTOR_ERROR';
  
  constructor(system: string, message: string, options?: ErrorOptions) {
    super(`Connector error for system '${system}': ${message}`, options);
  }
}

/**
 * API communication errors
 */
export class ApiError extends AppError {
  readonly code = 'API_ERROR';
  
  constructor(message: string, public readonly statusCode?: number, options?: ErrorOptions) {
    super(`API Error: ${message}`, options);
  }
}

/**
 * Required field validation errors
 */
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR';
  
  constructor(field: string, operation: string, options?: ErrorOptions) {
    const message = field.includes(',') 
      ? `${field} are required for ${operation}`
      : `${field} is required for ${operation}`;
    super(message, options);
  }
}