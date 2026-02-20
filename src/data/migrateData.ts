/**
 * One-Time Data Migration Script
 * 
 * Converts old interview JSON structure to new flat AttributeDefinition format.
 * 
 * Run this once to generate src/data/attributes.json
 * Then update loadAttributeDefinitions.ts to use the flat format.
 * 
 * Usage (in Node.js or as a build script):
 *   node -r ts-node/register src/data/migrateData.ts
 */

import { AttributeDefinition } from '../types/entities';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Import all JSON files from old structure
// In a real migration, you'd read from PCV1_final/src/data/interview/
const oldDataFiles = import.meta.glob('/PCV1_final/src/data/interview/**/*.json', { eager: true });

interface OldJsonAnswer {
  id: string;
  label: string;
  next?: string;
}

interface OldWeightAttribute {
  id: string;
  label: string;
  template: string;
  min: number;
  max: number;
  step: number;
  default: number;
  tags?: string[];
}

interface OldJsonNode {
  id: string;
  question: string;
  answers?: OldJsonAnswer[];
  weights?: OldWeightAttribute[];
}

/**
 * Migration function that extracts all data
 */
export function migrateAllData(): AttributeDefinition[] {
  const definitions: AttributeDefinition[] = [];
  const seenIds = new Set<string>();
  
  // Process all JSON files
  Object.values(oldDataFiles).forEach((module: any) => {
    const data = module.default ?? module;
    const nodes: OldJsonNode[] = Array.isArray(data) ? data : [data];
    
    nodes.forEach((node) => {
      // Extract answers as attributes
      if (node.answers && Array.isArray(node.answers)) {
        node.answers.forEach((answer: OldJsonAnswer) => {
          // Skip navigation-only answers
          if (shouldSkipAnswer(answer.id, answer.label)) {
            return;
          }
          
          // Avoid duplicates
          if (seenIds.has(answer.id)) {
            return;
          }
          seenIds.add(answer.id);
          
          // Create attribute definition
          definitions.push({
            id: answer.id,
            baseText: normalizeBaseText(answer.label),
            category: inferCategory(node.id, answer.id, node.question),
            semanticPriority: inferPriority(node.id, answer.id),
            isNegative: isNegativeAttribute(answer.id, answer.label),
            conflictsWith: inferConflicts(answer.id, node.answers, node.id),
          });
        });
      }
    });
  });
  
  return definitions;
}

/**
 * Normalizes answer labels into prompt-ready base text
 */
function normalizeBaseText(label: string): string {
  let text = label.toLowerCase().trim();
  
  // Remove question-like prefixes
  text = text.replace(/^(what|how|which|where|when)\s+/i, '');
  
  // Clean up common patterns
  text = text.replace(/\s+/g, ' ');
  
  return text;
}

/**
 * Infers category from context
 */
function inferCategory(nodeId: string, answerId: string, question: string): AttributeDefinition['category'] {
  const context = `${nodeId} ${answerId} ${question}`.toLowerCase();
  
  if (context.includes('style') || context.includes('artstyle') || context.includes('anime') || context.includes('realistic') || context.includes('painting') || context.includes('3d')) {
    return 'style';
  }
  if (context.includes('character') || context.includes('subject') || context.includes('person') || context.includes('identity')) {
    return 'subject';
  }
  if (context.includes('environment') || context.includes('scene') || context.includes('setting') || context.includes('background') || context.includes('city') || context.includes('nature')) {
    return 'composition';
  }
  if (context.includes('effect') || context.includes('lighting') || context.includes('atmosphere') || context.includes('particle') || context.includes('magic') || context.includes('fog')) {
    return 'effect';
  }
  if (context.includes('quality') || context.includes('resolution') || context.includes('render') || context.includes('camera')) {
    return 'quality';
  }
  
  return 'attribute';
}

/**
 * Infers semantic priority
 */
function inferPriority(nodeId: string, answerId: string): number {
  const context = `${nodeId} ${answerId}`.toLowerCase();
  
  if (context.includes('character') || context.includes('subject') || context.includes('person') || context.includes('identity')) {
    return 1;
  }
  if (context.includes('hair') || context.includes('clothing') || context.includes('accessory') || context.includes('pose') || context.includes('expression') || context.includes('face') || context.includes('body')) {
    return 2;
  }
  if (context.includes('style') || context.includes('artstyle')) {
    return 3;
  }
  if (context.includes('effect') || context.includes('lighting') || context.includes('atmosphere') || context.includes('particle')) {
    return 4;
  }
  if (context.includes('environment') || context.includes('scene') || context.includes('background') || context.includes('camera') || context.includes('angle') || context.includes('framing')) {
    return 5;
  }
  if (context.includes('quality') || context.includes('resolution')) {
    return 6;
  }
  
  return 2;
}

/**
 * Determines if answer should be skipped
 */
function shouldSkipAnswer(id: string, label: string): boolean {
  const skipPatterns = [
    'skip',
    'next',
    'back',
    'root',
    'none',
    'no specific',
    'not specified',
  ];
  
  const lowerLabel = label.toLowerCase();
  const lowerId = id.toLowerCase();
  
  return skipPatterns.some(pattern => 
    lowerLabel.includes(pattern) || lowerId.includes(pattern)
  );
}

/**
 * Determines if attribute is negative
 */
function isNegativeAttribute(id: string, label: string): boolean {
  const context = `${id} ${label}`.toLowerCase();
  
  return context.includes('negative') || 
         context.includes('no ') || 
         context.includes('without') ||
         context.includes('avoid');
}

/**
 * Infers conflicts intelligently
 */
function inferConflicts(answerId: string, allAnswers: OldJsonAnswer[], nodeId: string): string[] {
  const conflicts: string[] = [];
  const lowerId = answerId.toLowerCase();
  
  // Gender conflicts
  if (lowerId.includes('male') || lowerId.includes('man')) {
    const female = allAnswers.find(a => 
      a.id.toLowerCase().includes('female') || 
      a.id.toLowerCase().includes('woman') ||
      a.label.toLowerCase().includes('female') ||
      a.label.toLowerCase().includes('woman')
    );
    if (female) conflicts.push(female.id);
  }
  
  if (lowerId.includes('female') || lowerId.includes('woman')) {
    const male = allAnswers.find(a => 
      a.id.toLowerCase().includes('male') || 
      a.id.toLowerCase().includes('man') ||
      a.label.toLowerCase().includes('male') ||
      a.label.toLowerCase().includes('man')
    );
    if (male) conflicts.push(male.id);
  }
  
  // Style conflicts
  const styleConflicts = [
    ['anime', 'realistic', 'photorealistic'],
    ['cartoon', 'realistic'],
    ['stylized', 'photorealistic'],
    ['3d', '2d'],
    ['painting', 'photorealistic'],
  ];
  
  for (const [style1, style2, style3] of styleConflicts) {
    if (lowerId.includes(style1)) {
      const conflict = allAnswers.find(a => {
        const lower = a.id.toLowerCase();
        return lower.includes(style2) || (style3 && lower.includes(style3));
      });
      if (conflict) conflicts.push(conflict.id);
    }
    if (lowerId.includes(style2) || (style3 && lowerId.includes(style3))) {
      const conflict = allAnswers.find(a => a.id.toLowerCase().includes(style1));
      if (conflict) conflicts.push(conflict.id);
    }
  }
  
  // Length conflicts (hair, etc.)
  if (lowerId.includes('long')) {
    const short = allAnswers.find(a => a.id.toLowerCase().includes('short'));
    if (short) conflicts.push(short.id);
  }
  if (lowerId.includes('short')) {
    const long = allAnswers.find(a => a.id.toLowerCase().includes('long'));
    if (long) conflicts.push(long.id);
  }
  
  // Day/night conflicts
  if (lowerId.includes('day') || lowerId.includes('daytime') || lowerId.includes('sunny')) {
    const night = allAnswers.find(a => 
      a.id.toLowerCase().includes('night') || 
      a.id.toLowerCase().includes('nighttime')
    );
    if (night) conflicts.push(night.id);
  }
  if (lowerId.includes('night') || lowerId.includes('nighttime')) {
    const day = allAnswers.find(a => 
      a.id.toLowerCase().includes('day') || 
      a.id.toLowerCase().includes('daytime')
    );
    if (day) conflicts.push(day.id);
  }
  
  return conflicts;
}

/**
 * Export function to generate the flat JSON file
 */
export function generateAttributesFile() {
  const definitions = migrateAllData();
  
  // Sort by category and priority for readability
  definitions.sort((a, b) => {
    if (a.category !== b.category) {
      const categoryOrder = ['subject', 'attribute', 'style', 'composition', 'effect', 'quality'];
      return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    }
    return a.semanticPriority - b.semanticPriority;
  });
  
  // Write to file
  const outputPath = join(process.cwd(), 'src/data/attributes.json');
  writeFileSync(outputPath, JSON.stringify(definitions, null, 2), 'utf-8');
  
  console.log(`✅ Generated ${definitions.length} attribute definitions`);
  console.log(`📁 Saved to: ${outputPath}`);
  
  return definitions;
}

