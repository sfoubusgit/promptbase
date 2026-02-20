/**
 * Error Display Component
 * 
 * Responsibilities:
 * - Display validation errors
 * - Show error message and type
 * - Display error details
 * - Highlight problematic selections
 * - Suggest resolution actions
 * 
 * Must NOT:
 * - Validate errors manually
 * - Transform error messages
 * - Compute which selections are problematic
 * - Store error state internally
 * - Auto-fix errors
 */

import './ErrorDisplay.css';

// TODO: Import types when ready
// import { ValidationError } from '../types';

interface ErrorDisplayProps {
  /** Current error (null if no error) */
  error: any | null; // TODO: ValidationError | null
  
  /** Current selections (to highlight problematic ones) */
  selections: Map<string, { isEnabled: boolean; customExtension: string | null }>;
  
  /** Handler for error dismissal (optional) */
  onDismissError?: () => void;
  
  /** Handler for removing conflicting selection */
  onRemoveSelection: (attributeId: string) => void;
}

/**
 * Error Display Component
 * 
 * Displays engine validation errors and provides error context.
 */
export function ErrorDisplay({
  error,
  selections,
  onDismissError,
  onRemoveSelection,
}: ErrorDisplayProps) {
  // TODO: Render error message (error.message)
  // TODO: Show error type indicator (CONFLICT, INVALID_ATTRIBUTE, etc.)
  // TODO: Display error details (conflicting IDs, invalid attribute, etc.)
  // TODO: Highlight problematic selections in UI
  // TODO: Show resolution suggestions
  // TODO: Render dismiss button (if onDismissError provided)
  // TODO: Render remove buttons for conflicts -> call onRemoveSelection

  if (!error) {
    return null;
  }

  return (
    <div className="error-display">
      {error.type && (
        <div className="error-title">
          {error.type}
        </div>
      )}
      <div className="error-message">
        {error.message || 'An error occurred'}
      </div>
      {error.details && Object.keys(error.details).length > 0 && (
        <div className="error-details">
          {error.details.conflictingAttributeIds && (
            <div>
              Conflicting attributes: {error.details.conflictingAttributeIds.join(', ')}
            </div>
          )}
          {error.details.invalidAttributeId && (
            <div>
              Invalid attribute: {error.details.invalidAttributeId}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

