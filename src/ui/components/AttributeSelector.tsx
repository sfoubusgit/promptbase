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

import { useState } from 'react';
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

  /** Output override values for prompt generation */
  selectionOutputOverrides?: Map<string, string>;

  /** Handler for output override changes */
  onSetSelectionOutputOverride?: (attributeId: string, value: string | null) => void;
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
  selectionOutputOverrides,
  onSetSelectionOutputOverride,
}: AttributeSelectorProps) {
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [weightEditingIds, setWeightEditingIds] = useState<Set<string>>(() => new Set());

  const handleItemClick = (attributeId: string, e: React.MouseEvent) => {
    // Prevent any form submission or navigation
    e.preventDefault();
    e.stopPropagation();
    
    // Don't toggle if clicking on the slider or its container
    const target = e.target as HTMLElement;
    if (target.closest('.attribute-weight-slider-container')) {
      return;
    }
    if (target.closest('.attribute-output-editor')) {
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

  const handleEditorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const clampWeight = (value: number) => Math.max(0, Math.min(2, value));

  const handleWeightAdjust = (attributeId: string, delta: number) => {
    const current = weightValues.get(attributeId) ?? 1.0;
    const next = clampWeight(parseFloat((current + delta).toFixed(1)));
    onWeightChange(attributeId, next);
  };

  const toggleWeightEditor = (attributeId: string) => {
    setWeightEditingIds(prev => {
      const next = new Set(prev);
      if (next.has(attributeId)) {
        next.delete(attributeId);
      } else {
        next.add(attributeId);
      }
      return next;
    });
  };

  return (
    <div className="attribute-selector">
      {attributeDefinitions.map((attr: any) => {
        const selection = selections.get(attr.id);
        const isSelected = selection?.isEnabled ?? false;
        const isDisabled = false; // TODO: Handle disabled state if needed

        const currentWeight = weightValues.get(attr.id) ?? 1.0;
        const customExtension = selection?.customExtension?.trim() || '';
        const baseText = `${attr.baseText || attr.id}${customExtension ? ` ${customExtension}` : ''}`;
        const outputOverride = selectionOutputOverrides?.get(attr.id);
        const outputValue = outputOverride || baseText;
        const isEditing = editingAttributeId === attr.id;
        const isWeightEditing = weightEditingIds.has(attr.id);
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

            {isSelected && (
              <div className="attribute-inline-controls" onClick={handleEditorClick}>
                <div className="attribute-inline-actions">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingAttributeId(attr.id);
                      setEditingValue(outputValue);
                    }}
                  >
                    Add + Edit
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleWeightEditor(attr.id);
                    }}
                  >
                    Add Weight
                  </button>
                </div>
              </div>
            )}

            {isSelected && isEditing && (
              <div className="attribute-output-editor" onClick={handleEditorClick}>
                <div className="attribute-output-header">
                  <span className="attribute-output-label">Output</span>
                  {outputOverride && (
                    <span className="attribute-output-badge">Edited</span>
                  )}
                </div>
                <input
                  type="text"
                  className="attribute-output-input"
                  value={editingValue}
                  onChange={event => setEditingValue(event.target.value)}
                  onClick={event => event.stopPropagation()}
                />
                <div className="attribute-output-actions">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      const trimmed = editingValue.trim();
                      if (onSetSelectionOutputOverride) {
                        onSetSelectionOutputOverride(attr.id, trimmed ? trimmed : null);
                      }
                      setEditingAttributeId(null);
                      setEditingValue('');
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setEditingAttributeId(null);
                      setEditingValue('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (onSetSelectionOutputOverride) {
                        onSetSelectionOutputOverride(attr.id, null);
                      }
                      setEditingAttributeId(null);
                      setEditingValue('');
                    }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
            
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
            {isSelected && isWeightEditing && (
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

