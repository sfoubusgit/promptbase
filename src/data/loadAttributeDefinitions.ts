/**
 * Attribute Definitions Data Loader
 * 
 * Loads attribute definitions from external JSON files.
 */

import { AttributeDefinition } from '../types/entities';

/**
 * Category data structure from JSON files
 */
interface CategoryData {
  category: AttributeDefinition['category'];
  attributes: Array<Omit<AttributeDefinition, 'category'>>;
}

/**
 * Loads attribute definitions from JSON files.
 * 
 * Loads category JSON files and transforms them into AttributeDefinition[].
 * Each attribute gets the category from the wrapper object.
 */
export function loadAttributeDefinitions(): AttributeDefinition[] {
  const allDefinitions: AttributeDefinition[] = [];
  
  try {
    // Load category JSON files from src/data/*.json
    // @ts-ignore - Vite handles JSON imports
    const categoryFiles = import.meta.glob('/src/data/*.json', { eager: true });
    
    console.log(`[loadAttributeDefinitions] Found ${Object.keys(categoryFiles).length} JSON files`);
    console.log(`[loadAttributeDefinitions] Files:`, Object.keys(categoryFiles));
    
    Object.values(categoryFiles).forEach((module: any, index) => {
      try {
        const data = module.default ?? module;
        
        // Check if it's a category data structure
        if (data && typeof data === 'object' && 'category' in data && 'attributes' in data) {
          const categoryData = data as CategoryData;
          console.log(`[loadAttributeDefinitions] Loading category: ${categoryData.category} with ${categoryData.attributes.length} attributes`);
          
          // Transform attributes by adding category field
          const definitions: AttributeDefinition[] = categoryData.attributes.map(attr => ({
            ...attr,
            category: categoryData.category,
          }));
          
          // Validate each attribute has required fields
          const invalidAttributes = definitions.filter(def => 
            !def.id || !def.baseText || typeof def.semanticPriority !== 'number' || typeof def.isNegative !== 'boolean'
          );
          
          if (invalidAttributes.length > 0) {
            console.error(`[loadAttributeDefinitions] Category ${categoryData.category} has ${invalidAttributes.length} invalid attributes:`, invalidAttributes);
          }
          
          allDefinitions.push(...definitions);
          console.log(`[loadAttributeDefinitions] Added ${definitions.length} attributes for category: ${categoryData.category}`);
        } else {
          console.log(`[loadAttributeDefinitions] Skipping file ${index} - not a category data structure`);
        }
      } catch (error) {
        console.warn(`[loadAttributeDefinitions] Failed to process category file ${index}:`, error);
      }
    });
  } catch (error) {
    console.error('Failed to load attribute definitions:', error);
  }
  
  // Validation: Check for duplicate IDs
  const ids = allDefinitions.map(def => def.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    console.error(`[loadAttributeDefinitions] ⚠️ Found duplicate attribute IDs:`, [...new Set(duplicates)]);
    console.error(`[loadAttributeDefinitions] Each attribute ID must be unique across all categories`);
  }
  
  // Validation: Group by category and log summary
  const byCategory = allDefinitions.reduce((acc, def) => {
    acc[def.category] = (acc[def.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  console.log(`[loadAttributeDefinitions] Summary by category:`, byCategory);
  console.log(`[loadAttributeDefinitions] Total attributes loaded: ${allDefinitions.length}`);
  
  // Validation: Check for categories with 0 attributes (potential missing files)
  const categoriesWithData = Object.keys(byCategory);
  console.log(`[loadAttributeDefinitions] Categories with data:`, categoriesWithData);
  
  return allDefinitions;
}
