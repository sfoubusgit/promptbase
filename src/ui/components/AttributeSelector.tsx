/**
 * Attribute Selector Component
 * 
 * GLOBAL UI REQUIREMENT: Inline Weight Slider
 * 
 * This component implements a SYSTEM-WIDE RULE that applies to EVERY attribute:
 * - When ANY attribute is selected, a weight slider MUST appear inside that attribute's element
 * - When deselected, the slider MUST disappear immediately
 * - There are NO exceptions, NO special cases, NO categories without sliders
 * - This behavior applies to ALL current and future attributes automatically
 * 
 * Responsibilities:
 * - Display attribute options (buttons/cards)
 * - Show labels, descriptions, icons
 * - Indicate selected state (highlighting, checkmarks)
 * - Capture user selection
 * - Display inline weight slider for selected attributes (GLOBAL, NO EXCEPTIONS)
 * - Display custom extension input
 * 
 * Must NOT:
 * - Validate if attribute can be selected
 * - Check for conflicts
 * - Store selection state internally
 * - Compute which attributes are available
 * - Filter or transform attribute definitions
 * - Conditionally disable weight sliders
 */

import './AttributeSelector.css';

// TODO: Import types when ready
// import { AttributeDefinition } from '../types';

interface AttributeSelectorProps {
  /** All available attribute definitions for current context */
  attributeDefinitions: any[]; // TODO: AttributeDefinition[]
  
  /** Current selection state */
  selections: Map<string, { isEnabled: boolean; customExtension: string | null }>;
  
  /** Current weight values for selected attributes */
  weightValues: Map<string, number>;
  
  /** Handler for attribute selection */
  onSelect: (attributeId: string) => void;
  
  /** Handler for attribute deselection */
  onDeselect: (attributeId: string) => void;
  
  /** Handler for custom extension changes */
  onCustomExtensionChange: (attributeId: string, extension: string) => void;
  
  /** Handler for weight changes */
  onWeightChange: (attributeId: string, value: number) => void;

  /** Global weight enabled toggle */
  weightsEnabledGlobal: boolean;
}

/**
 * Attribute Selector Component
 * 
 * Displays attribute options and captures user selections.
 */
export function AttributeSelector({
  attributeDefinitions,
  selections,
  weightValues,
  onSelect,
  onDeselect,
  onCustomExtensionChange,
  onWeightChange,
  weightsEnabledGlobal,
}: AttributeSelectorProps) {
  const handleItemClick = (attributeId: string, e: React.MouseEvent) => {
    // Prevent any form submission or navigation
    e.preventDefault();
    e.stopPropagation();
    
    // Don't toggle if clicking on the slider or its container
    const target = e.target as HTMLElement;
    if (target.closest('.attribute-weight-slider-container')) {
      return;
    }
    
    const selection = selections.get(attributeId);
    if (selection?.isEnabled) {
      onDeselect(attributeId);
    } else {
      onSelect(attributeId);
    }
  };
  
  const handleSliderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const clampWeight = (value: number) => Math.max(0, Math.min(2, value));

  const handleWeightAdjust = (attributeId: string, delta: number) => {
    const current = weightValues.get(attributeId) ?? 1.0;
    const next = clampWeight(parseFloat((current + delta).toFixed(1)));
    onWeightChange(attributeId, next);
  };

  return (
    <div className="attribute-selector">
      {attributeDefinitions.map((attr: any) => {
        const selection = selections.get(attr.id);
        const isSelected = selection?.isEnabled ?? false;
        const isDisabled = false; // TODO: Handle disabled state if needed

        const currentWeight = weightValues.get(attr.id) ?? 1.0;
        return (
          <div
            key={attr.id}
            className={`attribute-item ${
              isSelected ? 'selected' : ''
            } ${isDisabled ? 'disabled' : ''}`}
            onClick={(e) => !isDisabled && handleItemClick(attr.id, e)}
          >
            <div className="attribute-content">
              <div className="attribute-label">
                {attr.baseText || attr.id}
              </div>
              {attr.description && (
                <div className="attribute-description">
                  {attr.description}
                </div>
              )}
            </div>
            
            {/* 
              GLOBAL INLINE WEIGHT SLIDER - NO EXCEPTIONS
              
              This slider appears for EVERY selected attribute, regardless of:
              - Category (subject, style, lighting, etc.)
              - Subcategory
              - Positive or negative attribute
              - Any other property
              
              The only condition is: isSelected === true
              There are NO other conditions, NO special cases, NO exclusions.
            */}
            {isSelected && (
              <div 
                className="attribute-weight-slider-container"
                onClick={handleSliderClick}
              >
                <div className="attribute-weight-header">
                  <label className="attribute-weight-label">Weight</label>
                </div>
                {weightsEnabledGlobal && (
                  <div className="attribute-weight-control">
                    <button
                      type="button"
                      className="attribute-weight-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWeightAdjust(attr.id, -0.1);
                      }}
                    >
                      -
                    </button>
                    <span className="attribute-weight-value">{currentWeight.toFixed(1)}</span>
                    <button
                      type="button"
                      className="attribute-weight-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWeightAdjust(attr.id, 0.1);
                      }}
                    >
                      +
                    </button>
                  </div>
                )}
                {!weightsEnabledGlobal && (
                  <div className="attribute-weight-disabled">Weights are off</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

