/**
 * Navigation Buttons Component
 * 
 * Responsibilities:
 * - Display navigation controls (Back, Next, Skip)
 * - Show progress indicator (step X of Y)
 * - Capture navigation actions
 * - Display navigation state
 * 
 * Must NOT:
 * - Determine navigation logic
 * - Validate if navigation is allowed
 * - Store navigation state internally
 * - Compute next node ID
 */

import './NavigationButtons.css';

interface NavigationButtonsProps {
  /** Whether back button should be enabled */
  canGoBack: boolean;
  
  /** Whether next button should be enabled */
  canGoNext: boolean;
  
  /** Current step number */
  currentStep: number;
  
  /** Total steps (null if unknown) */
  totalSteps: number | null;
  
  /** Handler for back navigation */
  onNavigateBack: () => void;
  
  /** Handler for next navigation */
  onNavigateNext: () => void;
  
  /** Handler for skip navigation (optional) */
  onNavigateSkip?: () => void;
}

/**
 * Navigation Buttons Component
 * 
 * Displays navigation controls and captures navigation actions.
 */
export function NavigationButtons({
  canGoBack,
  canGoNext,
  currentStep,
  totalSteps,
  onNavigateBack,
  onNavigateNext,
  onNavigateSkip,
}: NavigationButtonsProps) {
  // TODO: Render Back button (disabled if !canGoBack)
  // TODO: Render Next button (disabled if !canGoNext)
  // TODO: Render Skip button (if onNavigateSkip provided)
  // TODO: Render progress indicator (currentStep / totalSteps)
  // TODO: Handle button clicks -> call appropriate handler

  return (
    <div className="navigation-buttons">
      <button
        className={`nav-button nav-button-back ${!canGoBack ? 'disabled' : ''}`}
        onClick={onNavigateBack}
        disabled={!canGoBack}
        type="button"
      >
        Back
      </button>
      {onNavigateSkip && (
        <button
          className="nav-button nav-button-skip"
          onClick={onNavigateSkip}
          type="button"
        >
          Skip
        </button>
      )}
      <button
        className={`nav-button nav-button-next ${!canGoNext ? 'disabled' : ''}`}
        onClick={onNavigateNext}
        disabled={!canGoNext}
        type="button"
      >
        Next
      </button>
    </div>
  );
}

