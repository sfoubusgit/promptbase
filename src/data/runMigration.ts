/**
 * Migration Runner
 * 
 * This script loads old data and generates migrated attribute definitions.
 * Run this once to generate the migrated data files.
 * 
 * Usage:
 * 1. Import this in a build script or run in Node.js
 * 2. Output will be written to src/data/attributes.migrated.json
 * 3. Review and commit the migrated data
 */

import { migrateAllOldData } from './migrateFromOld';
import { AttributeDefinition } from '../types/entities';
import { QuestionNode } from '../types/interview';

/**
 * Load old data from PCV1_final directory
 * This uses Vite's import.meta.glob to load all JSON files
 */
async function loadOldData(): Promise<Record<string, any>> {
  // Try to load from old location
  const oldDataFiles = import.meta.glob('../../PCV1_final/src/data/interview/**/*.json', { eager: true });
  
  if (Object.keys(oldDataFiles).length === 0) {
    console.warn('No old data files found. Make sure PCV1_final directory exists.');
    return {};
  }

  return oldDataFiles;
}

/**
 * Run migration and return results
 */
export async function runMigration(): Promise<{
  attributeDefinitions: AttributeDefinition[];
  questionNodes: QuestionNode[];
}> {
  const oldDataFiles = await loadOldData();
  
  if (Object.keys(oldDataFiles).length === 0) {
    console.warn('No data to migrate. Returning empty arrays.');
    return {
      attributeDefinitions: [],
      questionNodes: [],
    };
  }

  const result = migrateAllOldData(oldDataFiles);
  
  console.log(`Migrated ${result.attributeDefinitions.length} attribute definitions`);
  console.log(`Migrated ${result.questionNodes.length} question nodes`);
  
  return result;
}

/**
 * Generate JSON output for migrated data
 */
export function generateMigratedJson(
  attributeDefinitions: AttributeDefinition[],
  questionNodes: QuestionNode[]
): string {
  return JSON.stringify({
    attributeDefinitions,
    questionNodes,
    migratedAt: new Date().toISOString(),
    migrationVersion: '1.0.0',
  }, null, 2);
}

