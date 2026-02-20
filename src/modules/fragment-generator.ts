/**
 * Fragment Generator Module
 * 
 * Generates PromptFragments from AttributeSelections.
 * 
 * Responsibilities:
 * - Convert AttributeSelections into PromptFragments
 * - Apply custom extensions to fragment text
 * - Create fragments with correct category and priority
 */

import { AttributeDefinition, AttributeSelection, PromptFragment } from '../types';

/**
 * Generates PromptFragments from a list of AttributeSelections.
 * 
 * @param selections - Array of attribute selections to convert
 * @param attributeDefinitions - Array of all attribute definitions
 * @returns Array of generated PromptFragments
 */
export function generateFragments(
  selections: AttributeSelection[],
  attributeDefinitions: AttributeDefinition[]
): PromptFragment[] {
  // Build Map from array for efficient lookups
  const definitionMap = new Map(
    attributeDefinitions.map(def => [def.id, def])
  );

  const fragments: PromptFragment[] = [];

  // Process each selection in input order
  for (const selection of selections) {
    // Skip disabled selections
    if (!selection.isEnabled) {
      continue;
    }

    // Retrieve corresponding AttributeDefinition
    const definition = definitionMap.get(selection.attributeId);
    
    // Skip silently if definition is missing
    if (!definition) {
      continue;
    }

    // Build fragment text: baseText + customExtension (if exists)
    let text = definition.baseText;
    if (selection.customExtension !== null && selection.customExtension !== '') {
      text = `${text} ${selection.customExtension}`;
    }

    // Create PromptFragment
    const fragment: PromptFragment = {
      text,
      category: definition.category,
      semanticPriority: definition.semanticPriority,
      weight: null,
      isNegative: definition.isNegative,
      sourceAttributeId: selection.attributeId,
    };

    fragments.push(fragment);
  }

  return fragments;
}

