/**
 * Core entity types for the Minimal Viable Prompt Engine
 * 
 * These types represent the domain model entities required for
 * generating Stable Diffusion prompts from attribute selections.
 */

/**
 * Represents a selectable attribute that can contribute to a prompt.
 * This is the definition/schema, not a user's selection.
 */
export interface AttributeDefinition {
  /** Unique identifier for this attribute */
  id: string;
  
  /** The base text/token this attribute contributes to the prompt */
  baseText: string;
  
  /** Semantic category for ordering purposes */
  category: 'subject' | 'attribute' | 'style' | 'composition' | 'effect' | 'effects' | 'quality' | 'lighting' | 'camera' | 'environment' | 'post-processing' | 'actions' | 'anatomy-details';
  
  /** Priority for ordering (1 = highest, 6 = lowest) */
  semanticPriority: number;
  
  /** Whether this attribute contributes to negative prompt */
  isNegative: boolean;
  
  /** Array of attribute IDs that conflict with this one */
  conflictsWith: string[];
}

/**
 * Represents a user's selection of an attribute.
 * This is the runtime selection, not the definition.
 */
export interface AttributeSelection {
  /** ID of the AttributeDefinition being selected */
  attributeId: string;
  
  /** Whether this selection is currently enabled */
  isEnabled: boolean;
  
  /** Optional custom text extension added by user */
  customExtension: string | null;
}

/**
 * Represents a weight/intensity modifier applied to an attribute.
 */
export interface Modifier {
  /** ID of the AttributeSelection this modifier targets */
  targetAttributeId: string;
  
  /** Weight value (typically 0.0 to 2.0) */
  value: number;
}

/**
 * Represents a single token/fragment in the final prompt.
 * Generated from AttributeSelections and Modifiers.
 */
export interface PromptFragment {
  /** The actual text/token for this fragment */
  text: string;
  
  /** Semantic category for ordering */
  category: 'subject' | 'attribute' | 'style' | 'composition' | 'effect' | 'effects' | 'quality' | 'lighting' | 'camera' | 'environment' | 'post-processing' | 'actions' | 'anatomy-details';
  
  /** Priority for ordering (1 = highest, 6 = lowest) */
  semanticPriority: number;
  
  /** Optional weight value (null if unweighted) */
  weight: number | null;
  
  /** Whether this fragment belongs to negative prompt */
  isNegative: boolean;
  
  /** ID of the AttributeDefinition that generated this fragment */
  sourceAttributeId: string;
}

/**
 * Configuration for the target Stable Diffusion model.
 * Determines formatting, limits, and syntax rules.
 */
export interface ModelProfile {
  /** Maximum token limit for the prompt */
  tokenLimit: number;
  
  /** String used to separate tokens (typically ", ") */
  tokenSeparator: string;
  
  /** Weight syntax format (currently only "attention" supported) */
  weightSyntax: 'attention';
  
  /** Default negative prompt if no negative fragments exist */
  defaultNegativePrompt: string | null;
}

/**
 * The final assembled prompt ready for Stable Diffusion.
 */
export interface Prompt {
  /** The positive prompt string */
  positiveTokens: string;
  
  /** The negative prompt string */
  negativeTokens: string;
  
  /** Approximate token count (word count estimation) */
  tokenCount: number;
  
  /** List of attribute IDs that were selected */
  selectedAttributeIds: string[];
  
  /** List of modifiers that were applied */
  appliedModifiers: Modifier[];
  
  /** Sections object for display purposes (optional, display-only) */
  sections?: {
    scene?: string;
    characters?: string;
    actions?: string;
    style?: string;
    lighting?: string;
    camera?: string;
    effects?: string;
    quality?: string;
    'post-processing'?: string;
  };
}

