/**
 * Comprehensive Data Migration from Old Generator
 * 
 * This script migrates all data from PCV1_final to the new engine format.
 * 
 * Migration Strategy:
 * 1. Load all old JSON files
 * 2. Extract answers as AttributeDefinitions
 * 3. Expand abstract answers during migration (one-time, not runtime)
 * 4. Infer categories, priorities, conflicts
 * 5. Generate clean baseText
 * 6. Create question nodes for navigation
 */

import { AttributeDefinition } from '../types/entities';
import { QuestionNode } from './loadQuestionNodes';

interface OldAnswer {
  id: string;
  label: string;
  next?: string;
}

interface OldWeight {
  id: string;
  label: string;
  template: string;
  min?: number;
  max?: number;
  step?: number;
  default?: number;
  tags?: string[];
}

interface OldNode {
  id: string;
  question: string;
  description?: string;
  answers?: OldAnswer[];
  weights?: OldWeight[];
  allowCustomExtension?: string[];
}

/**
 * Abstract answers that need expansion
 */
const ABSTRACT_ANSWERS = new Set([
  "subtle", "moderate", "pronounced", "strong", "focused",
  "natural", "intense", "slight", "minimal", "extreme",
  "soft", "hard"
]);

/**
 * Expand abstract answer based on question context
 * This is a ONE-TIME expansion during migration, not runtime
 */
function expandAbstractAnswer(answer: string, question: string, nodeId: string): string {
  const a = answer.toLowerCase().trim();
  const q = question.toLowerCase();
  const n = nodeId.toLowerCase();

  // Expression intensity
  if (n.includes('expression') && (a === 'subtle' || a === 'moderate' || a === 'pronounced')) {
    return `${a} emotional expression`;
  }

  // Body build
  if (n.includes('build') && (a === 'slim' || a === 'athletic' || a === 'muscular' || a === 'stocky')) {
    return `${a} body type`;
  }

  // Height
  if (n.includes('height') && (a.includes('short') || a.includes('tall'))) {
    return `${a} height`;
  }

  // Hair texture intensity
  if (n.includes('hair') && (a === 'wavy' || a === 'curly' || a === 'coily')) {
    return `${a} hair texture`;
  }

  // Style intensity
  if (n.includes('style') && (a === 'subtle' || a === 'moderate' || a === 'pronounced')) {
    return `${a} stylistic effect`;
  }

  // Lighting intensity
  if (n.includes('light') && (a === 'subtle' || a === 'moderate' || a === 'pronounced')) {
    return `${a} lighting effect`;
  }

  // Color saturation
  if (q.includes('saturated') && (a === 'subtle' || a === 'moderate' || a === 'pronounced')) {
    return `${a} color saturation`;
  }

  // Material emphasis
  if (q.includes('material') && (a === 'subtle' || a === 'moderate' || a === 'pronounced')) {
    return `${a} material emphasis`;
  }

  // Default: return original if not abstract, or add context
  if (!ABSTRACT_ANSWERS.has(a)) {
    return answer; // Not abstract, return as-is
  }

  // Generic abstract expansion
  return `${a} visual effect`;
}

/**
 * Infer category from node ID and question
 */
function inferCategory(nodeId: string, question: string): AttributeDefinition['category'] {
  const context = `${nodeId} ${question}`.toLowerCase();

  // Subject: character identity, archetype, race
  if (context.includes('character') && (context.includes('identity') || context.includes('archetype') || context.includes('race'))) {
    return 'subject';
  }

  // Style: art styles, painting styles, anime
  if (context.includes('style') || context.includes('artstyle') || context.includes('anime') || 
      context.includes('realistic') || context.includes('painting') || context.includes('3d') ||
      context.includes('cinematic') || context.includes('color palette')) {
    return 'style';
  }

  // Effect: lighting effects, particles, magic, atmosphere
  if (context.includes('effect') || context.includes('lighting') || context.includes('atmosphere') ||
      context.includes('particle') || context.includes('magic') || context.includes('fog') ||
      context.includes('haze') || context.includes('spark')) {
    return 'effect';
  }

  // Composition: environment, scene, background
  if (context.includes('environment') || context.includes('scene') || context.includes('setting') ||
      context.includes('background') || context.includes('city') || context.includes('nature') ||
      context.includes('interior') || context.includes('fantasy realm') || context.includes('scifi world')) {
    return 'composition';
  }

  // Quality: camera, render, resolution, depth of field
  if (context.includes('camera') || context.includes('render') || context.includes('resolution') ||
      context.includes('depth of field') || context.includes('lens') || context.includes('framing') ||
      context.includes('angle') || context.includes('perspective')) {
    return 'quality';
  }

  // Attribute: everything else (hair, face, clothing, body, pose, expression)
  return 'attribute';
}

/**
 * Infer semantic priority from category and context
 */
function inferPriority(category: AttributeDefinition['category'], nodeId: string): number {
  // Priority order: subject (1) < attribute (2) < style (3) < effect (4) < composition (5) < quality (6)
  const categoryPriority: Record<AttributeDefinition['category'], number> = {
    subject: 1,
    attribute: 2,
    style: 3,
    effect: 4,
    composition: 5,
    quality: 6,
  };

  return categoryPriority[category] || 2;
}

/**
 * Infer conflicts from answer group
 */
function inferConflicts(answerId: string, allAnswers: OldAnswer[], nodeId: string): string[] {
  const conflicts: string[] = [];
  const lowerId = answerId.toLowerCase();
  const lowerNode = nodeId.toLowerCase();

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

  // Style conflicts: anime vs realistic
  if (lowerId.includes('anime') || lowerId.includes('cartoon') || lowerId.includes('stylized')) {
    const realistic = allAnswers.find(a => 
      a.id.toLowerCase().includes('realistic') || 
      a.id.toLowerCase().includes('photorealistic')
    );
    if (realistic) conflicts.push(realistic.id);
  }

  if (lowerId.includes('realistic') || lowerId.includes('photorealistic')) {
    const anime = allAnswers.find(a => 
      a.id.toLowerCase().includes('anime') || 
      a.id.toLowerCase().includes('cartoon')
    );
    if (anime) conflicts.push(anime.id);
  }

  // Length conflicts (hair, clothing)
  if (lowerId.includes('long') && !lowerId.includes('very_long')) {
    const short = allAnswers.find(a => a.id.toLowerCase().includes('short'));
    if (short) conflicts.push(short.id);
  }
  if (lowerId.includes('short')) {
    const long = allAnswers.find(a => a.id.toLowerCase().includes('long') && !a.id.toLowerCase().includes('very_long'));
    if (long) conflicts.push(long.id);
  }

  // Day/night conflicts
  if (lowerId.includes('day') || lowerId.includes('daytime')) {
    const night = allAnswers.find(a => a.id.toLowerCase().includes('night'));
    if (night) conflicts.push(night.id);
  }
  if (lowerId.includes('night')) {
    const day = allAnswers.find(a => a.id.toLowerCase().includes('day') || a.id.toLowerCase().includes('daytime'));
    if (day) conflicts.push(day.id);
  }

  // All answers in same node conflict (mutual exclusivity)
  // Only for non-navigation nodes
  if (!lowerNode.includes('root') && !lowerNode.includes('skip')) {
    allAnswers.forEach(other => {
      if (other.id !== answerId && !conflicts.includes(other.id)) {
        conflicts.push(other.id);
      }
    });
  }

  return conflicts;
}

/**
 * Check if answer should be skipped
 * 
 * Only skip answers that are PURELY navigation (like "Skip X" buttons).
 * Do NOT skip valid content answers like "none", "unspecified", etc.
 */
function shouldSkipAnswer(id: string, label: string, nodeId: string): boolean {
  const lowerLabel = label.toLowerCase().trim();
  const lowerId = id.toLowerCase().trim();

  // ONLY skip if it's explicitly a "skip" navigation button
  // Examples: "Skip pose details", "Skip clothing", "Skip accessories"
  if (lowerLabel.startsWith('skip ') || lowerId.startsWith('skip_')) {
    return true;
  }

  // Do NOT skip these - they are valid content options:
  // - "none" (valid choice)
  // - "unspecified" (valid choice)
  // - "no specific X" (valid choice)
  // - "back", "next" (if they have actual content, keep them)
  
  return false; // Don't skip anything else
}

/**
 * Check if attribute is negative
 */
function isNegativeAttribute(id: string, label: string): boolean {
  const context = `${id} ${label}`.toLowerCase();
  return context.includes('negative') || 
         context.includes('no ') || 
         context.includes('without') || 
         context.includes('avoid') ||
         context.includes('deformed') ||
         context.includes('distorted');
}

/**
 * Normalize base text (clean up label)
 */
function normalizeBaseText(label: string, question: string, nodeId: string): string {
  let text = label.trim();

  // Remove leading articles
  text = text.replace(/^(a |an |the )/i, '');

  // Expand abstract answers
  if (ABSTRACT_ANSWERS.has(text.toLowerCase())) {
    text = expandAbstractAnswer(text, question, nodeId);
  }

  // Ensure proper casing
  text = text.charAt(0).toUpperCase() + text.slice(1);

  return text;
}

/**
 * Main migration function
 */
export function migrateAllOldData(oldDataFiles: Record<string, any>): {
  attributeDefinitions: AttributeDefinition[];
  questionNodes: QuestionNode[];
} {
  const attributeDefinitions: AttributeDefinition[] = [];
  const questionNodes: QuestionNode[] = [];
  const seenAttributeIds = new Set<string>();
  const nodeMap = new Map<string, OldNode>();

  try {
    console.log(`[Migration] Processing ${Object.keys(oldDataFiles).length} data files...`);
    // First pass: collect all nodes
    Object.values(oldDataFiles).forEach((module: any, index) => {
      try {
        const data = module.default ?? module;
        const nodes: OldNode[] = Array.isArray(data) ? data : [data];
        
        nodes.forEach((node) => {
          if (node && node.id) {
            nodeMap.set(node.id, node);
          }
        });
      } catch (err) {
        console.warn(`[Migration] Error processing module ${index}:`, err);
      }
    });
    
    console.log(`[Migration] Collected ${nodeMap.size} nodes from old data`);

  // Second pass: create attribute definitions and question nodes
  let totalAnswersProcessed = 0;
  let totalAnswersSkipped = 0;
  
  nodeMap.forEach((node, nodeId) => {
    try {
      // Create question node
      const questionNode: QuestionNode = {
        id: nodeId,
        question: node.question || 'Question',
        description: node.description,
        attributeIds: [],
        allowCustomExtension: node.allowCustomExtension || [],
      };

      // Track next node from answers (use first non-skip answer's next)
      let nextNodeId: string | undefined = undefined;

      // Process answers
      if (node.answers && Array.isArray(node.answers)) {
        node.answers.forEach((answer: OldAnswer) => {
          totalAnswersProcessed++;
          
          // Skip navigation-only answers
          if (shouldSkipAnswer(answer.id, answer.label, nodeId)) {
            totalAnswersSkipped++;
            // But capture next node from skip answers
            if (answer.next && !nextNodeId) {
              nextNodeId = answer.next;
            }
            return;
          }

          // Create unique attribute ID (nodeId-answerId)
          const attributeId = `${nodeId}-${answer.id}`;
          
          if (seenAttributeIds.has(attributeId)) {
            console.warn(`[Migration] Duplicate attribute ID skipped: ${attributeId}`);
            return; // Skip duplicates
          }
          seenAttributeIds.add(attributeId);

          // Infer properties
          const category = inferCategory(nodeId, node.question);
          const priority = inferPriority(category, nodeId);
          const baseText = normalizeBaseText(answer.label, node.question, nodeId);
          const conflicts = inferConflicts(answer.id, node.answers, nodeId);
          const isNegative = isNegativeAttribute(answer.id, answer.label);

          // Create attribute definition
          attributeDefinitions.push({
            id: attributeId,
            baseText,
            category,
            semanticPriority: priority,
            isNegative,
            conflictsWith: conflicts.map(c => `${nodeId}-${c}`),
          });

          // Add to question node
          questionNode.attributeIds.push(attributeId);

          // Set next node if answer has one (use first answer's next)
          if (answer.next && !nextNodeId) {
            nextNodeId = answer.next;
          }
        });
      } else {
        console.warn(`[Migration] Node ${nodeId} has no answers array`);
      }

      // Set next node if found
      if (nextNodeId) {
        questionNode.nextNodeId = nextNodeId;
      }

      questionNodes.push(questionNode);
    } catch (err) {
      console.error(`[Migration] Error processing node ${nodeId}:`, err);
      // Continue with other nodes
    }
  });
  
  console.log(`[Migration] Processed ${totalAnswersProcessed} total answers`);
  console.log(`[Migration] Skipped ${totalAnswersSkipped} navigation/skip answers`);
  console.log(`[Migration] Created ${attributeDefinitions.length} attribute definitions`);
  } catch (error) {
    console.error('[Migration] Error during migration:', error);
    // Return empty arrays on error - app will use demo data
  }

  // Final verification and reporting
  const categoryCounts: Record<string, number> = {};
  attributeDefinitions.forEach(attr => {
    categoryCounts[attr.category] = (categoryCounts[attr.category] || 0) + 1;
  });
  
  console.log(`[Migration] ========================================`);
  console.log(`[Migration] FINAL MIGRATION RESULTS:`);
  console.log(`[Migration] Total attribute definitions: ${attributeDefinitions.length}`);
  console.log(`[Migration] Total question nodes: ${questionNodes.length}`);
  console.log(`[Migration] Category breakdown:`);
  Object.entries(categoryCounts).forEach(([cat, count]) => {
    console.log(`[Migration]   ${cat}: ${count} attributes`);
  });
  console.log(`[Migration] ========================================`);
  
  return {
    attributeDefinitions,
    questionNodes,
  };
}

