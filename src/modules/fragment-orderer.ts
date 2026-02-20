/**
 * Fragment Orderer Module
 * 
 * Orders and separates PromptFragments for final assembly.
 * 
 * Responsibilities:
 * - Sort fragments by semantic priority
 * - Maintain selection order within same priority
 * - Separate positive and negative fragments
 */

import { PromptFragment } from '../types';

/**
 * Ordered fragments separated into positive and negative.
 */
export interface OrderedFragments {
  /** Positive prompt fragments (ordered) */
  positive: PromptFragment[];
  
  /** Negative prompt fragments (ordered) */
  negative: PromptFragment[];
}

/**
 * Orders fragments by semantic priority and separates positive/negative.
 * 
 * @param fragments - Array of fragments to order
 * @returns Ordered fragments separated by positive/negative
 */
export function orderFragments(
  fragments: PromptFragment[]
): OrderedFragments {
  // Create shallow copy with original index tracking
  const fragmentsWithIndex = fragments.map((fragment, index) => ({
    fragment: { ...fragment },
    originalIndex: index,
  }));

  // Separate fragments into positive and negative
  const positiveFragments: Array<{ fragment: PromptFragment; originalIndex: number }> = [];
  const negativeFragments: Array<{ fragment: PromptFragment; originalIndex: number }> = [];

  for (const item of fragmentsWithIndex) {
    if (item.fragment.isNegative) {
      negativeFragments.push(item);
    } else {
      positiveFragments.push(item);
    }
  }

  // Sort positive fragments
  // Primary key: semanticPriority (ascending)
  // Secondary key: original input order (stable sort - preserve index)
  positiveFragments.sort((a, b) => {
    // First compare by semanticPriority
    if (a.fragment.semanticPriority !== b.fragment.semanticPriority) {
      return a.fragment.semanticPriority - b.fragment.semanticPriority;
    }
    // If priorities are equal, maintain original order
    return a.originalIndex - b.originalIndex;
  });

  // Sort negative fragments
  // Primary key: semanticPriority (ascending)
  // Secondary key: original input order (stable sort - preserve index)
  negativeFragments.sort((a, b) => {
    // First compare by semanticPriority
    if (a.fragment.semanticPriority !== b.fragment.semanticPriority) {
      return a.fragment.semanticPriority - b.fragment.semanticPriority;
    }
    // If priorities are equal, maintain original order
    return a.originalIndex - b.originalIndex;
  });

  // Extract fragments from sorted items
  return {
    positive: positiveFragments.map(item => item.fragment),
    negative: negativeFragments.map(item => item.fragment),
  };
}

