# Category Integration Checklist

This checklist ensures categories are fully integrated and questions appear correctly.

## Required Steps (MUST DO ALL)

### 1. Create Category Data File
- [ ] Create `src/data/{categoryId}.json`
- [ ] File structure: `{ "category": "{categoryId}", "attributes": [...] }`
- [ ] All attributes have: `id`, `baseText`, `semanticPriority`, `isNegative`, `conflictsWith`
- [ ] Attribute IDs are namespaced: `{categoryId}:{attribute-name}`
- [ ] File is valid JSON

### 2. Create Question Node File
- [ ] Create `src/data/questions/{categoryId}.json`
- [ ] File contains array: `[{ "id": "{categoryId}-root", ... }]`
- [ ] Node ID matches pattern: `{categoryId}-root`
- [ ] `attributeIds` array includes ALL attributes from step 1
- [ ] `question` and `description` fields are set
- [ ] `nextNodeId` is `null` (or links to next category)
- [ ] File is valid JSON

### 3. Register in Category Map
- [ ] Open `src/data/categoryMap.ts`
- [ ] Add entry: `{categoryId}: [{ label: "{Category Name}", nodeId: "{categoryId}-root" }]`
- [ ] Verify `nodeId` matches question node ID from step 2

### 4. Add to Category Type
- [ ] Open `src/types/entities.ts`
- [ ] Add `'{categoryId}'` to the `category` union type in `AttributeDefinition`
- [ ] Format: `category: 'subject' | 'style' | ... | '{categoryId}';`

### 5. Add to Category Order
- [ ] Open `src/ui/App.tsx`
- [ ] Find `CATEGORY_ORDER` array
- [ ] Add `'{categoryId}'` to the array in desired position
- [ ] Format: `const CATEGORY_ORDER: string[] = ['subject', 'style', ..., '{categoryId}'];`

## Verification

After completing all steps:

1. **Start the dev server** (if not running)
2. **Check browser console** for validation messages:
   - Look for `✓ Category "{categoryId}" is fully integrated`
   - If errors appear, fix them before proceeding
3. **Test in UI**:
   - Category appears in sidebar
   - Clicking category shows question
   - All attributes are selectable
   - Conflicts work correctly
   - Negative attributes route to negative prompt

## Common Issues

### Issue: "Category has 0 attributes loaded"
**Solution**: Check that `src/data/{categoryId}.json` exists and is properly formatted

### Issue: "Question node NOT FOUND"
**Solution**: Check that `src/data/questions/{categoryId}.json` exists and node ID matches `{categoryId}-root`

### Issue: "Missing attributes in question node"
**Solution**: Ensure all attribute IDs from data file are in question node's `attributeIds` array

### Issue: "Category not in CATEGORY_ORDER"
**Solution**: Add category to `CATEGORY_ORDER` array in `App.tsx`

### Issue: "Category not in CATEGORY_MAP"
**Solution**: Add category entry to `CATEGORY_MAP` in `categoryMap.ts`

## Validation System

The system automatically validates all categories on app startup. Check the browser console for:
- ✅ Green checkmarks for valid categories
- ❌ Red errors for invalid categories
- ⚠️ Yellow warnings for potential issues

All errors include specific solutions.

