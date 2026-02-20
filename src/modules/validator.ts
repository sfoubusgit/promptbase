/**
 * Selection Validator Module
 * 
 * Validates attribute selections for validity only.
 * 
 * Responsibilities:
 * - Verify attribute definition exists
 * - Return validation result or error
 * 
 * Note: Conflict checking has been removed - users can select any attributes they want.
 */

import { AttributeDefinition, AttributeSelection } from '../types/entities';
import { ValidationError } from '../types/errors';

/**
 * Validates a new attribute selection.
 * 
 * @param attributeId - ID of the attribute being selected
 * @param existingSelections - Currently active attribute selections (unused, kept for API compatibility)
 * @param attributeDefinitions - Array of all available attribute definitions
 * @returns Validation result with error if invalid, or success indicator
 */
export function validateSelection(
  attributeId: string,
  existingSelections: AttributeSelection[],
  attributeDefinitions: AttributeDefinition[]
): { valid: boolean; error?: ValidationError } {
  // Convert array to Map for efficient lookups
  const definitionMap = new Map(
    attributeDefinitions.map(def => [def.id, def])
  );

  // Check if attributeId exists in attributeDefinitions
  const newAttributeDef = definitionMap.get(attributeId);
  if (!newAttributeDef) {
    return {
      valid: false,
      error: {
        type: 'INVALID_ATTRIBUTE',
        message: `Attribute "${attributeId}" does not exist in attribute definitions`,
        details: {
          invalidAttributeId: attributeId,
        },
      },
    };
  }

  // Selection is valid (no conflict checking)
  return { valid: true };
}

