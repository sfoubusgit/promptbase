/**
 * Simple Data Migration Script
 * 
 * This script can be run in the browser console or as a build step.
 * It reads the old JSON files and outputs a flat attributes.json file.
 * 
 * To use:
 * 1. Copy this file's contents
 * 2. Run in browser console after loading the old data
 * 3. Copy the output JSON
 * 4. Save as src/data/attributes.json
 */

import { AttributeDefinition } from '../types/entities';

interface OldJsonAnswer {
  id: string;
  label: string;
  next?: string;
}

interface OldJsonNode {
  id: string;
  question: string;
  answers?: OldJsonAnswer[];
}

/**
 * Migrates data from old format to new format
 * Call this with the old JSON data loaded
 */
export function migrateData(oldDataFiles: Record<string, any>): AttributeDefinition[] {
  const definitions: AttributeDefinition[] = [];
  const seenIds = new Set<string>();
  
  // Process all JSON files
  Object.values(oldDataFiles).forEach((module: any) => {
    const data = module.default ?? module;
    const nodes: OldJsonNode[] = Array.isArray(data) ? data : [data];
    
    nodes.forEach((node) => {
      if (node.answers && Array.isArray(node.answers)) {
        node.answers.forEach((answer: OldJsonAnswer) => {
          if (shouldSkipAnswer(answer.id, answer.label) || seenIds.has(answer.id)) {
            return;
          }
          seenIds.add(answer.id);
          
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
  
  // Sort by category and priority
  definitions.sort((a, b) => {
    if (a.category !== b.category) {
      const categoryOrder = ['subject', 'attribute', 'style', 'composition', 'effect', 'quality'];
      return categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    }
    return a.semanticPriority - b.semanticPriority;
  });
  
  return definitions;
}

function normalizeBaseText(label: string): string {
  let text = label.toLowerCase().trim();
  text = text.replace(/^(what|how|which|where|when)\s+/i, '');
  text = text.replace(/\s+/g, ' ');
  return text;
}

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

function shouldSkipAnswer(id: string, label: string): boolean {
  const skipPatterns = ['skip', 'next', 'back', 'root', 'none', 'no specific', 'not specified'];
  const lowerLabel = label.toLowerCase();
  const lowerId = id.toLowerCase();
  return skipPatterns.some(pattern => lowerLabel.includes(pattern) || lowerId.includes(pattern));
}

function isNegativeAttribute(id: string, label: string): boolean {
  const context = `${id} ${label}`.toLowerCase();
  return context.includes('negative') || context.includes('no ') || context.includes('without') || context.includes('avoid');
}

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
  
  // Length conflicts
  if (lowerId.includes('long')) {
    const short = allAnswers.find(a => a.id.toLowerCase().includes('short'));
    if (short) conflicts.push(short.id);
  }
  if (lowerId.includes('short')) {
    const long = allAnswers.find(a => a.id.toLowerCase().includes('long'));
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
  
  return conflicts;
}

