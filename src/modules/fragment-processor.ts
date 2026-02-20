/**
 * Fragment Processor Module
 * 
 * Applies modifiers (weights) to PromptFragments.
 * 
 * Responsibilities:
 * - Match modifiers to their target fragments
 * - Apply weight values to fragments
 * - Validate modifier targets exist
 */

import { Modifier, PromptFragment } from '../types';

/**
 * Applies modifiers to their target fragments.
 * 
 * @param fragments - Array of fragments to process
 * @param modifiers - Array of modifiers to apply
 * @returns Array of fragments with weights applied
 */
export function applyModifiers(
  fragments: PromptFragment[],
  modifiers: Modifier[]
): PromptFragment[] {
  // Create shallow copy of fragments to avoid mutating input
  const resultFragments = fragments.map(fragment => ({ ...fragment }));

  // Apply each modifier
  for (const modifier of modifiers) {
    // Validate modifier value is within 0.0-2.0 range
    if (modifier.value < 0.0 || modifier.value > 2.0) {
      continue;
    }

    // Find fragment where sourceAttributeId matches targetAttributeId
    const fragment = resultFragments.find(
      f => f.sourceAttributeId === modifier.targetAttributeId
    );

    // If no fragment found, skip modifier
    if (!fragment) {
      continue;
    }

    // Do NOT apply modifiers to negative fragments
    if (fragment.isNegative) {
      continue;
    }

    // Apply weight (override if already set - last modifier wins)
    fragment.weight = modifier.value;
  }

  return resultFragments;
}

