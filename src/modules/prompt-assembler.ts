/**
 * Prompt Assembler Module
 * 
 * Assembles final prompt strings from ordered fragments.
 * 
 * Responsibilities:
 * - Format fragments with weights
 * - Join fragments into prompt strings
 * - Validate token limits
 * - Apply model-specific formatting
 */

import { ModelProfile, Prompt } from '../types';
import { OrderedFragments } from './fragment-orderer';

/**
 * Maps technical category names to user-friendly section names for display
 */
const CATEGORY_TO_SECTION_MAP: Record<string, keyof NonNullable<Prompt['sections']>> = {
  'subject': 'characters',
  'environment': 'scene',
  'actions': 'actions',
  'anatomy-details': 'characters',
  'style': 'style',
  'lighting': 'lighting',
  'camera': 'camera',
  'effects': 'effects',
  'quality': 'quality',
  'post-processing': 'post-processing',
  'attribute': 'characters',
  'composition': 'camera',
  'effect': 'effects',
};

/**
 * Assembles ordered fragments into final Prompt object.
 * 
 * @param orderedFragments - Positive and negative fragments (already ordered)
 * @param modelProfile - Model configuration for formatting and limits
 * @returns Prompt object
 */
export function assemblePrompt(
  orderedFragments: OrderedFragments,
  modelProfile: ModelProfile
): Prompt {
  // Build positive prompt string
  const positiveParts: string[] = [];
  for (const fragment of orderedFragments.positive) {
    if (fragment.weight !== null && modelProfile.weightSyntax === 'attention') {
      // Format as "(text:weight)" using attention syntax
      const formatted = `(${fragment.text}:${fragment.weight.toFixed(2)})`;
      positiveParts.push(formatted);
    } else {
      // Use fragment text as-is (no weight formatting)
      positiveParts.push(fragment.text);
    }
  }
  let positiveTokens = positiveParts.join(modelProfile.tokenSeparator);

  // Build sections object by grouping fragments by category
  const sectionsByCategory: Record<string, string[]> = {};
  
  for (const fragment of orderedFragments.positive) {
    const sectionKey = CATEGORY_TO_SECTION_MAP[fragment.category];
    if (sectionKey) {
      if (!sectionsByCategory[sectionKey]) {
        sectionsByCategory[sectionKey] = [];
      }
      
      // Format fragment text (same logic as positiveParts)
      let fragmentText = fragment.text;
      if (fragment.weight !== null && modelProfile.weightSyntax === 'attention') {
        fragmentText = `(${fragment.text}:${fragment.weight.toFixed(2)})`;
      }
      
      sectionsByCategory[sectionKey].push(fragmentText);
    } else {
      // Category not mapped - log warning and skip
      console.warn(`[assemblePrompt] Category "${fragment.category}" not mapped to section, fragment skipped: ${fragment.text}`);
    }
  }
  
  // Convert arrays to comma-separated strings
  const sections: NonNullable<Prompt['sections']> = {};
  for (const [sectionKey, fragmentTexts] of Object.entries(sectionsByCategory)) {
    if (fragmentTexts.length > 0) {
      sections[sectionKey as keyof typeof sections] = fragmentTexts.join(modelProfile.tokenSeparator);
    }
  }

  // Build negative prompt string
  let negativeTokens: string;
  if (orderedFragments.negative.length > 0) {
    const negativeParts = orderedFragments.negative.map(fragment => fragment.text);
    negativeTokens = negativeParts.join(modelProfile.tokenSeparator);
  } else if (modelProfile.defaultNegativePrompt) {
    negativeTokens = modelProfile.defaultNegativePrompt;
  } else {
    negativeTokens = '';
  }

  // Calculate approximate token count (simple word count)
  const tokenCount = positiveTokens.split(/\s+/).filter(word => word.length > 0).length;

  // Truncate if over limit (simple approach: remove from end)
  if (tokenCount > modelProfile.tokenLimit) {
    const parts = positiveTokens.split(modelProfile.tokenSeparator);
    let truncatedParts: string[] = [];
    let currentTokenCount = 0;

    // Add parts until we reach the limit
    for (const part of parts) {
      const partTokens = part.split(/\s+/).filter(word => word.length > 0).length;
      if (currentTokenCount + partTokens <= modelProfile.tokenLimit) {
        truncatedParts.push(part);
        currentTokenCount += partTokens;
      } else {
        break;
      }
    }

    positiveTokens = truncatedParts.join(modelProfile.tokenSeparator);
  }

  // Recalculate token count after truncation
  const finalTokenCount = positiveTokens.split(/\s+/).filter(word => word.length > 0).length;

  return {
    positiveTokens,
    negativeTokens,
    tokenCount: finalTokenCount,
    selectedAttributeIds: [],
    appliedModifiers: [],
    sections: Object.keys(sections).length > 0 ? sections : undefined,
  };
}

