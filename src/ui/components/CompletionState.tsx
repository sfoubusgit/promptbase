/**
 * Completion State Component
 * 
 * Responsibilities:
 * - Display completion message when interview is finished
 * - Show summary of selections made
 * - Provide option to start over or review
 * 
 * Must NOT:
 * - Store completion state internally
 * - Compute completion logic
 * - Modify selections
 */

import './CompletionState.css';

interface CompletionStateProps {
  /** Total number of questions answered */
  totalSteps: number;
  
  /** Handler for starting over (optional) */
  onStartOver?: () => void;
  
  /** Handler for going back to review (optional) */
  onReview?: () => void;
}

/**
 * Completion State Component
 * 
 * Displays when the interview flow is complete.
 */
export function CompletionState({
  totalSteps,
  onStartOver,
  onReview,
}: CompletionStateProps) {
  return (
    <div className="completion-state">
      <div className="completion-state-icon">✓</div>
      <h2 className="completion-state-title">Interview Complete</h2>
      <p className="completion-state-message">
        You've completed all {totalSteps} questions. Your prompt is ready!
      </p>
      <div className="completion-state-actions">
        {onReview && (
          <button
            className="completion-state-button completion-state-button-secondary"
            onClick={onReview}
          >
            Review Selections
          </button>
        )}
        {onStartOver && (
          <button
            className="completion-state-button completion-state-button-primary"
            onClick={onStartOver}
          >
            Start Over
          </button>
        )}
      </div>
    </div>
  );
}

