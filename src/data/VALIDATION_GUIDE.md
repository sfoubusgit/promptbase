# Data Validation Guide

This document explains the validation system that prevents data loading issues.

**IMPORTANT**: When adding new categories, use the [Category Integration Checklist](./CATEGORY_INTEGRATION_CHECKLIST.md) to ensure all steps are completed.

## Automatic Validation

The system automatically validates data integrity at multiple levels:

### 1. Loader-Level Validation

**`loadAttributeDefinitions.ts`:**
- Validates each attribute has required fields (id, baseText, semanticPriority, isNegative)
- Detects duplicate attribute IDs across all categories
- Logs summary by category
- Reports files that don't match category data structure

**`loadQuestionNodes.ts`:**
- Detects duplicate node IDs
- Validates required fields (id, question, attributeIds)
- Logs all loaded node IDs

### 2. App-Level Validation

**On Attribute Definitions Load:**
- Verifies all categories in `CATEGORY_MAP` have corresponding attribute data
- Reports categories with 0 attributes loaded
- Provides solution steps

**On Question Nodes Load:**
- Verifies all categories in `CATEGORY_MAP` have corresponding question nodes
- Verifies all categories in `CATEGORY_ORDER` exist in `CATEGORY_MAP`
- Reports missing nodes with solution steps

**On Question Display:**
- Detects when question node references attributes that don't exist
- Detects when question node has attribute IDs but 0 matching attributes found
- Provides detailed error messages with solution steps

## Error Messages

All validation errors are prefixed with `⚠️ VALIDATION ERROR:` and include:
- What went wrong
- Which category/node is affected
- Solution steps to fix the issue

## Common Issues and Solutions

### Issue: Category has 0 attributes loaded
**Error:** `Category "X" is in CATEGORY_MAP but has 0 attributes loaded!`
**Solution:**
1. Check that `src/data/X.json` exists
2. Verify file has structure: `{ "category": "X", "attributes": [...] }`
3. Restart dev server

### Issue: Question node references missing attributes
**Error:** `Question node "X-root" references N missing attributes`
**Solution:**
1. Check that `src/data/X.json` contains all attribute IDs referenced in question node
2. Verify attribute IDs match exactly (case-sensitive)
3. Restart dev server

### Issue: Category in CATEGORY_ORDER but not in CATEGORY_MAP
**Error:** `Category "X" is in CATEGORY_ORDER but not in CATEGORY_MAP!`
**Solution:**
1. Add category to `CATEGORY_MAP` in `src/data/categoryMap.ts`
2. Format: `X: [{ label: "X", nodeId: "X-root" }]`

### Issue: Category references node that doesn't exist
**Error:** `Category "X" references node "X-root" but no question node found!`
**Solution:**
1. Create `src/data/questions/X.json`
2. Include node with `id: "X-root"`
3. Restart dev server

## Prevention Checklist

When adding a new category, ensure:

- [ ] `src/data/X.json` exists with proper structure
- [ ] `src/data/questions/X.json` exists with node matching CATEGORY_MAP
- [ ] Category added to `CATEGORY_MAP` in `categoryMap.ts`
- [ ] Category added to `CATEGORY_ORDER` in `App.tsx`
- [ ] Category type added to `AttributeDefinition['category']` in `entities.ts`
- [ ] All attribute IDs in question node exist in attribute definitions
- [ ] Dev server restarted after adding files
- [ ] Browser console checked for validation errors

## Validation Runs

Validation runs automatically:
- On app startup (attribute definitions and question nodes)
- When question nodes load
- When current question changes
- All errors are logged to browser console

Check the browser console for validation messages when adding new categories.

