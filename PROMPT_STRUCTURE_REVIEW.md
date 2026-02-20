# Prompt Structure Review & Analysis

## Overview

This document analyzes user feedback regarding two critical issues in the prompt generation system:
1. **Skip button functionality failure**
2. **Flat, unstructured prompt output** that lacks semantic organization

The analysis compares the current implementation against a reference structured prompt format and identifies architectural gaps without proposing specific code changes. This serves as a planning document to align stakeholders before implementation.

---

## Summary of Critique

### User Feedback

**Extracted Critique:**
- "Prompt structure looks nice."
- "Skip button does not work."

**Assembled Prompt (Current Output):**
```
"anime-inspired illustration, cinematic realism, contemporary fine art painting, digital illustration, fantasy cinematic style, fantasy art style, dreamy blur, three-quarter lighting, outdoor environment, haze, balanced lighting, natural wilderness setting, energy particles, warm light, volumetric light rays, cinematic lighting, table, high quality, eagle, big breasts, erect nipples, fairy, woman, fantasy character, single subject, hands on hips, looking at viewer bending forward, pointing at viewer

Negative prompt: deformed anatomy, extra limbs"
```

### Core Complaints Analysis

#### 1. Flat Prompt Structure
**Observation:** All attributes are joined in a single comma-separated list with no semantic grouping.

**Implicit Expectations:**
- User expects semantic categories (Subject, Style, Lighting, etc.) to be visually separated
- User expects descriptive labels for each category group
- User expects logical grouping that reflects their mental model of image composition

**Issues Identified:**
- All tokens appear in equal priority (no visual hierarchy)
- Related concepts are scattered (e.g., "warm light" and "cinematic lighting" separated by unrelated tokens)
- Difficult to verify what was selected in each category
- Poor readability and intent clarity

#### 2. Skip Button Non-Functionality
**Observation:** The Skip button exists but does not navigate when clicked.

**Implicit Expectations:**
- Skip should move to the next question/category without requiring selections
- Skip should be available when user wants to bypass optional questions
- Skip should follow the same navigation flow as Next button

**Issues Identified:**
- Skip handler (`handleNavigateSkip`) uses deprecated `nextNodeId` property
- Current navigation system uses sequential subcategory navigation (`getNextSubcategoryNodeId`)
- Skip button logic is disconnected from the active navigation mechanism

---

## Reference Structured Prompt Analysis

### Provided Reference Format

```
POSITIVE PROMPT:

Subject & Characters:
a single fantasy female fairy character, adult woman, big breasts, erect nipples, standing confidently, hands on hips, bending forward slightly, pointing directly at the viewer, maintaining direct eye contact, expressive posture, clearly readable anatomy

Additional Elements:
a wooden table nearby, an eagle present in the scene as a symbolic fantasy element

Environment:
outdoor environment, natural wilderness setting, open fantasy landscape, unobstructed background, organic natural surroundings

Style & Medium:
anime-inspired illustration blended with cinematic realism, contemporary fine art painting aesthetics, high-end digital illustration, fantasy cinematic art style, fantasy art

Lighting:
cinematic three-quarter lighting, balanced lighting setup, warm light tones, soft yet dramatic illumination

Atmosphere & Effects:
light haze in the air, subtle energy particles floating, volumetric light rays passing through the scene

Post-Processing & Quality:
dreamy blur effect, high quality, detailed rendering, clean composition, visually coherent fantasy artwork

NEGATIVE PROMPT:
deformed anatomy, extra limbs
```

### Structural Model Implications

#### 1. Semantic Grouping
- **Categories are explicit:** Each section has a descriptive header
- **Logical organization:** Related concepts are grouped together
- **Hierarchical structure:** Major categories (Subject, Environment, Style) are separated from subcategories

#### 2. Labeling Strategy
- **Descriptive labels:** "Subject & Characters", "Style & Medium", "Atmosphere & Effects"
- **User-friendly terminology:** Labels use natural language, not technical category IDs
- **Intent clarity:** Labels communicate what each section represents conceptually

#### 3. Content Organization
- **Complete sentences within sections:** Each section can contain descriptive phrases, not just keywords
- **Contextual grouping:** Related modifiers are placed together (e.g., all lighting terms in "Lighting" section)
- **Readability priority:** Structure prioritizes human understanding over token parsing

#### 4. Contrast with Current Flat Output

**Current System:**
- Single comma-separated string
- No visual separation between categories
- No descriptive labels
- Semantic information (category) is lost in output

**Reference Standard:**
- Multi-section structure with headers
- Clear visual separation
- Descriptive category labels
- Semantic grouping preserved in output

### Quality Signals the User Values

1. **Readability:** Structure that allows quick scanning and verification
2. **Semantic Coherence:** Related concepts grouped together logically
3. **Intent Clarity:** Clear indication of what each section represents
4. **Maintainability:** Easy to identify and modify specific aspects of the prompt
5. **Professional Presentation:** Structured format suitable for sharing or documentation

---

## Current System Behavior

### Architecture Overview

The system follows a modular pipeline architecture:

```
User Selections → Fragment Generation → Fragment Processing → Fragment Ordering → Prompt Assembly → Display/Copy
```

### Key Components Analysis

#### 1. Data Model (`src/types/entities.ts`)

**Current Structure:**
- `PromptFragment` contains `category` field (preserved through pipeline)
- `Prompt` interface includes:
  - `positiveTokens: string` (flat comma-separated output)
  - `sections?: { ... }` (optional structured sections for display)
  - `negativeTokens: string`

**Key Finding:** The system **does** have a `sections` object in the `Prompt` type, but:
- Sections are only used for UI display in `PromptPreview`
- Copy functionality uses `positiveTokens` directly, ignoring sections
- Sections exist but are not reflected in copied output

#### 2. Prompt Assembly (`src/modules/prompt-assembler.ts`)

**Current Behavior:**
- Line 46-58: Builds `positiveTokens` as flat comma-separated string
- Line 60-89: Builds `sections` object by grouping fragments by category
- Line 19-33: Maps technical category IDs to user-friendly section names

**Key Findings:**
- **Semantic grouping exists internally** but is only used for display
- `CATEGORY_TO_SECTION_MAP` maps categories to sections (e.g., 'subject' → 'characters')
- Sections are built with same formatting as `positiveTokens` (weight syntax, token separator)
- Both `positiveTokens` and `sections` are built from the same fragments

**Critical Gap:** Copy functionality bypasses the structured `sections` data and uses flat `positiveTokens` string instead.

#### 3. Fragment Ordering (`src/modules/fragment-orderer.ts`)

**Current Behavior:**
- Sorts fragments by `semanticPriority` (ascending)
- Maintains selection order within same priority (stable sort)
- Separates positive and negative fragments

**Key Finding:** Ordering preserves semantic priority, but this priority information is lost when fragments are flattened into a single string.

#### 4. Display vs Copy Disconnect (`src/ui/components/PromptPreview.tsx`)

**Current Behavior:**
- Line 86-112: Displays sections if `prompt.sections` exists (structured view)
- Line 114-120: Falls back to flat format if sections don't exist
- Line 52-62: **Copy handler uses `positiveTokens` directly**, ignoring sections structure

**Key Finding:** 
- **Visual display shows sections** (if available)
- **Copy output is flat** (always uses `positiveTokens`)
- This creates a **mismatch between what user sees and what they get**

#### 5. Navigation System (`src/ui/App.tsx`)

**Current Navigation Architecture:**
- Line 608-628: `handleNavigateNext` uses `getNextSubcategoryNodeId` for sequential navigation
- Line 634-639: `handleNavigateSkip` uses deprecated `currentNode?.nextNodeId` property
- Line 132-155: `getAllSubcategoryNodeIds` builds sequential list of all subcategories

**Key Findings:**
- **Skip button logic is outdated:** Uses old `nextNodeId` approach instead of sequential navigation
- **Next button works correctly:** Uses `getNextSubcategoryNodeId` which follows sequential flow
- **Skip handler is disconnected:** Doesn't use the same navigation mechanism as Next button

### Data Flow Analysis

#### Prompt Generation Flow

1. **Selection → Fragment Generation:**
   - User selects attributes → `AttributeSelection[]`
   - `generateFragments()` converts selections to `PromptFragment[]`
   - Fragments retain `category` and `semanticPriority` fields

2. **Fragment Processing:**
   - `applyModifiers()` adds weights to fragments
   - `orderFragments()` sorts by priority, maintains order

3. **Prompt Assembly:**
   - `assemblePrompt()` builds **two outputs:**
     - `positiveTokens`: Flat string (used for copying)
     - `sections`: Structured object (used for display only)

4. **Display vs Copy:**
   - **Display:** Uses `sections` if available (structured view)
   - **Copy:** Uses `positiveTokens` (flat string, loses structure)

**Semantic Flattening Point:** Structure is lost at the copy step, not during assembly.

---

## Identified Gaps

### Gap 1: Copy Functionality Ignores Structured Sections

**Problem Statement:**
The copy functionality in `PromptPreview.tsx` uses `positiveTokens` (flat string) instead of `sections` (structured object), causing a disconnect between displayed format and copied output.

**Root Cause:**
- Copy handler (`handleCopy`) directly accesses `displayPositive` which comes from `prompt.positiveTokens`
- Sections data exists in `prompt.sections` but is not used for copying
- Design decision prioritizes Stable Diffusion compatibility (flat format) over structured readability

**Impact:**
- User sees structured sections in UI but gets flat string when copying
- Violates user expectation of "what you see is what you get"
- Structured prompt data exists but is wasted

**Architectural Implications:**
- Sections are built but treated as "display-only"
- No mechanism to copy structured format
- Could support multiple output formats (flat for SD, structured for readability)

### Gap 2: Skip Button Uses Deprecated Navigation Logic

**Problem Statement:**
Skip button handler (`handleNavigateSkip`) uses `currentNode.nextNodeId` which is part of the old navigation system, while the active navigation mechanism uses sequential subcategory navigation.

**Root Cause:**
- Navigation system migrated from `nextNodeId`-based to sequential subcategory navigation
- Skip handler was not updated during migration
- Skip button checks for `nextNodeId` which may not exist or may be incorrect

**Impact:**
- Skip button appears functional but does nothing when clicked
- User cannot bypass questions as expected
- Navigation inconsistency between Next and Skip buttons

**Architectural Implications:**
- Need to align Skip handler with sequential navigation mechanism
- Should reuse `getNextSubcategoryNodeId` logic (same as Next button)
- May need to consider Skip-specific behavior (e.g., marking questions as "skipped" vs "completed")

### Gap 3: Semantic Structure Not Preserved in Output Format

**Problem Statement:**
While fragments contain category information and sections are built during assembly, the final output format (especially copied format) flattens all semantic structure into a single string.

**Root Cause:**
- Design prioritizes Stable Diffusion compatibility (flat comma-separated format)
- Sections are treated as UI-only metadata
- No mechanism to output structured format for user consumption

**Impact:**
- Loss of semantic grouping in copied output
- Difficult for users to understand prompt organization
- Poor readability for complex prompts

**Architectural Implications:**
- Need to support multiple output formats:
  - Flat format (for Stable Diffusion)
  - Structured format (for human readability)
  - Hybrid format (structured with copy-paste compatibility)
- Consider format selection mechanism (toggle, separate copy buttons, etc.)

### Gap 4: Category-to-Section Mapping May Not Match User Mental Model

**Problem Statement:**
The `CATEGORY_TO_SECTION_MAP` in `prompt-assembler.ts` maps technical category IDs to section names, but this mapping may not align with the user's reference structure (e.g., "Subject & Characters" vs "characters").

**Root Cause:**
- Mapping is hardcoded and technical
- User reference shows more descriptive, combined labels (e.g., "Subject & Characters", "Style & Medium")
- Current mapping is one-to-one (category → section), but user expects some categories to be combined

**Impact:**
- Section labels may not match user expectations
- Some semantic relationships may be lost (e.g., "Subject" and "Characters" as separate concepts)
- Inconsistent with reference format provided by user

**Architectural Implications:**
- Need to review category-to-section mapping
- Consider more descriptive section labels
- May need multi-category mapping (multiple categories → one section)

### Gap 5: No Mechanism to Format Sections with Headers in Copy Output

**Problem Statement:**
Even if sections data is used for copying, there's no formatting logic to add section headers (like "Subject & Characters:") before each section's content.

**Root Cause:**
- Sections object contains only content (comma-separated strings)
- No header/label information stored with sections
- Copy handler would need additional formatting logic

**Impact:**
- Structured sections would still lack descriptive labels in copied output
- Would not match reference format even if sections were used

**Architectural Implications:**
- Need section label metadata (either in Prompt type or formatting logic)
- Formatting logic must combine labels with content
- Consider reusable formatting functions for different output styles

---

## Proposed Solution Directions

### Solution Direction 1: Dual-Format Copy Mechanism

**Title:** Enable Structured Copy While Maintaining Flat Format Compatibility

**High-Level Approach:**
- Add format selector (toggle or dropdown) in PromptPreview component
- Implement two copy handlers:
  - "Copy Flat" (current behavior, uses `positiveTokens`)
  - "Copy Structured" (new, formats `sections` with headers)
- Format structured sections with descriptive headers matching reference format
- Default to flat format for backward compatibility

**Expected Benefits:**
- Users can choose output format based on need
- Maintains Stable Diffusion compatibility (flat format)
- Provides structured format for readability
- No breaking changes to existing behavior

**Trade-offs:**
- Requires UI addition (format selector)
- Two copy mechanisms increase complexity
- Users must understand format options

**Complexity:** Medium

**Primary Area Affected:** UX / Output Formatting

---

### Solution Direction 2: Structured-By-Default Copy with Format Option

**Title:** Use Sections for Copy by Default, Provide Flat Format Option

**High-Level Approach:**
- Modify copy handler to use `sections` by default
- Format sections with headers and newlines
- Add "Copy for Stable Diffusion" button for flat format
- Format structured output to match reference style

**Expected Benefits:**
- Matches user expectation (what you see is what you copy)
- Structured format improves readability
- Still supports flat format when needed
- Aligns with reference format

**Trade-offs:**
- Requires manual formatting in copy handler
- May need to parse sections back to flat if user needs it
- Could confuse users expecting flat format by default

**Complexity:** Medium

**Primary Area Affected:** UX / Output Formatting

---

### Solution Direction 3: Smart Format Detection in Copy Handler

**Title:** Automatically Format Structured Output Based on Sections Presence

**High-Level Approach:**
- Modify copy handler to check if `prompt.sections` exists
- If sections exist: format with headers and use sections
- If sections don't exist: fall back to flat `positiveTokens`
- Format structured output inline in copy handler

**Expected Benefits:**
- Automatic format selection
- Backward compatible (handles prompts without sections)
- No UI changes required
- Simple implementation

**Trade-offs:**
- No user control over format
- Formatting logic in UI component (could be moved to formatter utility)
- Assumes structured format is always preferred

**Complexity:** Low to Medium

**Primary Area Affected:** Output Formatting

---

### Solution Direction 4: Separate Formatter Module for Output Formats

**Title:** Extract Formatting Logic into Reusable Formatter Module

**High-Level Approach:**
- Create `prompt-formatter.ts` module with format functions:
  - `formatFlat(prompt: Prompt): string`
  - `formatStructured(prompt: Prompt): string`
  - `formatStructuredWithHeaders(prompt: Prompt): string`
- Update copy handler to use formatter module
- Allows multiple output formats without duplicating logic

**Expected Benefits:**
- Separation of concerns (formatting logic separate from UI)
- Reusable formatting functions
- Easy to add new formats in future
- Testable formatting logic

**Trade-offs:**
- Additional module to maintain
- Overhead for simple use cases
- Requires refactoring copy handler

**Complexity:** Medium

**Primary Area Affected:** Prompt Architecture / Output Formatting

---

### Solution Direction 5: Fix Skip Button with Sequential Navigation

**Title:** Align Skip Handler with Sequential Navigation Mechanism

**High-Level Approach:**
- Update `handleNavigateSkip` to use `getNextSubcategoryNodeId` (same as Next button)
- Remove dependency on `currentNode.nextNodeId`
- Reuse existing sequential navigation logic
- Ensure Skip follows same flow as Next

**Expected Benefits:**
- Skip button functions correctly
- Consistent navigation behavior
- Minimal code changes (reuse existing logic)
- Fixes immediate user complaint

**Trade-offs:**
- Skip and Next become functionally identical (may want different behavior)
- May need to track "skipped" state if that's a requirement

**Complexity:** Low

**Primary Area Affected:** UX

---

### Solution Direction 6: Enhanced Skip Button with Skip Tracking

**Title:** Skip Button with Explicit Skip State Management

**High-Level Approach:**
- Fix Skip navigation (use sequential navigation)
- Add skip state tracking (which questions were skipped)
- Store skipped question IDs for potential future use
- Optionally show skipped questions in UI or allow returning to them

**Expected Benefits:**
- Skip button functions correctly
- Tracks which questions were skipped
- Allows advanced features (e.g., "complete skipped questions")
- Better user control

**Trade-offs:**
- Additional state management complexity
- May be overkill if skip tracking isn't needed
- Requires UI to display skip state

**Complexity:** Medium

**Primary Area Affected:** UX / Data Model

---

### Solution Direction 7: Review and Enhance Category-to-Section Mapping

**Title:** Align Section Labels with User Mental Model

**High-Level Approach:**
- Review `CATEGORY_TO_SECTION_MAP` against user reference format
- Update section labels to match reference (e.g., "Subject & Characters" instead of "characters")
- Consider multi-category mappings (combine related categories)
- Add section label metadata to Prompt type if needed

**Expected Benefits:**
- Section labels match user expectations
- Better semantic grouping
- More intuitive structure
- Aligns with reference format

**Trade-offs:**
- Requires mapping review and updates
- May break existing display logic if section keys change
- Need to decide on exact label format

**Complexity:** Low to Medium

**Primary Area Affected:** Data Model / Prompt Architecture

---

## Risks & Trade-offs

### Risk 1: Breaking Stable Diffusion Compatibility

**Concern:** If structured format becomes default, users may accidentally copy formatted prompts that SD can't parse correctly.

**Mitigation:**
- Maintain flat format option
- Clearly label format types
- Test with actual SD models
- Consider auto-detecting format needs

### Risk 2: Format Preference Divergence

**Concern:** Different users may prefer different formats (some want structured, others want flat).

**Mitigation:**
- Provide format selection mechanism
- Store user preference
- Default to most common use case

### Risk 3: Increased Code Complexity

**Concern:** Adding multiple output formats increases maintenance burden.

**Mitigation:**
- Use formatter module to centralize logic
- Write tests for formatting functions
- Document format specifications clearly

### Risk 4: Skip Button Behavior Ambiguity

**Concern:** If Skip and Next become identical, user may be confused about difference.

**Mitigation:**
- Document Skip button behavior clearly
- Consider removing Skip if not needed
- Or add skip-specific behavior (tracking, visual indicators)

### Risk 5: Section Label Inconsistency

**Concern:** Section labels may not match all user mental models or reference formats.

**Mitigation:**
- Allow customizable section labels
- Use user-friendly terminology
- Test with multiple users for feedback

---

## Open Questions Before Implementation

### Question 1: Format Preference Strategy
**Question:** Should structured format be the default for copy, or should users choose?
**Considerations:**
- Most Stable Diffusion users expect flat format
- Structured format improves readability
- May need user research to determine preference

### Question 2: Section Label Format
**Question:** Should section labels match reference exactly ("Subject & Characters") or use simpler format ("Subject")?
**Considerations:**
- Reference uses combined labels ("Subject & Characters", "Style & Medium")
- Simpler labels may be clearer
- Need to validate with users

### Question 3: Skip Button Necessity
**Question:** Is Skip button still needed, or can Next button serve both purposes?
**Considerations:**
- Skip implies "optional question, skip it"
- Next implies "move forward"
- Different semantic meaning may be important

### Question 4: Multi-Format Support
**Question:** Should the system support exporting prompts in multiple formats (flat, structured, JSON, etc.)?
**Considerations:**
- JSON format could enable programmatic use
- Multiple formats increase complexity
- May be valuable for power users

### Question 5: Section Content Formatting
**Question:** Should sections contain descriptive phrases (like reference) or remain comma-separated keywords?
**Considerations:**
- Reference uses complete phrases
- Current system uses comma-separated keywords
- Balance between readability and SD compatibility

### Question 6: Negative Prompt Structure
**Question:** Should negative prompts also be structured, or remain flat?
**Considerations:**
- Reference shows flat negative prompt
- Negative prompts are typically shorter
- May not need structure

### Question 7: Backward Compatibility
**Question:** How important is maintaining exact `positiveTokens` format for existing integrations?
**Considerations:**
- May have automated systems using flat format
- Breaking changes could affect workflows
- Need to assess impact

---

## Conclusion

The analysis reveals that:
1. **Semantic structure exists internally** but is lost during copy operation
2. **Skip button is broken** due to outdated navigation logic
3. **Display and copy outputs are misaligned**, creating user confusion
4. **System architecture supports structured output** but prioritizes flat format for compatibility

The primary architectural decision needed is whether to:
- **Option A:** Add structured copy as an alternative format (maintain flat as default)
- **Option B:** Make structured copy the default (provide flat as alternative)
- **Option C:** Support multiple formats with user selection

Skip button fix is straightforward and should be prioritized regardless of format decisions.

---

**Document Status:** Planning/Alignment
**No Code Changes:** Analysis only
**Next Steps:** Stakeholder alignment on format strategy, then implementation planning


