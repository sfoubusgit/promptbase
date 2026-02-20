# Attribute Definitions Data

This directory contains attribute definitions for the prompt engine.

## Current Setup (Transformer Approach)

The app uses `loadAttributeDefinitions.ts` to automatically transform existing interview JSON files into the `AttributeDefinition[]` format.

### To Use Existing JSON Files:

1. Copy JSON files from `PCV1_final/src/data/interview/` to `src/data/interview/`
2. The transformer will automatically:
   - Load all JSON files using Vite's glob import
   - Extract all "answers" from interview nodes
   - Convert them to `AttributeDefinition` format
   - Infer categories, priorities, and conflicts

### File Structure:
```
src/data/
  └── interview/
      ├── character/
      │   ├── face.json
      │   ├── hair.json
      │   └── ...
      ├── environment/
      ├── style/
      └── ...
```

## Future Setup (Flat JSON Format)

For better maintainability, migrate to a flat JSON format that directly matches `AttributeDefinition`.

### Example: `src/data/attributes.json`

```json
[
  {
    "id": "subject-female",
    "baseText": "female character",
    "category": "subject",
    "semanticPriority": 1,
    "isNegative": false,
    "conflictsWith": ["subject-male"]
  },
  {
    "id": "subject-male",
    "baseText": "male character",
    "category": "subject",
    "semanticPriority": 1,
    "isNegative": false,
    "conflictsWith": ["subject-female"]
  },
  {
    "id": "anime-style",
    "baseText": "anime style",
    "category": "style",
    "semanticPriority": 3,
    "isNegative": false,
    "conflictsWith": ["realistic-style", "photorealistic-style"]
  }
]
```

### To Use Flat Format:

1. Create `src/data/attributes.json` with the structure above
2. Update `loadAttributeDefinitions.ts`:
   ```typescript
   import attributesData from './attributes.json';
   
   export function loadAttributeDefinitions(): AttributeDefinition[] {
     return attributesData as AttributeDefinition[];
   }
   ```

## Category Mapping

- `subject`: Characters, people, main subjects
- `attribute`: Physical attributes, clothing, accessories
- `style`: Art styles, rendering styles
- `composition`: Camera angles, framing, layout
- `effect`: Lighting, particles, post-processing
- `quality`: Resolution, render quality, technical specs

## Priority Guidelines

- `1`: Subject/character (highest priority)
- `2`: Physical attributes, clothing
- `3`: Style, art direction
- `4`: Effects, lighting
- `5`: Environment, composition
- `6`: Quality, technical (lowest priority)

