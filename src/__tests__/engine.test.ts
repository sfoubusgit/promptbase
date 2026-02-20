/**
 * Tests for the Minimal Viable Prompt Engine
 * 
 * Tests the public API (generatePrompt) end-to-end.
 */

import { generatePrompt, type EngineInput } from '../engine';
import { AttributeDefinition, AttributeSelection, Modifier, ModelProfile } from '../types';

describe('generatePrompt', () => {
  const defaultModelProfile: ModelProfile = {
    tokenLimit: 77,
    tokenSeparator: ', ',
    weightSyntax: 'attention',
    defaultNegativePrompt: 'deformed, low quality',
  };

  test('generates a simple positive prompt', () => {
    const attributeDefinitions: AttributeDefinition[] = [
      {
        id: 'character-female',
        baseText: 'female character',
        category: 'subject',
        semanticPriority: 1,
        isNegative: false,
        conflictsWith: [],
      },
    ];

    const selections: AttributeSelection[] = [
      {
        attributeId: 'character-female',
        isEnabled: true,
        customExtension: null,
      },
    ];

    const input: EngineInput = {
      attributeDefinitions,
      selections,
      modifiers: [],
      modelProfile: defaultModelProfile,
    };

    const result = generatePrompt(input);

    expect(result).not.toHaveProperty('type');
    if ('positiveTokens' in result) {
      expect(result.positiveTokens).toContain('female character');
      expect(result.tokenCount).toBeGreaterThan(0);
      // Negative should be default since no negative fragments
      expect(result.negativeTokens).toBe('deformed, low quality');
    }
  });

  test('applies weight modifier correctly', () => {
    const attributeDefinitions: AttributeDefinition[] = [
      {
        id: 'anime-style',
        baseText: 'anime style',
        category: 'style',
        semanticPriority: 3,
        isNegative: false,
        conflictsWith: [],
      },
    ];

    const selections: AttributeSelection[] = [
      {
        attributeId: 'anime-style',
        isEnabled: true,
        customExtension: null,
      },
    ];

    const modifiers: Modifier[] = [
      {
        targetAttributeId: 'anime-style',
        value: 1.5,
      },
    ];

    const input: EngineInput = {
      attributeDefinitions,
      selections,
      modifiers,
      modelProfile: defaultModelProfile,
    };

    const result = generatePrompt(input);

    expect(result).not.toHaveProperty('type');
    if ('positiveTokens' in result) {
      expect(result.positiveTokens).toContain('(anime style:1.50)');
    }
  });

  test('allows conflicting selections (conflicts are ignored)', () => {
    const attributeDefinitions: AttributeDefinition[] = [
      {
        id: 'character-male',
        baseText: 'male character',
        category: 'subject',
        semanticPriority: 1,
        isNegative: false,
        conflictsWith: ['character-female'],
      },
      {
        id: 'character-female',
        baseText: 'female character',
        category: 'subject',
        semanticPriority: 1,
        isNegative: false,
        conflictsWith: ['character-male'],
      },
    ];

    const selections: AttributeSelection[] = [
      {
        attributeId: 'character-male',
        isEnabled: true,
        customExtension: null,
      },
      {
        attributeId: 'character-female',
        isEnabled: true,
        customExtension: null,
      },
    ];

    const input: EngineInput = {
      attributeDefinitions,
      selections,
      modifiers: [],
      modelProfile: defaultModelProfile,
    };

    const result = generatePrompt(input);

    // Conflicts are now ignored - both attributes should appear in the prompt
    expect(result).not.toHaveProperty('type');
    if ('positiveTokens' in result) {
      expect(result.positiveTokens).toContain('male character');
      expect(result.positiveTokens).toContain('female character');
    }
  });

  test('separates negative prompt correctly', () => {
    const attributeDefinitions: AttributeDefinition[] = [
      {
        id: 'character-female',
        baseText: 'female character',
        category: 'subject',
        semanticPriority: 1,
        isNegative: false,
        conflictsWith: [],
      },
      {
        id: 'bad-anatomy',
        baseText: 'bad anatomy',
        category: 'quality',
        semanticPriority: 6,
        isNegative: true,
        conflictsWith: [],
      },
    ];

    const selections: AttributeSelection[] = [
      {
        attributeId: 'character-female',
        isEnabled: true,
        customExtension: null,
      },
      {
        attributeId: 'bad-anatomy',
        isEnabled: true,
        customExtension: null,
      },
    ];

    const input: EngineInput = {
      attributeDefinitions,
      selections,
      modifiers: [],
      modelProfile: defaultModelProfile,
    };

    const result = generatePrompt(input);

    expect(result).not.toHaveProperty('type');
    if ('positiveTokens' in result) {
      expect(result.positiveTokens).toContain('female character');
      expect(result.negativeTokens).toContain('bad anatomy');
      expect(result.positiveTokens).not.toContain('bad anatomy');
      expect(result.negativeTokens).not.toContain('female character');
    }
  });
});

