/**
 * Error types for the Minimal Viable Prompt Engine
 */

/**
 * Types of validation errors that can occur
 */
export type ValidationErrorType =
  | 'CONFLICT'
  | 'INVALID_ATTRIBUTE'
  | 'TOKEN_LIMIT_EXCEEDED';

/**
 * Represents a validation error during prompt generation
 */
export interface ValidationError {
  /** Type of error */
  type: ValidationErrorType;
  
  /** Human-readable error message */
  message: string;
  
  /** Additional error context */
  details: {
    /** For CONFLICT errors: list of conflicting attribute IDs */
    conflictingAttributeIds?: string[];
    
    /** For INVALID_ATTRIBUTE errors: the invalid attribute ID */
    invalidAttributeId?: string;
    
    /** For TOKEN_LIMIT_EXCEEDED errors: the calculated token count */
    calculatedTokenCount?: number;
    
    /** For TOKEN_LIMIT_EXCEEDED errors: the limit that was exceeded */
    tokenLimit?: number;
  };
}

