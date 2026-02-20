/**
 * QuestionCard Usage Example
 * 
 * This shows how to use QuestionCard in App.tsx
 */

import { QuestionCard } from './QuestionCard';

// Example usage in App.tsx:
/*
<div className="app-controls">
  <QuestionCard
    node={{
      question: "What type of character?",
      description: "Choose the main subject of your image"
    }}
    currentStep={1}
    selections={selectionsMap}
    modifierValues={modifierValues}
    attributeDefinitions={attributeDefinitions}
    modifiers={Array.from(modifiers.values())}
    onSelect={handleAttributeSelect}
    onDeselect={handleAttributeDeselect}
    onCustomExtensionChange={handleCustomExtensionChange}
    onWeightChange={handleWeightChange}
    weightsEnabledGlobal={weightsEnabledGlobal}
    onToggleGlobalWeights={setWeightsEnabledGlobal}
    onNavigateBack={handleNavigateBack}
    onNavigateNext={handleNavigateNext}
    onNavigateSkip={handleNavigateSkip}
    canGoBack={canGoBack}
    canGoNext={canGoNext}
  />
</div>
*/

// The QuestionCard component:
// - Displays question text and description
// - Renders AttributeSelector for answer options
// - Shows ModifierControls if modifiers exist
// - Includes NavigationButtons at the bottom
// - All styled with design tokens for consistent darkroom aesthetic

