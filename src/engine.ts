/**
 * Prompt Engine Orchestrator
 * 
 * Main entry point for the Minimal Viable Prompt Engine.
 * Orchestrates all pipeline phases to generate a prompt from selections.
 * 
 * Responsibilities:
 * - Coordinate all pipeline phases
 * - Handle errors and validation
 * - Return final Prompt or ValidationError
 */

import { AttributeDefinition, AttributeSelection, Modifier, ModelProfile, Prompt } from './types/entities';
import { ValidationError } from './types/errors';
import { validateSelection } from './modules/validator';
import { generateFragments } from './modules/fragment-generator';
import { applyModifiers } from './modules/fragment-processor';
import { orderFragments } from './modules/fragment-orderer';
import { assemblePrompt } from './modules/prompt-assembler';

/**
 * Engine configuration containing all required inputs.
 */
export interface EngineInput {
  /** Array of all available attribute definitions */
  attributeDefinitions: AttributeDefinition[];
  
  /** Array of attribute selections to process */
  selections: AttributeSelection[];
  
  /** Array of modifiers to apply */
  modifiers: Modifier[];
  
  /** Model profile configuration */
  modelProfile: ModelProfile;
}

/**
 * Generates a Stable Diffusion prompt from attribute selections.
 * 
 * Pipeline phases:
 * 1. Validate all selections for conflicts
 * 2. Generate fragments from selections
 * 3. Apply modifiers to fragments
 * 4. Order fragments by priority
 * 5. Assemble final prompt strings
 * 
 * @param input - Engine configuration with definitions, selections, modifiers, and model profile
 * @returns Prompt object if successful, or ValidationError if validation fails
 */
export function generatePrompt(input: EngineInput): Prompt | ValidationError {
  // Phase 1: Validate all selections (only checks if attributes exist, no conflict checking)
  for (const selection of input.selections) {
    const validation = validateSelection(
      selection.attributeId,
      input.selections, // Pass all selections for compatibility, but conflicts are ignored
      input.attributeDefinitions
    );
    
    if (!validation.valid) {
      // Stop only on INVALID_ATTRIBUTE errors (attribute doesn't exist)
      // Conflicts are ignored - users can select any attributes they want
      return validation.error!;
    }
  }

  // Phase 2: Generate fragments (all selections are processed, even if they conflict)
  const fragments = generateFragments(
    input.selections,
    input.attributeDefinitions
  );

  // Phase 3: Apply modifiers
  const weightedFragments = applyModifiers(
    fragments,
    input.modifiers
  );

  // Phase 4: Order fragments
  const orderedFragments = orderFragments(weightedFragments);

  // Phase 5: Assemble prompt
  const prompt = assemblePrompt(
    orderedFragments,
    input.modelProfile
  );

  return prompt;
}

