# Phase 1 Execution Plan: Structured Copy Output

## Goal
Enable structured, human-readable prompt output in copy functionality through formatting only, without changing the data model.

---

## Current State Summary

### What Already Exists
- ✅ `prompt.sections` object is built in `prompt-assembler.ts` (lines 60-89)
- ✅ Sections contain properly grouped and formatted content
- ✅ Display already shows sections in UI (`PromptPreview.tsx` lines 86-112)
- ✅ Section keys: `'scene'`, `'characters'`, `'actions'`, `'style'`, `'lighting'`, `'camera'`, `'effects'`, `'quality'`, `'post-processing'`

### What Needs Change
- ❌ Copy handler (`handleCopy` in `PromptPreview.tsx` lines 52-62) uses flat `positiveTokens`
- ❌ Copy output ignores `prompt.sections` structure

---

## 1. Components Requiring Adjustment

### Single File: `src/ui/components/PromptPreview.tsx`

**Location:** Lines 52-62 (`handleCopy` function)

**Current Logic:**
```typescript
const handleCopy = () => {
  if (displayPositive) {
    const fullPrompt = displayNegative
      ? `${displayPositive}\n\nNegative prompt: ${displayNegative}`
      : displayPositive;
    navigator.clipboard.writeText(fullPrompt).catch(() => {});
    onCopy?.();
  }
};
```

**Required Change:**
- Replace flat `positiveTokens` usage with formatted sections
- Add formatting logic that uses `prompt.sections` if available
- Fallback to flat format if sections don't exist (backward compatibility)

**Impact:** 
- Only affects copy output formatting
- No changes to data flow, assembly logic, or data model
- No UI component changes beyond copy handler

---

## 2. Formatted Output Template

### Template Structure

```
POSITIVE PROMPT:

[Section Header 1]:
[section content, comma-separated]

[Section Header 2]:
[section content, comma-separated]

[Section Header 3]:
[section content, comma-separated]

NEGATIVE PROMPT:
[negative prompt content]
```

### Section Header Mapping

Map existing section keys to reference-style headers:

| Section Key | Reference Header | Notes |
|------------|------------------|-------|
| `'characters'` | `"Subject & Characters:"` | Combined subject + characters |
| `'scene'` | `"Environment:"` | Environment/setting |
| `'actions'` | `"Actions:"` | Character actions |
| `'style'` | `"Style & Medium:"` | Art style and medium |
| `'lighting'` | `"Lighting:"` | Lighting setup |
| `'camera'` | `"Camera:"` | Camera/composition |
| `'effects'` | `"Atmosphere & Effects:"` | Effects and atmosphere |
| `'quality'` | `"Quality:"` | Quality descriptors |
| `'post-processing'` | `"Post-Processing:"` | Post-processing effects |

### Section Order Priority

Order sections to match semantic importance (as defined by fragment ordering):

1. Subject & Characters (highest priority)
2. Actions
3. Environment
4. Style & Medium
5. Lighting
6. Camera
7. Atmosphere & Effects
8. Quality
9. Post-Processing (lowest priority)

---

## 3. Token-to-Section Mapping

### Existing Mapping (Already Implemented)

The `CATEGORY_TO_SECTION_MAP` in `prompt-assembler.ts` (lines 19-33) already maps fragments to sections:

```typescript
'subject' → 'characters'
'environment' → 'scene'
'actions' → 'actions'
'anatomy-details' → 'characters'
'style' → 'style'
'lighting' → 'lighting'
'camera' → 'camera'
'effects' → 'effects'
'quality' → 'quality'
'post-processing' → 'post-processing'
'attribute' → 'characters'
'composition' → 'camera'
'effect' → 'effects'
```

### Section Content Format

Each section in `prompt.sections` already contains:
- Comma-separated tokens (same format as `positiveTokens`)
- Weight formatting applied (if weights are enabled)
- Properly formatted text ready for output

**Example:**
- `prompt.sections.characters` = `"fairy, woman, fantasy character, single subject"`
- `prompt.sections.style` = `"anime-inspired illustration, cinematic realism, contemporary fine art painting"`
- `prompt.sections.lighting` = `"three-quarter lighting, balanced lighting, warm light, cinematic lighting"`

**No additional mapping needed** - sections already contain correctly formatted content.

---

## 4. Stable Diffusion Compatibility Preservation

### Strategy: Dual Format Support

**Approach:** Format sections for copy, but preserve flat `positiveTokens` for potential SD use.

### Compatibility Measures

1. **Format Selection:**
   - If `prompt.sections` exists → use structured format for copy
   - If `prompt.sections` is missing → fallback to flat `positiveTokens`
   - This ensures backward compatibility

2. **Content Preservation:**
   - Structured format uses **same token content** as flat format
   - Only adds headers and line breaks (formatting only)
   - Section content remains comma-separated (SD-compatible)

3. **No Loss of Information:**
   - All tokens from `positiveTokens` are present in sections
   - Same weight formatting applied
   - Same token separator used

### Example Comparison

**Flat Format (Current):**
```
anime-inspired illustration, cinematic realism, fairy, woman, three-quarter lighting, outdoor environment

Negative prompt: deformed anatomy
```

**Structured Format (New Copy Output):**
```
POSITIVE PROMPT:

Subject & Characters:
fairy, woman

Style & Medium:
anime-inspired illustration, cinematic realism

Lighting:
three-quarter lighting

Environment:
outdoor environment

NEGATIVE PROMPT:
deformed anatomy
```

**Stable Diffusion Compatibility:**
- Both formats contain identical tokens
- SD can parse either format (SD ignores line breaks and headers)
- User can manually extract tokens if needed
- Structured format improves human readability without breaking SD

---

## 5. Implementation Steps (Minimal Increments)

### Step 1: Define Section Header Mapping Constant

**File:** `src/ui/components/PromptPreview.tsx`

**Action:** Add constant after imports (around line 19-20)

```typescript
/**
 * Maps section keys to reference-style headers for structured output
 */
const SECTION_HEADER_MAP: Record<string, string> = {
  'characters': 'Subject & Characters',
  'actions': 'Actions',
  'scene': 'Environment',
  'style': 'Style & Medium',
  'lighting': 'Lighting',
  'camera': 'Camera',
  'effects': 'Atmosphere & Effects',
  'quality': 'Quality',
  'post-processing': 'Post-Processing',
};

/**
 * Section display order (matching semantic priority)
 */
const SECTION_ORDER: Array<keyof typeof SECTION_HEADER_MAP> = [
  'characters',
  'actions',
  'scene',
  'style',
  'lighting',
  'camera',
  'effects',
  'quality',
  'post-processing',
];
```

**Verification:** Constants defined, no runtime impact.

---

### Step 2: Create Formatting Helper Function

**File:** `src/ui/components/PromptPreview.tsx`

**Action:** Add helper function before `handleCopy` (around line 50-51)

```typescript
/**
 * Formats prompt sections into structured, human-readable output
 * Returns formatted string or null if sections unavailable
 */
const formatStructuredPrompt = (prompt: any): string | null => {
  if (!prompt?.sections || Object.keys(prompt.sections).length === 0) {
    return null; // Fallback to flat format
  }

  const lines: string[] = ['POSITIVE PROMPT:', ''];

  // Iterate sections in priority order
  for (const sectionKey of SECTION_ORDER) {
    const sectionContent = prompt.sections[sectionKey];
    if (sectionContent && sectionContent.trim()) {
      const header = SECTION_HEADER_MAP[sectionKey];
      lines.push(`${header}:`);
      lines.push(sectionContent);
      lines.push(''); // Empty line between sections
    }
  }

  // Remove trailing empty line
  if (lines[lines.length - 1] === '') {
    lines.pop();
  }

  return lines.join('\n');
};
```

**Verification:** Function returns formatted string when sections exist, null otherwise.

---

### Step 3: Update Copy Handler

**File:** `src/ui/components/PromptPreview.tsx`

**Action:** Replace `handleCopy` function (lines 52-62)

```typescript
const handleCopy = () => {
  if (!prompt || !('positiveTokens' in prompt)) {
    return;
  }

  // Try structured format first (if sections available)
  const structuredFormat = formatStructuredPrompt(prompt);
  const positiveText = structuredFormat || prompt.positiveTokens;

  // Build full prompt with negative
  const negativeText = prompt.negativeTokens || '';
  const fullPrompt = negativeText
    ? `${positiveText}\n\nNEGATIVE PROMPT:\n${negativeText}`
    : positiveText;

  navigator.clipboard.writeText(fullPrompt).catch(() => {
    // Silent fail - copy functionality is optional
  });
  onCopy?.();
};
```

**Verification:** 
- Copy uses structured format when sections exist
- Falls back to flat format when sections missing
- Negative prompt properly formatted

---

### Step 4: Test Edge Cases

**Test Cases:**

1. **Sections Available:**
   - Copy prompt with sections → structured output
   - Verify all sections appear in correct order
   - Verify headers match mapping

2. **No Sections (Backward Compatibility):**
   - Copy prompt without sections → flat output
   - Verify fallback works correctly

3. **Empty Sections:**
   - Copy prompt with empty sections object → flat output
   - Verify empty sections are skipped

4. **Partial Sections:**
   - Copy prompt with only some sections → structured output with available sections
   - Verify missing sections don't break formatting

5. **Negative Prompt:**
   - Verify negative prompt formatted correctly in both cases
   - Check "NEGATIVE PROMPT:" header appears

---

## Implementation Checklist

- [ ] **Step 1:** Add `SECTION_HEADER_MAP` and `SECTION_ORDER` constants
- [ ] **Step 2:** Add `formatStructuredPrompt` helper function
- [ ] **Step 3:** Update `handleCopy` to use structured formatting
- [ ] **Step 4:** Test all edge cases
- [ ] **Verification:** Copy output matches reference format structure
- [ ] **Verification:** Flat format fallback works when sections unavailable
- [ ] **Verification:** Stable Diffusion compatibility preserved (tokens unchanged)

---

## Success Criteria

✅ Copy output uses structured format when sections are available  
✅ Copy output falls back to flat format when sections are missing  
✅ Section headers match reference format style  
✅ Sections appear in semantic priority order  
✅ Negative prompt properly formatted  
✅ No data model changes  
✅ No changes to prompt assembly logic  
✅ No UI component changes beyond copy handler  
✅ Stable Diffusion compatibility maintained  

---

## Scope Boundaries

### Included
- Copy handler formatting logic
- Section header mapping
- Structured output template

### Excluded (Not in Phase 1)
- Data model changes
- Prompt assembly logic changes
- UI component redesign
- Format selection toggle/dropdown
- Multiple output format support
- Skip button fix (separate issue)

---

## Risk Mitigation

### Risk: Breaking Existing Workflows
**Mitigation:** Fallback to flat format ensures backward compatibility

### Risk: Stable Diffusion Incompatibility
**Mitigation:** Structured format uses same tokens; SD ignores line breaks

### Risk: Section Order Discrepancy
**Mitigation:** Use explicit `SECTION_ORDER` array matching semantic priority

### Risk: Missing Section Headers
**Mitigation:** Only map known sections; skip unmapped sections gracefully

---

## Estimated Complexity

- **Files Changed:** 1 (`PromptPreview.tsx`)
- **Lines Added:** ~50-60
- **Lines Modified:** ~10 (copy handler)
- **Risk Level:** Low (isolated change, fallback support)
- **Testing Effort:** Low (copy functionality only)

---

## Next Steps After Phase 1

Once Phase 1 is complete and validated, consider:
- User feedback on structured format
- Option to add format selector (flat vs structured)
- Skip button fix (separate issue)
- Enhanced section label customization


