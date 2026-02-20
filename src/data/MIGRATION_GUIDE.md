# Data Migration Guide

## Optimal Migration Strategy

This guide explains the **best way** to migrate all prompt data from the old generator to the new version.

## Overview

The old system has:
- **Interview JSON files** with questions/answers/weights
- **Category map** for navigation
- **Complex prompt assembly** with normalization rules

The new system needs:
- **Flat AttributeDefinition[]** format
- **Simple modifiers** (just values)
- **No navigation structure** (UI handles that)

## Migration Approaches

### ✅ **Recommended: One-Time Migration Script**

**Best for:** Complete data migration with full control

1. **Run the migration script:**
   ```bash
   # Option 1: Using Node.js directly
   node --loader ts-node/esm src/data/migrateData.ts
   
   # Option 2: Add to package.json scripts
   "migrate": "ts-node src/data/migrateData.ts"
   ```

2. **The script will:**
   - Read all JSON files from `PCV1_final/src/data/interview/`
   - Extract all answers as attributes
   - Infer categories, priorities, conflicts
   - Generate `src/data/attributes.json` (flat format)

3. **Update the loader:**
   ```typescript
   // In loadAttributeDefinitions.ts
   import attributesData from './attributes.json';
   
   export function loadAttributeDefinitions(): AttributeDefinition[] {
     return attributesData as AttributeDefinition[];
   }
   ```

**Advantages:**
- ✅ One-time conversion, then use simple flat JSON
- ✅ Easy to review and edit the output
- ✅ No runtime transformation overhead
- ✅ Can manually fix/customize the output
- ✅ Version control friendly

### ⚠️ **Alternative: Runtime Transformer**

**Best for:** Quick testing without migration

1. Copy JSON files:
   ```bash
   cp -r PCV1_final/src/data/interview src/data/
   ```

2. Use the existing `loadAttributeDefinitions.ts` transformer

**Advantages:**
- ✅ Works immediately
- ✅ No manual steps

**Disadvantages:**
- ❌ Runtime transformation overhead
- ❌ Harder to debug/customize
- ❌ Less maintainable

## What Gets Migrated

### ✅ **Extracted:**
- All answer options → `AttributeDefinition[]`
- Categories (inferred from context)
- Semantic priorities (inferred from context)
- Conflicts (auto-detected: male/female, anime/realistic, etc.)
- Base text (normalized from labels)

### ❌ **Not Migrated (by design):**
- **Weights/templates** - New system uses simple value modifiers
- **Navigation structure** - UI handles navigation separately
- **Normalization rules** - Engine doesn't need them
- **Question text** - Not needed for prompt generation

## Step-by-Step Migration

### Step 1: Run Migration Script

```bash
npm run migrate
# or
node --loader ts-node/esm src/data/migrateData.ts
```

This generates `src/data/attributes.json` with all attributes.

### Step 2: Review Generated File

Open `src/data/attributes.json` and:
- ✅ Check categories are correct
- ✅ Verify conflicts are detected
- ✅ Adjust priorities if needed
- ✅ Fix any baseText that looks wrong

### Step 3: Update Loader

Modify `src/data/loadAttributeDefinitions.ts`:

```typescript
import attributesData from './attributes.json';

export function loadAttributeDefinitions(): AttributeDefinition[] {
  return attributesData as AttributeDefinition[];
}
```

### Step 4: Test

Run the app and verify:
- All attributes appear in the selector
- Conflicts work correctly
- Prompts generate properly

## Manual Adjustments

After migration, you may want to:

1. **Fix baseText** - Some labels might need manual adjustment
2. **Add missing conflicts** - Auto-detection might miss some
3. **Adjust priorities** - Fine-tune semantic ordering
4. **Add categories** - Ensure proper categorization

## Data Structure Comparison

### Old Format (Interview JSON):
```json
{
  "id": "anime-styles-root",
  "question": "What type of anime style?",
  "answers": [
    { "id": "soft_romantic", "label": "Soft, romantic anime", "next": "anime-weights" }
  ],
  "weights": [
    { "id": "stylization_intensity", "template": "stylization intensity", ... }
  ]
}
```

### New Format (Flat JSON):
```json
[
  {
    "id": "soft_romantic",
    "baseText": "soft, romantic anime",
    "category": "style",
    "semanticPriority": 3,
    "isNegative": false,
    "conflictsWith": ["realistic-style"]
  }
]
```

## Next Steps After Migration

1. **Remove old transformer code** (if using flat format)
2. **Add new attributes** directly to `attributes.json`
3. **Update conflicts** as you discover them
4. **Consider splitting** into multiple files by category (optional)

## Troubleshooting

**Problem:** Migration script can't find files
- **Solution:** Check path to `PCV1_final/src/data/interview/`

**Problem:** Some attributes missing
- **Solution:** Check `shouldSkipAnswer()` function - might be too aggressive

**Problem:** Conflicts not detected
- **Solution:** Manually add to `conflictsWith` array in generated JSON

**Problem:** Categories wrong
- **Solution:** Adjust `inferCategory()` logic or manually fix in JSON

