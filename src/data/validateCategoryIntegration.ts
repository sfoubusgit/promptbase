/**
 * Category Integration Validator
 * 
 * Comprehensive validation to ensure categories are fully integrated.
 * This prevents the "questions not appearing" issue by checking all requirements.
 */

import { AttributeDefinition } from '../types/entities';
import { QuestionNode } from './loadQuestionNodes';
import { CATEGORY_MAP } from './categoryMap';

export interface CategoryValidationResult {
  categoryId: string;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates that a category is fully integrated into the system.
 * 
 * Checks:
 * 1. Category exists in CATEGORY_MAP
 * 2. Category has a question node file
 * 3. Question node exists and matches CATEGORY_MAP nodeId
 * 4. All attributes in question node exist in attribute definitions
 * 5. All attributes in category data file are referenced in question node
 * 6. Category is in CATEGORY_ORDER (if provided)
 */
export function validateCategoryIntegration(
  categoryId: string,
  attributeDefinitions: AttributeDefinition[],
  questionNodes: QuestionNode[],
  categoryOrder?: string[]
): CategoryValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check if category exists in CATEGORY_MAP
  const categoryMapEntry = CATEGORY_MAP[categoryId];
  if (!categoryMapEntry || categoryMapEntry.length === 0) {
    errors.push(`Category "${categoryId}" is NOT in CATEGORY_MAP`);
    errors.push(`SOLUTION: Add "${categoryId}" to src/data/categoryMap.ts`);
    return { categoryId, isValid: false, errors, warnings };
  }

  const expectedNodeId = categoryMapEntry[0]?.nodeId;
  if (!expectedNodeId) {
    errors.push(`Category "${categoryId}" in CATEGORY_MAP has no nodeId`);
    return { categoryId, isValid: false, errors, warnings };
  }

  // 2. Check if question node exists
  const questionNode = questionNodes.find(n => n.id === expectedNodeId);
  if (!questionNode) {
    errors.push(`Question node "${expectedNodeId}" NOT FOUND in loaded question nodes`);
    errors.push(`SOLUTION: Create src/data/questions/${categoryId}.json with id="${expectedNodeId}"`);
    errors.push(`Expected file: src/data/questions/${categoryId}.json`);
    errors.push(`Expected node ID: ${expectedNodeId}`);
    return { categoryId, isValid: false, errors, warnings };
  }

  // 3. Check if category has attributes
  const categoryAttributes = attributeDefinitions.filter(def => def.category === categoryId);
  if (categoryAttributes.length === 0) {
    errors.push(`Category "${categoryId}" has 0 attributes loaded`);
    errors.push(`SOLUTION: Create src/data/${categoryId}.json with attribute definitions`);
    return { categoryId, isValid: false, errors, warnings };
  }

  // 4. Check if all question node attributeIds exist in attribute definitions
  const missingAttributeIds: string[] = [];
  questionNode.attributeIds.forEach(attrId => {
    const attrDef = attributeDefinitions.find(def => def.id === attrId);
    if (!attrDef) {
      missingAttributeIds.push(attrId);
    }
  });

  if (missingAttributeIds.length > 0) {
    errors.push(`Question node "${expectedNodeId}" references ${missingAttributeIds.length} missing attributes:`);
    errors.push(`Missing: ${missingAttributeIds.join(', ')}`);
    errors.push(`SOLUTION: Ensure all attribute IDs in question node exist in src/data/${categoryId}.json`);
  }

  // 5. Check if all category attributes are referenced in question node
  const unreferencedAttributes = categoryAttributes.filter(
    attr => !questionNode.attributeIds.includes(attr.id)
  );

  if (unreferencedAttributes.length > 0) {
    warnings.push(`${unreferencedAttributes.length} attributes in category are NOT referenced in question node`);
    warnings.push(`Unreferenced: ${unreferencedAttributes.map(a => a.id).join(', ')}`);
    warnings.push(`These attributes won't be selectable in the UI`);
  }

  // 6. Check if category is in CATEGORY_ORDER (if provided)
  if (categoryOrder && !categoryOrder.includes(categoryId)) {
    warnings.push(`Category "${categoryId}" is NOT in CATEGORY_ORDER`);
    warnings.push(`SOLUTION: Add "${categoryId}" to CATEGORY_ORDER array in src/ui/App.tsx`);
  }

  // 7. Check if category type is in entities.ts
  // This is a type-level check, so we can't verify it here, but we can warn
  warnings.push(`Verify that '${categoryId}' is in the category union type in src/types/entities.ts`);

  const isValid = errors.length === 0;

  return {
    categoryId,
    isValid,
    errors,
    warnings,
  };
}

/**
 * Validates all categories in CATEGORY_MAP
 */
export function validateAllCategories(
  attributeDefinitions: AttributeDefinition[],
  questionNodes: QuestionNode[],
  categoryOrder?: string[]
): CategoryValidationResult[] {
  const results: CategoryValidationResult[] = [];

  Object.keys(CATEGORY_MAP).forEach(categoryId => {
    const result = validateCategoryIntegration(
      categoryId,
      attributeDefinitions,
      questionNodes,
      categoryOrder
    );
    results.push(result);
  });

  return results;
}

