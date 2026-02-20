/**
 * Selection Summary Component
 * 
 * Responsibilities:
 * - Display committed selections
 * - Show question text and answer for each
 * - Allow removal of selections
 * - Allow navigation to selection's question
 * 
 * Must NOT:
 * - Store selection list internally
 * - Compute selection order
 * - Filter or transform selections
 * - Validate if selection can be removed
 */

import './SelectionSummary.css';

// TODO: Import types when ready
// import { AttributeSelection, AttributeDefinition } from '../types';

interface SelectionSummaryProps {
  /** All committed selections */
  selections: any[]; // TODO: AttributeSelection[]
  
  /** Attribute definitions (to get question text) */
  attributeDefinitions: any[]; // TODO: AttributeDefinition[]
  
  /** Handler for removing a selection */
  onRemoveSelection: (attributeId: string) => void;
  
  /** Handler for navigating to selection's question (optional) */
  onNavigateToSelection?: (attributeId: string) => void;
}

/**
 * Selection Summary Component
 * 
 * Displays all committed selections and allows management.
 */
export function SelectionSummary({
  selections,
  attributeDefinitions,
  onRemoveSelection,
  onNavigateToSelection,
}: SelectionSummaryProps) {
  // TODO: Render list of selections
  // TODO: Show question text and answer for each
  // TODO: Render remove button for each -> call onRemoveSelection
  // TODO: Render navigate button (if onNavigateToSelection provided) -> call onNavigateToSelection
  // TODO: Display selection metadata (optional: timestamp, modifiers)

  if (selections.length === 0) {
    return null;
  }

  const getAttributeDefinition = (attributeId: string) => {
    return attributeDefinitions.find((def: any) => def.id === attributeId);
  };

  return (
    <div className="selection-summary">
      <div className="selection-summary-title">Selections</div>
      <div className="selection-summary-list">
        {selections.map((selection: any) => {
          const definition = getAttributeDefinition(selection.attributeId);
          const label = definition?.baseText || selection.attributeId;
          
          return (
            <div key={selection.attributeId} className="selection-summary-item">
              <span className="selection-summary-label">{label}</span>
              {selection.customExtension && (
                <span className="selection-summary-meta">
                  {selection.customExtension}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

