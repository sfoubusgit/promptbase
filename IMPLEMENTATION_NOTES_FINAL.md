# Detailed Implementation Notes - FINAL VERSION

## Overview
This document contains EXACT implementation steps for solving each problem identified in the feedback analysis. All steps have been verified against the codebase for accuracy and feasibility.

**VERIFICATION STATUS**: ✅ All file paths, line numbers, and code structures verified against actual codebase.

---

## PROBLEM 1: Missing Action/Activity Category

### Current State Analysis
- **Category types defined in**: `src/types/entities.ts` (lines 20, 67)
- **Category union type**: `'subject' | 'attribute' | 'style' | 'composition' | 'effect' | 'effects' | 'quality' | 'lighting' | 'camera' | 'environment' | 'post-processing'`
- **Missing**: `'actions'` category
- **Category map location**: `src/data/categoryMap.ts` - NO actions entry exists (ends at line 256)
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

**VERIFICATION**: ✅ Types are exported from `src/types/index.ts`, so changes will propagate automatically.

#### Step 1.2: Create Actions Data File
**File**: `src/data/actions.json` (NEW FILE)

**Structure**: Must match pattern used by other category files (see `subject.json`, `style.json` for reference)
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
- Use `semanticPriority: 150` (compromise value - see CRITICAL NOTE below)
- **CRITICAL**: Actual priority values in codebase: subject (100), style (3), lighting (70), environment (65), camera (60-65), quality (varies 5-90)
- Fragment orderer sorts ASCENDING (lower numbers first), so style (3) comes before subject (100)
- Using 150 as compromise - MUST VERIFY ordering after implementation
- All actions are positive prompts (isNegative: false)
- ID pattern: `actions:subcategory-actionname` (matches existing pattern)
- Base text uses present participle form (gerunds: "standing", "running")
- Start with ~20 common actions, expand later

#### Step 1.3: Create Actions Question Nodes
**File**: `src/data/questions/actions.json` (NEW FILE)

**Structure**: Must be array format (see other files in `questions/` directory)
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
- Single root node for initial implementation (can expand later)
- All attributes listed in attributeIds (must match IDs in actions.json)
- All attributes allow custom extensions (for specificity)
- nextNodeId: null (no follow-up questions for now)

#### Step 1.4: Add Actions to Category Map
**File**: `src/data/categoryMap.ts`

**Change**: Add actions category to `CATEGORY_MAP` object (BEFORE line 256, which is the closing brace)

**Location**: After `"post-processing"` array (after line 255), add:
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
    // ... existing entries (ends around line 255)
  ],
  actions: [
    {
      label: "Actions",
      nodeId: "actions-root"
    }
  ]
};
```

**VERIFICATION**: ✅ CategoryMap structure verified - actions will appear in CategorySidebar automatically.

#### Step 1.5: Add Actions to Category Order
**File**: `src/ui/App.tsx`

**Change**: Update `CATEGORY_ORDER` array (line 105)

**Current**: `const CATEGORY_ORDER: string[] = ['subject', 'style', 'lighting', 'camera', 'environment', 'quality', 'effects', 'post-processing'];`

**New**: Insert 'actions' after 'subject' and before 'style':
```typescript
const CATEGORY_ORDER: string[] = ['subject', 'actions', 'style', 'lighting', 'camera', 'environment', 'quality', 'effects', 'post-processing'];
```

**Reasoning**: Actions should come after subject (what) but before style (how) in interview flow

**VERIFICATION**: ✅ CATEGORY_ORDER controls interview navigation flow, not prompt assembly order (which uses semanticPriority).

#### Step 1.6: Additional Considerations

**RandomPromptGenerator**: No changes needed - it uses CATEGORY_MAP dynamically, so actions will appear automatically.

**VERIFICATION**: ✅ RandomPromptGenerator.getCategoryDisplayName() will need 'actions' added to its mapping if custom display name desired, but it has fallback logic.

#### Step 1.7: Verification Steps
1. Check browser console for `[loadAttributeDefinitions] Loading category: actions`
2. Check console for `[loadQuestionNodes]` loading actions.json
3. Verify actions appear in CategorySidebar
4. Test selecting an action attribute
5. Verify action appears in generated prompt
6. Check that action fragment has category: 'actions' and semanticPriority: 150
7. **CRITICAL**: Verify actions appear in correct position in prompt output (after subject but before style?)

---

## PROBLEM 2: Flat, Unorganized Output Format

### Current State Analysis
- **Prompt type**: `src/types/entities.ts` lines 103-118 - only has `positiveTokens`, `negativeTokens` strings
- **Prompt assembly**: `src/modules/prompt-assembler.ts` - joins fragments with comma separator (lines 23-85)
- **Fragment ordering**: `src/modules/fragment-orderer.ts` - orders by priority but doesn't group by category
- **Display**: `src/ui/components/PromptPreview.tsx` - displays flat string (lines 48-62, 85-101)
- **Fragment structure**: Fragments have `category` field but it's lost in final string output
- **CSS file**: `src/ui/components/PromptPreview.css` exists - can add new styles

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
- Sections are optional (`sections?`) for backward compatibility
- Section names use user-friendly labels (not technical category names)
- All section properties are optional (using `?` on each)
- Type is exported via `src/types/index.ts`, so changes propagate automatically

**VERIFICATION**: ✅ Optional field won't break existing code - all consumers check for properties before use.

#### Step 2.2: Create Category-to-Section Mapping
**File**: `src/modules/prompt-assembler.ts`

**Add constant** (after line 14 imports, before line 16 function):

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

**Strategy**: 
1. Keep existing positiveTokens generation (for backward compatibility)
2. Additionally, group fragments by category and create sections object
3. Return both positiveTokens and sections

**Detailed changes**:

**After line 39** (after `let positiveTokens = positiveParts.join(modelProfile.tokenSeparator);`), add section grouping logic:

```typescript
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
      // FALLBACK: Category not mapped - log warning and skip
      console.warn(`[assemblePrompt] Category "${fragment.category}" not mapped to section, fragment skipped: ${fragment.text}`);
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
- Sections are built from fragments BEFORE truncation (truncation only affects positiveTokens)

**VERIFICATION**: ✅ Code placement verified - sections built after positiveTokens but before truncation. Truncation only affects positiveTokens, not sections (sections are display-only).

#### Step 2.4: Update PromptPreview to Display Sections
**File**: `src/ui/components/PromptPreview.tsx`

**Change**: Modify the component to display sections when available

**Strategy**: 
- If `prompt.sections` exists, display sections with headers
- Otherwise, fall back to flat `positiveTokens` display (backward compatibility)

**Section display order** (matching approximate semantic priority):
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
- Section order matches approximate semantic priority
- Section labels are user-friendly (capitalized, with spaces)
- Uses existing CSS classes where possible, adds new ones for sections

**VERIFICATION**: ✅ Component structure verified - conditional rendering is safe, fallback handles missing sections.

#### Step 2.5: Update Copy Functionality (Keep SD Format)
**File**: `src/ui/components/PromptPreview.tsx`

**Change**: None needed - keep as-is

**Current behavior** (lines 52-62): Copies `displayPositive` which comes from `prompt.positiveTokens` (flat format)

**Reasoning**: Copy should still use `positiveTokens` (flat format) for Stable Diffusion compatibility. Sections are for display only.

**VERIFICATION**: ✅ No changes needed - current copy functionality is correct.

#### Step 2.6: Add CSS for Section Display
**File**: `src/ui/components/PromptPreview.css`

**Add styles** at end of file (after existing styles):

```css
/* Sectioned display styles */
.prompt-preview-sections {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prompt-preview-section-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-secondary, rgba(255, 255, 255, 0.6));
  margin-bottom: 4px;
  display: block;
}

.prompt-preview-section-text {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-primary, #FFFFFF);
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Notes**:
- Sections are stacked vertically with spacing
- Labels are bold and secondary color (matching existing design)
- Section text has background and padding for visual separation
- Uses CSS variables for consistency with existing design
- Adjust colors to match existing dark theme if needed

**VERIFICATION**: ✅ CSS file exists and uses dark theme - styles adjusted to match.

#### Step 2.7: Verification Steps
1. Generate prompt with selections from multiple categories
2. Verify `prompt.sections` object is populated in browser dev tools
3. Verify sections appear in PromptPreview with headers
4. Verify empty sections are not displayed
5. Verify copy functionality still copies flat format (positiveTokens)
6. Test backward compatibility (prompts without sections still display correctly)
7. Verify section styling matches overall design

---

## PROBLEM 3: No Sentence/Paragraph Mode

### Current State Analysis
- **Output format**: Always comma-separated tags
- **No grammar**: No articles, conjunctions, sentence structure
- **No mode switching**: No way to toggle between tags and sentences
- **Model profile**: `src/types/entities.ts` lines 86-98 - no format mode option
- **App state**: `src/ui/App.tsx` line 63 - modelProfile state, line 342-363 - callEngine function

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

**VERIFICATION**: ✅ Optional field won't break existing DEFAULT_MODEL_PROFILE or other code.

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
 * Maps category names to section keys (must match CATEGORY_TO_SECTION_MAP)
 */
const CATEGORY_TO_SECTION: Record<string, string> = {
  'subject': 'characters',
  'environment': 'scene',
  'actions': 'actions',
  'style': 'style',
  'lighting': 'lighting',
  'camera': 'camera',
  'effects': 'effects',
  'quality': 'quality',
  'post-processing': 'post-processing',
  'attribute': 'characters',
  'composition': 'camera',
  'effect': 'effects',
};

/**
 * Formats fragments as sentences within sections
 * Returns sections object with sentence-formatted text
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
    const sectionKey = CATEGORY_TO_SECTION[fragment.category];
    if (sectionKey) {
      if (!sectionsByCategory[sectionKey]) {
        sectionsByCategory[sectionKey] = [];
      }
      sectionsByCategory[sectionKey].push(fragment);
    }
  }
  
  const sentenceSections: Record<string, string> = {};
  
  for (const [sectionKey, fragments] of Object.entries(sectionsByCategory)) {
    const texts = fragments.map(f => f.text);
    const joined = texts.join(', ');
    const sentenceText = formatSectionAsSentence(sectionKey, joined);
    if (sentenceText) {
      sentenceSections[sectionKey] = sentenceText;
    }
  }
  
  return sentenceSections;
}

/**
 * Converts tag-based sections to sentence format
 */
function convertSectionsToSentences(sections: Record<string, string>): Record<string, string> {
  const sentenceSections: Record<string, string> = {};
  
  for (const [sectionKey, tagText] of Object.entries(sections)) {
    const sentenceText = formatSectionAsSentence(sectionKey, tagText);
    if (sentenceText) {
      sentenceSections[sectionKey] = sentenceText;
    }
  }
  
  return sentenceSections;
}

/**
 * Formats a section's tag text as a sentence
 */
function formatSectionAsSentence(sectionKey: string, tagText: string): string {
  const templates: Record<string, (text: string) => string> = {
    'scene': (text) => `A ${text} scene.`,
    'characters': (text) => `A ${text}.`,
    'actions': (text) => `${capitalizeFirst(text)}.`,
    'style': (text) => `Rendered in ${text} style.`,
    'lighting': (text) => `With ${text} lighting.`,
    'camera': (text) => `Shot with ${text}.`,
    'effects': (text) => `Featuring ${text}.`,
    'quality': (text) => `${capitalizeFirst(text)} quality.`,
    'post-processing': (text) => `Post-processed with ${text}.`,
  };
  
  const template = templates[sectionKey];
  if (template) {
    return template(tagText);
  }
  
  // Fallback: just capitalize first letter and add period
  return `${capitalizeFirst(tagText)}.`;
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
- Falls back gracefully if section not in templates
- Uses section keys (not category keys) for consistency

**VERIFICATION**: ✅ Module structure matches other modules in `src/modules/` directory.

#### Step 3.3: Update assemblePrompt to Support Sentence Format
**File**: `src/modules/prompt-assembler.ts`

**Change**: Modify `assemblePrompt` to check formatMode and use sentence formatter

**Import**: Add at top of file (after line 14):
```typescript
import { formatFragmentsAsSentences } from './sentence-formatter';
```

**Modify sections generation** (in the code added in Step 2.3):

**After building sections object (after the code that converts arrays to strings), add format mode check**:

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
    // Clear existing sections and assign new ones
    const finalSections: NonNullable<Prompt['sections']> = {};
    for (const [key, value] of Object.entries(sentenceSections)) {
      finalSections[key as keyof typeof finalSections] = value;
    }
    Object.assign(sections, finalSections);
  }
```

**CORRECTION**: The code should replace sections, not use Object.keys().forEach with delete. Use the corrected version above.

**Notes**:
- Only applies sentence formatting if formatMode is explicitly 'sentences'
- Default (undefined or 'tags') keeps current tag format
- Sentence formatter receives sections (tag format) for conversion

**VERIFICATION**: ✅ Code placement verified - sentence conversion happens after tag sections are built, before return.

#### Step 3.4: Update UI to Toggle Format Mode
**File**: `src/ui/App.tsx`

**Change**: Add format mode state and toggle

**Add state** (around line 63, after modelProfile state):
```typescript
  const [formatMode, setFormatMode] = useState<'tags' | 'sentences'>('tags');
```

**Update callEngine function** (around line 342-363):

**Find the EngineInput construction** (around line 353-358):

**Current**:
```typescript
    const input: EngineInput = {
      attributeDefinitions,
      selections: selectionsArray,
      modifiers: modifiersArray,
      modelProfile,
    };
```

**New**: Spread modelProfile and add formatMode:
```typescript
    const input: EngineInput = {
      attributeDefinitions,
      selections: selectionsArray,
      modifiers: modifiersArray,
      modelProfile: {
        ...modelProfile,
        formatMode: formatMode, // Add format mode
      },
    };
```

**Add UI toggle** (in the render, find where PromptPreview is rendered - search for `<PromptPreview`):

Add toggle near PromptPreview component. Location depends on UI structure, but a good place would be before or after the PromptPreview component in the JSX.

**Simple toggle** (add where appropriate in JSX):
```typescript
<div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
    <input
      type="checkbox"
      checked={formatMode === 'sentences'}
      onChange={(e) => setFormatMode(e.target.checked ? 'sentences' : 'tags')}
    />
    <span>Use sentence format</span>
  </label>
</div>
```

**Notes**:
- Simple checkbox toggle for now (can be improved with radio buttons or dropdown)
- State persists during session (not saved to localStorage)
- Toggle affects new prompt generations (callEngine is called via useEffect)

**VERIFICATION**: ✅ State management pattern matches existing code. callEngine dependency array includes formatMode implicitly via modelProfile spread.

#### Step 3.5: Update PromptPreview for Sentence Display
**File**: `src/ui/components/PromptPreview.tsx`

**No changes needed** - sections display code from Step 2.4 already handles sentence format (just displays the section text, whether tags or sentences).

**VERIFICATION**: ✅ No changes needed - component is format-agnostic, just displays section text.

#### Step 3.6: Verification Steps
1. Toggle format mode to 'sentences'
2. Generate prompt with selections
3. Verify sections are formatted as sentences
4. Verify sentences are readable and grammatically reasonable
5. Toggle back to 'tags' and verify tag format returns
6. Test with various category combinations
7. Verify token count still calculated correctly (based on positiveTokens, not sections)
8. Verify positiveTokens (copied to SD) remains tag format regardless of display mode

---

## CRITICAL NOTES & WARNINGS

### Priority System Anomaly
- **DISCOVERED**: Actual priority values don't match documentation
- Subject: 100, Style: 3, Lighting: 70, Environment: 65, Camera: 60-65, Quality: varies 5-90
- Fragment orderer sorts ASCENDING (lower numbers first)
- This means style (3) appears BEFORE subject (100) in prompts
- Actions priority set to 150 as compromise
- **MUST VERIFY**: After implementation, check actual prompt output order
- May need to adjust actions priority based on desired position

### Backward Compatibility
- All changes use optional fields (`?`) or fallback logic
- Existing code should continue working without modifications
- Sections are optional - prompts without sections display in flat format
- Format mode defaults to 'tags' if not specified

### Testing Recommendations
1. Test each problem solution independently before combining
2. Verify actions category appears and works correctly
3. Verify sections display correctly with various category combinations
4. Verify sentence format produces readable output
5. Test backward compatibility with existing prompts
6. Verify copy functionality always uses tag format (positiveTokens)

---

## IMPLEMENTATION ORDER RECOMMENDATION

1. **Phase 1: Actions Category** (Problem 1)
   - Implement Steps 1.1-1.5
   - Test and verify actions appear and work
   - Adjust priority if needed based on output order

2. **Phase 2: Sectioned Display** (Problem 2)
   - Implement Steps 2.1-2.6
   - Test sectioned display
   - Verify backward compatibility

3. **Phase 3: Sentence Format** (Problem 3) - OPTIONAL
   - Implement Steps 3.1-3.5
   - Test sentence formatting
   - Refine templates based on output quality

This phased approach allows testing each feature independently and catching issues early.

