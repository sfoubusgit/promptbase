# Detailed Implementation Notes

## Overview
This document contains EXACT implementation steps for solving each problem identified in the feedback analysis.

---

## PROBLEM 1: Missing Action/Activity Category

### Current State Analysis
- **Category types defined in**: `src/types/entities.ts` (lines 20, 67)
- **Category union type**: `'subject' | 'attribute' | 'style' | 'composition' | 'effect' | 'effects' | 'quality' | 'lighting' | 'camera' | 'environment' | 'post-processing'`
- **Missing**: `'actions'` category
- **Category map location**: `src/data/categoryMap.ts` - NO actions entry exists
- **Data loading**: `src/data/loadAttributeDefinitions.ts` - loads from `src/data/*.json` files
- **Question loading**: `src/data/loadQuestionNodes.ts` - loads from `src/data/questions/*.json` files
- **App integration**: `src/ui/App.tsx` line 105 - `CATEGORY_ORDER` array must include new category

### Implementation Steps

#### Step 1.1: Update Type Definitions
**File**: `src/types/entities.ts`

**Change 1**: Update `AttributeDefinition.category` type (line 20)
- **Location**: Line 20, in the union type
- **Current**: `category: 'subject' | 'attribute' | 'style' | 'composition' | 'effect' | 'effects' | 'quality' | 'lighting' | 'camera' | 'environment' | 'post-processing';`
- **New**: Add `'actions'` to the union: `category: 'subject' | 'attribute' | 'style' | 'composition' | 'effect' | 'effects' | 'quality' | 'lighting' | 'camera' | 'environment' | 'post-processing' | 'actions';`
- **Also update**: Line 67 (same union type in `PromptFragment.category`)

**Change 2**: Update `PromptFragment.category` type (line 67)
- **Same change as above** - must match exactly

#### Step 1.2: Create Actions Data File
**File**: `src/data/actions.json` (NEW FILE)

**Structure**:
```json
{
  "category": "actions",
  "attributes": [
    {
      "id": "actions:body-standing",
      "baseText": "standing",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:body-sitting",
      "baseText": "sitting",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:body-running",
      "baseText": "running",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:body-jumping",
      "baseText": "jumping",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:body-walking",
      "baseText": "walking",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:body-lying",
      "baseText": "lying",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:body-kneeling",
      "baseText": "kneeling",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:gesture-waving",
      "baseText": "waving",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:gesture-pointing",
      "baseText": "pointing",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:gesture-holding",
      "baseText": "holding",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:gesture-reaching",
      "baseText": "reaching",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:gesture-hands-on-hips",
      "baseText": "hands on hips",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:facial-looking-at-viewer",
      "baseText": "looking at viewer",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:facial-looking-away",
      "baseText": "looking away",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:complex-fighting",
      "baseText": "fighting",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:complex-dancing",
      "baseText": "dancing",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:complex-reading",
      "baseText": "reading",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:complex-writing",
      "baseText": "writing",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:interaction-touching",
      "baseText": "touching",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    },
    {
      "id": "actions:interaction-hugging",
      "baseText": "hugging",
      "semanticPriority": 150,
      "isNegative": false,
      "conflictsWith": []
    }
  ]
}
```

**Notes**:
- Use `semanticPriority: 150` 
- **CRITICAL**: Actual priority values in codebase are: subject (100), style (3), lighting (70), environment (65), camera (60-65), quality (varies 5-90)
- Fragment orderer sorts by priority ASCENDING (lower numbers first)
- Actions should come after subject (100) but the priority system seems reversed from expected
- Using 150 as a middle value - verify actual ordering behavior after implementation
- All actions are positive prompts (isNegative: false)
- ID pattern: `actions:subcategory-actionname`
- Base text uses present participle form (gerunds: "standing", "running", not "stand", "run")
- Start with ~20 common actions, expand later

#### Step 1.3: Create Actions Question Nodes
**File**: `src/data/questions/actions.json` (NEW FILE)

**Structure**:
```json
[
  {
    "id": "actions-root",
    "question": "What actions or activities?",
    "description": "Describe what characters or subjects are doing",
    "attributeIds": [
      "actions:body-standing",
      "actions:body-sitting",
      "actions:body-running",
      "actions:body-jumping",
      "actions:body-walking",
      "actions:body-lying",
      "actions:body-kneeling",
      "actions:gesture-waving",
      "actions:gesture-pointing",
      "actions:gesture-holding",
      "actions:gesture-reaching",
      "actions:gesture-hands-on-hips",
      "actions:facial-looking-at-viewer",
      "actions:facial-looking-away",
      "actions:complex-fighting",
      "actions:complex-dancing",
      "actions:complex-reading",
      "actions:complex-writing",
      "actions:interaction-touching",
      "actions:interaction-hugging"
    ],
    "nextNodeId": null,
    "allowCustomExtension": [
      "actions:body-standing",
      "actions:body-sitting",
      "actions:body-running",
      "actions:body-jumping",
      "actions:body-walking",
      "actions:body-lying",
      "actions:body-kneeling",
      "actions:gesture-waving",
      "actions:gesture-pointing",
      "actions:gesture-holding",
      "actions:gesture-reaching",
      "actions:gesture-hands-on-hips",
      "actions:facial-looking-at-viewer",
      "actions:facial-looking-away",
      "actions:complex-fighting",
      "actions:complex-dancing",
      "actions:complex-reading",
      "actions:complex-writing",
      "actions:interaction-touching",
      "actions:interaction-hugging"
    ]
  }
]
```

**Notes**:
- Single root node for simplicity (can expand later with subcategories)
- All attributes listed in attributeIds
- All attributes allow custom extensions (for specificity like "running fast", "slowly walking")
- nextNodeId: null (no follow-up questions for now)

#### Step 1.4: Add Actions to Category Map
**File**: `src/data/categoryMap.ts`

**Change**: Add actions category to `CATEGORY_MAP` object (after line 255, before closing brace)

**Location**: Inside `CATEGORY_MAP` object, add new property:
```typescript
  actions: [
    {
      label: "Actions",
      nodeId: "actions-root"
    }
  ]
```

**Full context**: The object should end like:
```typescript
  "post-processing": [
    // ... existing entries
  ],
  actions: [
    {
      label: "Actions",
      nodeId: "actions-root"
    }
  ]
};
```

#### Step 1.5: Add Actions to Category Order
**File**: `src/ui/App.tsx`

**Change**: Update `CATEGORY_ORDER` array (line 105)

**Current**: `const CATEGORY_ORDER: string[] = ['subject', 'style', 'lighting', 'camera', 'environment', 'quality', 'effects', 'post-processing'];`

**New**: Insert 'actions' after 'subject' and before 'style':
`const CATEGORY_ORDER: string[] = ['subject', 'actions', 'style', 'lighting', 'camera', 'environment', 'quality', 'effects', 'post-processing'];`

**Reasoning**: Actions should come after subject (what) but before style (how), matching semantic priority order

#### Step 1.6: Verification Steps
1. Check that `loadAttributeDefinitions()` loads actions.json
2. Check that `loadQuestionNodes()` loads questions/actions.json
3. Verify actions appear in CategorySidebar
4. Test selecting an action attribute
5. Verify action appears in generated prompt
6. Check that action fragment has category: 'actions' and semanticPriority: 200

---

## PROBLEM 2: Flat, Unorganized Output Format

### Current State Analysis
- **Prompt type**: `src/types/entities.ts` lines 103-118 - only has `positiveTokens`, `negativeTokens` strings
- **Prompt assembly**: `src/modules/prompt-assembler.ts` - joins fragments with comma separator
- **Fragment ordering**: `src/modules/fragment-orderer.ts` - orders by priority but doesn't group by category
- **Display**: `src/ui/components/PromptPreview.tsx` - displays flat string
- **Fragment structure**: Fragments have `category` field but it's lost in final string output

### Implementation Steps

#### Step 2.1: Extend Prompt Type with Sections
**File**: `src/types/entities.ts`

**Change**: Modify `Prompt` interface (lines 103-118)

**Current**:
```typescript
export interface Prompt {
  positiveTokens: string;
  negativeTokens: string;
  tokenCount: number;
  selectedAttributeIds: string[];
  appliedModifiers: Modifier[];
}
```

**New** (add sections field, keep positiveTokens for backward compatibility):
```typescript
export interface Prompt {
  positiveTokens: string; // Keep for backward compatibility and SD output
  negativeTokens: string;
  tokenCount: number;
  selectedAttributeIds: string[];
  appliedModifiers: Modifier[];
  sections?: { // NEW: Optional for backward compatibility
    scene?: string;
    characters?: string;
    actions?: string;
    style?: string;
    lighting?: string;
    camera?: string;
    effects?: string;
    quality?: string;
    'post-processing'?: string;
  };
}
```

**Notes**:
- Sections are optional (using `?`) for backward compatibility
- Section names use user-friendly labels (not technical category names)
- All sections are optional (using `?` on each property)

#### Step 2.2: Create Category-to-Section Mapping
**File**: `src/modules/prompt-assembler.ts` (add at top of file)

**Add constant** (after imports, before function):
```typescript
/**
 * Maps technical category names to user-friendly section names for display
 */
const CATEGORY_TO_SECTION_MAP: Record<string, keyof NonNullable<Prompt['sections']>> = {
  'subject': 'characters',
  'environment': 'scene',
  'actions': 'actions',
  'style': 'style',
  'lighting': 'lighting',
  'camera': 'camera',
  'effects': 'effects',
  'quality': 'quality',
  'post-processing': 'post-processing',
  // Fallback categories (may not appear in sections)
  'attribute': 'characters', // Attributes go with characters
  'composition': 'camera', // Composition goes with camera
  'effect': 'effects', // Singular 'effect' -> 'effects'
};
```

**Notes**:
- Maps technical categories to display section names
- Some categories are grouped (attribute -> characters, composition -> camera)
- Effect (singular) maps to effects (plural) section

#### Step 2.3: Update assemblePrompt to Generate Sections
**File**: `src/modules/prompt-assembler.ts`

**Change**: Modify `assemblePrompt` function (lines 23-85)

**New implementation approach**:
1. Keep existing positiveTokens generation (for backward compatibility)
2. Additionally, group fragments by category and create sections object
3. Return both positiveTokens and sections

**Detailed changes**:

**After line 38** (after building positiveParts array), add section grouping logic:

```typescript
  // Build positive prompt string (EXISTING CODE - keep as-is)
  const positiveParts: string[] = [];
  for (const fragment of orderedFragments.positive) {
    if (fragment.weight !== null && modelProfile.weightSyntax === 'attention') {
      const formatted = `(${fragment.text}:${fragment.weight.toFixed(2)})`;
      positiveParts.push(formatted);
    } else {
      positiveParts.push(fragment.text);
    }
  }
  let positiveTokens = positiveParts.join(modelProfile.tokenSeparator);

  // NEW: Build sections object by grouping fragments by category
  const sectionsByCategory: Record<string, string[]> = {};
  
  for (const fragment of orderedFragments.positive) {
    const sectionKey = CATEGORY_TO_SECTION_MAP[fragment.category];
    if (sectionKey) {
      if (!sectionsByCategory[sectionKey]) {
        sectionsByCategory[sectionKey] = [];
      }
      
      // Format fragment text (same logic as positiveParts)
      let fragmentText = fragment.text;
      if (fragment.weight !== null && modelProfile.weightSyntax === 'attention') {
        fragmentText = `(${fragment.text}:${fragment.weight.toFixed(2)})`;
      }
      
      sectionsByCategory[sectionKey].push(fragmentText);
    } else {
      // FALLBACK: Category not mapped - log warning and skip (or use category name as section key)
      console.warn(`[assemblePrompt] Category "${fragment.category}" not mapped to section, fragment skipped: ${fragment.text}`);
      // Option: Uncomment to include unmapped categories using category name
      // const fallbackKey = fragment.category as keyof typeof sections;
      // if (!sectionsByCategory[fallbackKey]) sectionsByCategory[fallbackKey] = [];
      // sectionsByCategory[fallbackKey].push(fragmentText);
    }
  }
  
  // Convert arrays to comma-separated strings
  const sections: NonNullable<Prompt['sections']> = {};
  for (const [sectionKey, fragmentTexts] of Object.entries(sectionsByCategory)) {
    if (fragmentTexts.length > 0) {
      sections[sectionKey as keyof typeof sections] = fragmentTexts.join(modelProfile.tokenSeparator);
    }
  }
```

**Then, update return statement** (line 78-84):

**Current**:
```typescript
  return {
    positiveTokens,
    negativeTokens,
    tokenCount: finalTokenCount,
    selectedAttributeIds: [],
    appliedModifiers: [],
  };
```

**New**:
```typescript
  return {
    positiveTokens,
    negativeTokens,
    tokenCount: finalTokenCount,
    selectedAttributeIds: [],
    appliedModifiers: [],
    sections: Object.keys(sections).length > 0 ? sections : undefined, // Only include if sections exist
  };
```

**Notes**:
- Sections use same tokenSeparator as positiveTokens (comma-space by default)
- Sections only included if at least one section has content
- Fragment formatting (weights) applied consistently in both positiveTokens and sections

#### Step 2.4: Update PromptPreview to Display Sections
**File**: `src/ui/components/PromptPreview.tsx`

**Change**: Modify the component to display sections when available

**Strategy**: 
- If `prompt.sections` exists, display sections with headers
- Otherwise, fall back to flat `positiveTokens` display (backward compatibility)

**Section display order** (matching semantic priority):
1. Scene (environment)
2. Characters (subject)
3. Actions (actions)
4. Style (style)
5. Lighting (lighting)
6. Camera (camera)
7. Effects (effects)
8. Quality (quality)
9. Post-processing (post-processing)

**Detailed changes**:

**Replace lines 85-101** (the prompt-preview-content div):

**Current**:
```typescript
      <div className="prompt-preview-content">
        <div className="prompt-preview-section">
          <label className="prompt-preview-label">Prompt</label>
          <div className="prompt-preview-text">
            {displayPositive || 'Start building your prompt...'}
          </div>
        </div>
        
        {displayNegative && (
          <div className="prompt-preview-section">
            <label className="prompt-preview-label">Negative Prompt</label>
            <div className="prompt-preview-text">
              {displayNegative}
            </div>
          </div>
        )}
      </div>
```

**New**:
```typescript
      <div className="prompt-preview-content">
        {prompt && 'sections' in prompt && prompt.sections && Object.keys(prompt.sections).length > 0 ? (
          // NEW: Display sections
          <div className="prompt-preview-sections">
            {['scene', 'characters', 'actions', 'style', 'lighting', 'camera', 'effects', 'quality', 'post-processing'].map((sectionKey) => {
              const sectionValue = prompt.sections?.[sectionKey as keyof typeof prompt.sections];
              if (!sectionValue) return null;
              
              const sectionLabels: Record<string, string> = {
                'scene': 'Scene',
                'characters': 'Characters',
                'actions': 'Actions',
                'style': 'Style',
                'lighting': 'Lighting',
                'camera': 'Camera',
                'effects': 'Effects',
                'quality': 'Quality',
                'post-processing': 'Post-Processing'
              };
              
              return (
                <div key={sectionKey} className="prompt-preview-section">
                  <label className="prompt-preview-section-label">{sectionLabels[sectionKey]}:</label>
                  <div className="prompt-preview-section-text">{sectionValue}</div>
                </div>
              );
            })}
          </div>
        ) : (
          // FALLBACK: Display flat format (backward compatibility)
          <div className="prompt-preview-section">
            <label className="prompt-preview-label">Prompt</label>
            <div className="prompt-preview-text">
              {displayPositive || 'Start building your prompt...'}
            </div>
          </div>
        )}
        
        {displayNegative && (
          <div className="prompt-preview-section">
            <label className="prompt-preview-label">Negative Prompt</label>
            <div className="prompt-preview-text">
              {displayNegative}
            </div>
          </div>
        )}
      </div>
```

**Notes**:
- Only shows sections if `prompt.sections` exists and has content
- Falls back to flat display for backward compatibility
- Section order matches semantic priority
- Section labels are user-friendly (capitalized, with spaces)

#### Step 2.5: Update Copy Functionality (Keep SD Format)
**File**: `src/ui/components/PromptPreview.tsx`

**Change**: Update `handleCopy` function (lines 52-62)

**Current**: Copies `displayPositive` (flat format)

**Keep as-is** - copy should still use `positiveTokens` (flat format) for Stable Diffusion compatibility. Sections are for display only.

**No changes needed** - current copy functionality is correct (copies flat format).

#### Step 2.6: Add CSS for Section Display
**File**: `src/ui/components/PromptPreview.css` (may need to check if exists)

**Add styles** for sectioned display:
```css
.prompt-preview-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prompt-preview-section-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-secondary, #666);
  margin-bottom: 4px;
  display: block;
}

.prompt-preview-section-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary, #000);
  padding: 8px;
  background: var(--bg-secondary, #f5f5f5);
  border-radius: 4px;
}
```

**Notes**:
- Sections are stacked vertically with spacing
- Labels are bold and secondary color
- Section text has background and padding for visual separation

#### Step 2.7: Verification Steps
1. Generate prompt with selections from multiple categories
2. Verify `prompt.sections` object is populated
3. Verify sections appear in PromptPreview with headers
4. Verify empty sections are not displayed
5. Verify copy functionality still copies flat format (positiveTokens)
6. Test backward compatibility (prompts without sections still display)

---

## PROBLEM 3: No Sentence/Paragraph Mode

### Current State Analysis
- **Output format**: Always comma-separated tags
- **No grammar**: No articles, conjunctions, sentence structure
- **No mode switching**: No way to toggle between tags and sentences
- **Model profile**: `src/types/entities.ts` lines 86-98 - no format mode option

### Implementation Steps

#### Step 3.1: Add Format Mode to ModelProfile (Optional)
**File**: `src/types/entities.ts`

**Change**: Extend `ModelProfile` interface (lines 86-98)

**Current**:
```typescript
export interface ModelProfile {
  tokenLimit: number;
  tokenSeparator: string;
  weightSyntax: 'attention';
  defaultNegativePrompt: string | null;
}
```

**New** (add formatMode field):
```typescript
export interface ModelProfile {
  tokenLimit: number;
  tokenSeparator: string;
  weightSyntax: 'attention';
  defaultNegativePrompt: string | null;
  formatMode?: 'tags' | 'sentences'; // NEW: Optional, defaults to 'tags'
}
```

**Notes**:
- Optional field (using `?`) for backward compatibility
- Default behavior (when undefined) is 'tags' (current behavior)
- Two modes: 'tags' (current) and 'sentences' (new)

#### Step 3.2: Create Sentence Formatter Module
**File**: `src/modules/sentence-formatter.ts` (NEW FILE)

**Purpose**: Convert fragments into natural language sentences

**Structure**:
```typescript
/**
 * Sentence Formatter Module
 * 
 * Converts prompt fragments into natural language sentences.
 * Groups fragments by category and formats as readable text.
 */

import { PromptFragment } from '../types';
import { OrderedFragments } from './fragment-orderer';

/**
 * Formats fragments as sentences within sections
 */
export function formatFragmentsAsSentences(
  orderedFragments: OrderedFragments,
  sections?: Record<string, string>
): Record<string, string> {
  // If sections already exist (from tag format), convert them to sentences
  if (sections) {
    return convertSectionsToSentences(sections);
  }
  
  // Otherwise, group fragments by category first, then convert to sentences
  const sectionsByCategory: Record<string, PromptFragment[]> = {};
  
  for (const fragment of orderedFragments.positive) {
    const category = fragment.category;
    if (!sectionsByCategory[category]) {
      sectionsByCategory[category] = [];
    }
    sectionsByCategory[category].push(fragment);
  }
  
  const sentenceSections: Record<string, string> = {};
  
  for (const [category, fragments] of Object.entries(sectionsByCategory)) {
    const sectionText = formatCategoryAsSentence(category, fragments);
    if (sectionText) {
      sentenceSections[category] = sectionText;
    }
  }
  
  return sentenceSections;
}

/**
 * Converts tag-based sections to sentence format
 */
function convertSectionsToSentences(sections: Record<string, string>): Record<string, string> {
  const sentenceSections: Record<string, string> = {};
  
  const sectionTemplates: Record<string, (tags: string) => string> = {
    'scene': (tags) => `A ${tags} scene.`,
    'characters': (tags) => `A ${tags}.`,
    'actions': (tags) => `${capitalizeFirst(tags)}.`,
    'style': (tags) => `Rendered in ${tags} style.`,
    'lighting': (tags) => `With ${tags} lighting.`,
    'camera': (tags) => `Shot with ${tags}.`,
    'effects': (tags) => `Featuring ${tags}.`,
    'quality': (tags) => `${capitalizeFirst(tags)} quality.`,
    'post-processing': (tags) => `Post-processed with ${tags}.`,
  };
  
  for (const [sectionKey, tagText] of Object.entries(sections)) {
    const template = sectionTemplates[sectionKey];
    if (template) {
      sentenceSections[sectionKey] = template(tagText);
    } else {
      // Fallback: just capitalize first letter and add period
      sentenceSections[sectionKey] = `${capitalizeFirst(tagText)}.`;
    }
  }
  
  return sentenceSections;
}

/**
 * Formats fragments of a category as a sentence
 */
function formatCategoryAsSentence(category: string, fragments: PromptFragment[]): string {
  const texts = fragments.map(f => f.text);
  const joined = texts.join(', ');
  
  const templates: Record<string, (text: string) => string> = {
    'subject': (text) => `A ${text}.`,
    'environment': (text) => `A ${text} scene.`,
    'actions': (text) => `${capitalizeFirst(text)}.`,
    'style': (text) => `Rendered in ${text} style.`,
    'lighting': (text) => `With ${text} lighting.`,
    'camera': (text) => `Shot with ${text}.`,
    'effects': (text) => `Featuring ${text}.`,
    'quality': (text) => `${capitalizeFirst(text)} quality.`,
    'post-processing': (text) => `Post-processed with ${text}.`,
  };
  
  const template = templates[category];
  if (template) {
    return template(joined);
  }
  
  // Fallback
  return `${capitalizeFirst(joined)}.`;
}

function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}
```

**Notes**:
- Simple template-based approach (not full NLP)
- Templates add articles and structure to tags
- Each section type has appropriate sentence structure
- Falls back gracefully if category not in templates

#### Step 3.3: Update assemblePrompt to Support Sentence Format
**File**: `src/modules/prompt-assembler.ts`

**Change**: Modify `assemblePrompt` to check formatMode and use sentence formatter

**Import**: Add at top of file (after line 14):
```typescript
import { formatFragmentsAsSentences } from './sentence-formatter';
```

**Modify sections generation** (in the code added in Step 2.3):

**After building sections object, add format mode check**:

```typescript
  // Convert arrays to comma-separated strings
  const sections: NonNullable<Prompt['sections']> = {};
  for (const [sectionKey, fragmentTexts] of Object.entries(sectionsByCategory)) {
    if (fragmentTexts.length > 0) {
      sections[sectionKey as keyof typeof sections] = fragmentTexts.join(modelProfile.tokenSeparator);
    }
  }
  
  // NEW: Convert to sentences if formatMode is 'sentences'
  if (modelProfile.formatMode === 'sentences') {
    const sentenceSections = formatFragmentsAsSentences(orderedFragments, sections);
    // Replace sections with sentence-formatted versions
    Object.keys(sections).forEach(key => delete sections[key as keyof typeof sections]);
    Object.assign(sections, sentenceSections);
  }
```

**Notes**:
- Only applies sentence formatting if formatMode is explicitly 'sentences'
- Default (undefined or 'tags') keeps current tag format
- Sentence formatter receives both fragments and tag sections for flexibility

#### Step 3.4: Update UI to Toggle Format Mode
**File**: `src/ui/App.tsx`

**Change**: Add format mode state and toggle

**Add state** (around line 63, after modelProfile state):
```typescript
  const [formatMode, setFormatMode] = useState<'tags' | 'sentences'>('tags');
```

**Update modelProfile usage** (where engine is called, find generatePrompt call):

**Find the code that calls generatePrompt** (likely around line 200-300, search for "generatePrompt"):

**Update the call** to include formatMode in modelProfile:
```typescript
const result = generatePrompt({
  attributeDefinitions,
  selections,
  modifiers: [],
  modelProfile: {
    ...modelProfile,
    formatMode: formatMode, // Add format mode
  },
});
```

**Add UI toggle** (in the render, near prompt preview or settings area):

Add a toggle/button to switch format modes. Location depends on UI structure, but could be near PromptPreview component or in a settings area.

**Simple toggle button**:
```typescript
<div style={{ marginBottom: '16px' }}>
  <label>
    <input
      type="checkbox"
      checked={formatMode === 'sentences'}
      onChange={(e) => setFormatMode(e.target.checked ? 'sentences' : 'tags')}
    />
    Use sentence format
  </label>
</div>
```

**Notes**:
- Simple checkbox toggle for now (can be improved with radio buttons or dropdown)
- State persists during session (not saved)
- Toggle affects new prompt generations

#### Step 3.5: Update PromptPreview for Sentence Display
**File**: `src/ui/components/PromptPreview.tsx`

**No changes needed** - sections display code from Step 2.4 already handles sentence format (just displays the section text, whether tags or sentences).

#### Step 3.6: Verification Steps
1. Toggle format mode to 'sentences'
2. Generate prompt with selections
3. Verify sections are formatted as sentences
4. Verify sentences are readable and grammatically reasonable
5. Toggle back to 'tags' and verify tag format returns
6. Test with various category combinations
7. Verify token count still calculated correctly (may need adjustment for sentences)

---

## RE-ANALYSIS: Finding Flaws in Solutions

### FLAW ANALYSIS - Problem 1: Actions Category

#### Flaw 1.1: Semantic Priority Choice - CRITICAL FLAW FOUND
**Issue**: Used `semanticPriority: 200` initially, but actual codebase values are different!

**Analysis**:
- **ACTUAL VALUES FOUND**: subject (100), style (3), lighting (70), environment (65), camera (60-65), quality (varies 5-90)
- Fragment orderer sorts ASCENDING (lower numbers = earlier in prompt)
- This means: style (3) comes BEFORE subject (100) in output order
- Priority system appears REVERSED from intuitive expectation (subject should come first)
- Actions priority of 150 would place it AFTER subject (100) in sorted order
- **CONFLICT**: Actions should logically come after subject but before style, but style (3) comes before subject (100)!

**Fix**: 
- Changed to `semanticPriority: 150` as compromise value
- **MUST VERIFY**: After implementation, check actual prompt output order
- May need to adjust priority based on desired position in final prompt
- Consider: Is the priority system correct, or does it need review?
- **RECOMMENDATION**: Test with sample prompts to verify actions appear in desired position

#### Flaw 1.2: Category Name Choice
**Issue**: Used `'actions'` as category name, but need to verify this doesn't conflict.

**Analysis**:
- Category name must be unique
- Must match the JSON file name pattern (actions.json)
- Must be added to type union correctly

**Fix**: 
- Verify 'actions' is not already used (it's not in current type definition)
- Consider alternatives: 'action' (singular) or 'activities' - but 'actions' is clearer and matches user feedback

#### Flaw 1.3: Question Node Structure
**Issue**: Created single root node with all actions, but this might be too many options in one question.

**Analysis**:
- Other categories have subcategories (e.g., subject has People, Animals, Characters)
- 20+ actions in one question might be overwhelming
- Should actions have subcategories? (Body Actions, Gestures, Facial Actions, Complex Actions, Interactions)

**Fix**:
- Consider adding subcategory structure in categoryMap
- Create multiple question nodes: actions-body-root, actions-gesture-root, etc.
- OR: Keep single node but organize in UI with grouping/labels

**Decision**: For initial implementation, single node is acceptable. Can be refined later based on user feedback.

#### Flaw 1.4: ID Naming Convention
**Issue**: Used `actions:body-standing` pattern, but need to verify this matches existing patterns.

**Analysis**:
- Check existing attribute IDs to see pattern
- From subject.json: `subject:person-man`, `subject:person-woman` - uses colon separator
- Pattern is: `category:subcategory-item`
- Actions pattern `actions:body-standing` matches this pattern ✓

**Fix**: No change needed - pattern is correct.

#### Flaw 1.5: Base Text Format (Gerunds vs Verbs)
**Issue**: Used gerunds ("standing", "running") but should verify this is best for SD prompts.

**Analysis**:
- Stable Diffusion prompts often use gerunds for actions
- But some use present tense verbs ("stands", "runs")
- Gerunds are more common in image prompts ("a man standing" vs "a man stands")
- Gerunds work better as modifiers/adjectives

**Fix**: Gerunds are correct choice. No change needed.

#### Flaw 1.6: Category Order Position
**Issue**: Placed 'actions' after 'subject' in CATEGORY_ORDER, but should verify semantic priority order.

**Analysis**:
- Semantic priority: subject (100) -> actions (200) -> style (300+) 
- Category order should match semantic priority for logical flow
- BUT: Category order is for interview flow, not prompt assembly order
- Prompt assembly uses semanticPriority field, not CATEGORY_ORDER

**Fix**: Category order placement is fine - it's for UI flow, not prompt ordering.

### FLAW ANALYSIS - Problem 2: Sectioned Display

#### Flaw 2.1: Category-to-Section Mapping Completeness
**Issue**: Mapping might not cover all categories, or might have conflicts.

**Analysis**:
- Some categories map to same section (attribute -> characters, composition -> camera)
- What if a category is not in the map? Fragments would be lost
- Need fallback handling

**Fix**:
- Add fallback: if category not in map, use category name as section key (or skip)
- OR: Add all possible categories to map explicitly
- Better: Log warning if category not mapped, but continue (don't break)

#### Flaw 2.2: Section Names vs Category Names
**Issue**: Using user-friendly section names (characters, scene) but mapping from technical categories.

**Analysis**:
- Mapping is necessary but adds complexity
- If category names change, mapping must be updated
- Risk of inconsistency

**Fix**: 
- Consider using category names directly as section keys, then map to display labels only in UI
- OR: Keep mapping but document it well
- Current approach (mapping in assembler) is fine if documented

#### Flaw 2.3: Empty Sections Handling
**Issue**: Code filters out empty sections, but need to verify this works correctly.

**Analysis**:
- Current code: `if (fragmentTexts.length > 0)` - only adds if fragments exist
- In UI: `if (!sectionValue) return null` - only renders if value exists
- This should work correctly

**Fix**: No change needed - empty sections are correctly filtered.

#### Flaw 2.4: Token Count Calculation
**Issue**: Token count is calculated from positiveTokens, but sections might have different formatting.

**Analysis**:
- Currently, sections use same tokenSeparator as positiveTokens
- Token count is calculated from positiveTokens (flat format)
- If sections are displayed but positiveTokens is same, token count is accurate
- BUT: If we change tokenSeparator per section, count would be wrong

**Fix**: 
- Keep token count calculation based on positiveTokens (source of truth)
- Sections are display-only, so token count doesn't need to account for section formatting
- No change needed

#### Flaw 2.5: Backward Compatibility
**Issue**: Sections are optional, but need to ensure old code still works.

**Analysis**:
- Prompt type: sections field is optional (`sections?`)
- PromptPreview: Checks for sections existence before using
- assemblePrompt: Only adds sections if they exist
- This should be backward compatible

**Fix**: 
- Test that prompts without sections still work
- Ensure all consumers of Prompt type handle missing sections gracefully
- Current implementation looks safe

#### Flaw 2.6: Fragment Weight Handling in Sections
**Issue**: Weight formatting applied in sections, but need to verify consistency.

**Analysis**:
- Code applies weight formatting to fragments in sections (same as positiveTokens)
- Format: `(${fragment.text}:${fragment.weight.toFixed(2)})`
- This is consistent with positiveTokens formatting
- Should work correctly

**Fix**: No change needed - weight formatting is consistent.

#### Flaw 2.7: Section Order in Display
**Issue**: Hardcoded section order array in PromptPreview, but should match semantic priority.

**Analysis**:
- Current order: ['scene', 'characters', 'actions', 'style', 'lighting', 'camera', 'effects', 'quality', 'post-processing']
- Should match semantic priority order for logical flow
- But sections are grouped by category, and categories have different priorities
- Within a section, fragments are already ordered by semanticPriority

**Fix**: 
- Section display order should follow approximate semantic priority
- Current order seems reasonable but could be derived from category priorities
- For now, hardcoded order is acceptable (can be improved later)

### FLAW ANALYSIS - Problem 3: Sentence Format

#### Flaw 3.1: Sentence Template Simplicity
**Issue**: Templates are very simple and might not handle all cases well.

**Analysis**:
- Template: `"A ${tags} scene."` - works for simple cases
- But if tags is "forest, daytime, sunny" -> "A forest, daytime, sunny scene." (awkward)
- Templates don't handle pluralization, articles correctly for all cases
- No grammar rules for conjunctions ("and", "with")

**Fix**:
- Templates are a starting point
- Can be improved iteratively
- For complex cases, fallback to tag format might be better
- Consider: Should sentence format be optional/experimental initially?

#### Flaw 3.2: Token Count for Sentences
**Issue**: Sentences use more words (articles, conjunctions), so token count might be inaccurate.

**Analysis**:
- Token count is calculated from positiveTokens (tag format)
- If sentences are only in sections (display), token count is still accurate
- BUT: If we want to use sentence format for actual SD prompt, token count would be wrong
- Current design: sentences are display-only, positiveTokens stays as tags

**Fix**: 
- Current design is correct: sentences are display-only
- positiveTokens remains tag format for SD
- Token count accurate for actual prompt
- No change needed

#### Flaw 3.3: Sentence Format and Stable Diffusion
**Issue**: Sentence format might not work well with SD models (they prefer tags).

**Analysis**:
- SD models are trained on tag-based prompts
- Sentences might confuse the model or waste tokens
- Current design: sentences are display-only, positiveTokens (SD input) stays as tags
- This is correct approach

**Fix**: 
- Current design is correct: sentences are UI-only
- positiveTokens (copied to SD) remains tag format
- No change needed

#### Flaw 3.4: Format Mode State Management
**Issue**: Format mode state is in App component, but should it be in modelProfile?

**Analysis**:
- Current: formatMode as separate state, passed to modelProfile when calling engine
- Alternative: formatMode as part of modelProfile state
- Current approach: formatMode is UI preference, modelProfile is SD model config
- Separation is reasonable

**Fix**:
- Current approach is fine (formatMode as UI state)
- BUT: Consider saving formatMode preference (localStorage?)
- For now, session-only state is acceptable

#### Flaw 3.5: Sentence Formatter Module Complexity
**Issue**: Sentence formatter might be over-engineered for simple templates.

**Analysis**:
- Current implementation: template-based, simple
- Could be even simpler (just add templates directly in assembler)
- But separation into module is good for maintainability
- Can be improved incrementally

**Fix**:
- Module separation is good architecture
- Keep it simple for now (templates)
- Can enhance later with better grammar rules

#### Flaw 3.6: Section-to-Sentence Conversion
**Issue**: Converting sections (already comma-separated tags) to sentences might lose information.

**Analysis**:
- Current: formatFragmentsAsSentences can take sections (tag format) or fragments
- If taking sections, just wraps tags in template
- If taking fragments, groups by category first
- Both approaches work, but fragments approach is more flexible

**Fix**:
- Prefer using fragments directly (more flexible)
- Section conversion is fallback/convenience
- Current implementation supports both - this is fine

---

## FIXED IMPLEMENTATION NOTES

### Problem 1 Fixes Applied:
- **1.1**: **CRITICAL FIX** - Changed priority from 200 to 150 after discovering actual codebase values (subject=100, style=3, etc.). Priority system appears reversed from intuition. Must verify ordering after implementation.
- **1.3**: Note that single question node is acceptable for initial implementation (can be refined)
- **1.5**: Confirmed gerunds are correct format
- **1.6**: Confirmed category order placement is correct

### Problem 2 Fixes Applied:
- **2.1**: Add fallback handling for unmapped categories (log warning, skip or use category name)
- **2.7**: Note that hardcoded section order is acceptable (can be improved later)

### Problem 3 Fixes Applied:
- **3.1**: Note that templates are starting point, can be improved iteratively
- **3.2**: Confirmed current design (sentences display-only, tags for SD) is correct
- **3.3**: Confirmed current design (sentences UI-only) is correct
- **3.4**: Note that formatMode as UI state is acceptable (consider localStorage for persistence)

### Additional Notes Added:
- All implementations maintain backward compatibility
- Sections are optional and don't break existing code
- Sentence format is experimental and can be refined
- Token counting remains accurate (based on positiveTokens)

### CRITICAL DISCOVERY - Priority System:
- Actual priority values in codebase don't match documentation (README mentions 1-6, but data uses 3, 60, 65, 70, 100, etc.)
- Fragment orderer sorts ASCENDING (lower numbers first)
- This means style (3) appears BEFORE subject (100) in prompts
- Actions priority set to 150 as compromise - MUST VERIFY ordering after implementation
- Consider reviewing priority system for consistency

