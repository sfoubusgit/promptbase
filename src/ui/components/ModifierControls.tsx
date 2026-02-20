/**
 * Modifier Controls Component
 * 
 * Responsibilities:
 * - Display weight sliders
 * - Show current value (formatted for display)
 * - Show min/max bounds
 * - Show enabled/disabled checkbox
 * - Capture weight adjustments
 * 
 * Allowed validation:
 * - Basic input validation (numeric, within min/max)
 * - UI-only validation (slider enabled before adjustment)
 * 
 * Must NOT:
 * - Validate against engine rules
 * - Store weight values internally
 * - Format weights for prompt
 * - Apply business rules
 */

import './ModifierControls.css';

// TODO: Import types when ready
// import { Modifier } from '../types';

interface ModifierControlsProps {
  /** Available modifiers for current context */
  modifiers: any[]; // TODO: Modifier[]
  
  /** Current weight values */
  modifierValues: Map<string, number>;
  
  /** Which modifiers are enabled */
  modifierEnabled: Map<string, boolean>;
  
  /** Handler for weight value changes */
  onWeightChange: (attributeId: string, value: number) => void;
  
  /** Handler for weight enabled/disabled changes */
  onWeightEnabledChange: (attributeId: string, enabled: boolean) => void;
}

/**
 * Modifier Controls Component
 * 
 * Displays weight sliders and captures weight adjustments.
 */
export function ModifierControls({
  modifiers,
  modifierValues,
  modifierEnabled,
  onWeightChange,
  onWeightEnabledChange,
}: ModifierControlsProps) {
  // TODO: Render weight sliders for each modifier
  // TODO: Display current values (formatted for display)
  // TODO: Show enabled/disabled checkboxes
  // TODO: Handle slider changes -> call onWeightChange
  // TODO: Handle checkbox changes -> call onWeightEnabledChange
  // TODO: Apply basic input validation (numeric, min/max)

  return (
    <div className="modifier-controls">
      {modifiers.map((modifier: any) => {
        const value = modifierValues.get(modifier.targetAttributeId) ?? 1.0;
        const isEnabled = modifierEnabled.get(modifier.targetAttributeId) ?? false;

        return (
          <div key={modifier.targetAttributeId} className="modifier-row">
            <label className="modifier-label">
              {modifier.targetAttributeId}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={value}
              disabled={!isEnabled}
              onChange={(e) => onWeightChange(modifier.targetAttributeId, parseFloat(e.target.value))}
            />
            <span className="modifier-value">
              {value.toFixed(1)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

