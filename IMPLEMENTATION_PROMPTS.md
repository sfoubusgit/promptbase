# Implementation Prompts for V3.1 Changes

**Source of Truth**: FEEDBACK_ANALYSIS.md
**Based On**: User feedback requesting "action description" and "sentence like prompt, organized into sections like scene, characters, actions etc."

**Global Constraints**:
- No sentence-generation logic
- No NLP or grammar systems
- Stable Diffusion output must remain flat comma-separated string
- Section headers are DISPLAY-ONLY (never in copied prompt)
- Backward compatibility is mandatory

---

## PHASE 1: Actions Category (Data & Architecture)

### GOAL
Add a new "actions" category to the system, including type definitions, data files, question nodes, and navigation integration, enabling users to describe what characters/subjects are doing.

### SCOPE
- Add 'actions' to category union types in `src/types/entities.ts`
- Create `src/data/actions.json` with attribute definitions
- Create `src/data/questions/actions.json` with question nodes
- Add actions entry to `src/data/categoryMap.ts`
- Add 'actions' to `CATEGORY_ORDER` array in `src/ui/App.tsx`
- Use semanticPriority value of 150 (based on codebase analysis)

### OUT OF SCOPE
- Sentence formatting or grammar
- Changes to prompt assembly logic
- UI display changes
- Section grouping
- Any features beyond basic category addition

### EXACT INTERNAL PROMPT TEXT

```
You are implementing the Actions category addition. Your task:

1. TYPE DEFINITIONS (src/types/entities.ts):
   - Locate line 20: AttributeDefinition.category union type
   - Add 'actions' to the union: 'subject' | 'attribute' | ... | 'actions'
   - Locate line 67: PromptFragment.category union type
   - Add 'actions' to this union type as well (must match exactly)
   - Verify both types are exported via src/types/index.ts

2. DATA FILE (src/data/actions.json - NEW FILE):
   - Create new file following the exact structure of src/data/subject.json
   - Set category: "actions"
   - Create attributes array with ~20 common actions:
     * Body actions: standing, sitting, running, jumping, walking, lying, kneeling
     * Gestures: waving, pointing, holding, reaching, hands on hips
     * Facial: looking at viewer, looking away
     * Complex: fighting, dancing, reading, writing
     * Interaction: touching, hugging
   - ID pattern: "actions:subcategory-actionname" (e.g., "actions:body-standing")
   - baseText: Use present participle/gerund form (e.g., "standing", not "stand")
   - semanticPriority: 150 (all actions use same priority)
   - isNegative: false (all actions)
   - conflictsWith: [] (empty arrays)

3. QUESTION NODES (src/data/questions/actions.json - NEW FILE):
   - Create array with single root node
   - id: "actions-root"
   - question: "What actions or activities?"
   - description: "Describe what characters or subjects are doing"
   - attributeIds: Array of all action attribute IDs from actions.json
   - nextNodeId: null
   - allowCustomExtension: Array of all action attribute IDs (all allow extensions)

4. CATEGORY MAP (src/data/categoryMap.ts):
   - Locate the CATEGORY_MAP object (ends around line 255)
   - Add new property before closing brace:
     actions: [{ label: "Actions", nodeId: "actions-root" }]

5. CATEGORY ORDER (src/ui/App.tsx):
   - Locate CATEGORY_ORDER array (line 105)
   - Insert 'actions' after 'subject' and before 'style'
   - New array: ['subject', 'actions', 'style', 'lighting', ...]

VERIFICATION:
- Run the application
- Check browser console for "[loadAttributeDefinitions] Loading category: actions"
- Check console for "[loadQuestionNodes]" loading actions.json
- Verify "Actions" appears in CategorySidebar
- Verify actions-root question node is accessible
- Test selecting an action attribute
- Verify action appears in generated prompt (check positiveTokens)
- Verify action fragment has category: 'actions' and semanticPriority: 150

DO NOT:
- Modify prompt assembly code
- Change UI components
- Add section grouping
- Implement sentence formatting
```

### COMPLETION CRITERIA
- [ ] 'actions' added to both category union types in entities.ts
- [ ] actions.json file created with ~20 action attributes
- [ ] questions/actions.json file created with actions-root node
- [ ] Actions added to CATEGORY_MAP
- [ ] 'actions' added to CATEGORY_ORDER array
- [ ] Application compiles without errors
- [ ] Actions category appears in CategorySidebar
- [ ] Actions question node is accessible and functional
- [ ] Selected actions appear in generated prompt output
- [ ] Action fragments have correct category and priority values

---

## PHASE 2: Prompt Assembly - Section Grouping

### GOAL
Extend the Prompt type to include an optional sections object that groups fragments by category for display purposes, and modify prompt-assembler.ts to populate this object. The sections object is for UI display only and does not affect the flat comma-separated positiveTokens string used by Stable Diffusion.

### SCOPE
- Extend Prompt interface in `src/types/entities.ts` with optional sections field
- Create CATEGORY_TO_SECTION_MAP constant in `src/modules/prompt-assembler.ts`
- Modify `assemblePrompt` function to build sections object alongside positiveTokens
- Map technical categories to user-friendly section names (subject→characters, environment→scene, etc.)
- Apply same fragment formatting (weights) to sections as to positiveTokens
- Include sections in return object (only if sections exist)

### OUT OF SCOPE
- UI display changes (Phase 3)
- Sentence formatting
- Changes to positiveTokens format
- Token count calculations (unchanged)
- Negative prompt sections
- Copy functionality changes

### EXACT INTERNAL PROMPT TEXT

```
You are implementing section grouping in prompt assembly. Your task:

1. EXTEND PROMPT TYPE (src/types/entities.ts):
   - Locate Prompt interface (lines 103-118)
   - Add optional sections field after appliedModifiers:
     sections?: {
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
   - Keep all existing fields unchanged
   - Field is optional (?) for backward compatibility

2. CATEGORY-TO-SECTION MAPPING (src/modules/prompt-assembler.ts):
   - After imports (after line 14), before assemblePrompt function
   - Add constant:
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
       'attribute': 'characters',
       'composition': 'camera',
       'effect': 'effects',
     };

3. MODIFY assemblePrompt FUNCTION (src/modules/prompt-assembler.ts):
   - Locate assemblePrompt function (starts line 23)
   - After line 39 (after positiveTokens is built):
     Add section grouping logic:
     
     a. Create sectionsByCategory: Record<string, string[]> = {}
     
     b. Iterate through orderedFragments.positive:
        - Get sectionKey from CATEGORY_TO_SECTION_MAP[fragment.category]
        - If sectionKey exists:
          * Initialize array if needed: sectionsByCategory[sectionKey] = []
          * Format fragment text (same logic as positiveParts):
            - If fragment.weight !== null and weightSyntax === 'attention':
              fragmentText = `(${fragment.text}:${fragment.weight.toFixed(2)})`
            - Else: fragmentText = fragment.text
          * Push fragmentText to sectionsByCategory[sectionKey]
        - If sectionKey doesn't exist: console.warn (category not mapped)
     
     c. Convert arrays to comma-separated strings:
        Create sections: NonNullable<Prompt['sections']> = {}
        For each [sectionKey, fragmentTexts] in sectionsByCategory:
          If fragmentTexts.length > 0:
            sections[sectionKey] = fragmentTexts.join(modelProfile.tokenSeparator)
   
   - Modify return statement (line 78-84):
     Add: sections: Object.keys(sections).length > 0 ? sections : undefined
     Keep all existing return fields unchanged

CRITICAL REQUIREMENTS:
- Sections use SAME tokenSeparator as positiveTokens (', ' by default)
- Sections use SAME weight formatting as positiveTokens
- Sections are built from fragments BEFORE truncation logic
- Truncation logic ONLY affects positiveTokens, NOT sections
- Sections only included in return if at least one section has content
- positiveTokens remains unchanged (flat comma-separated string)

VERIFICATION:
- Generate prompt with selections from multiple categories
- Check prompt.sections object exists and has correct structure
- Verify sections contain comma-separated fragment text
- Verify weights are formatted correctly in sections (if applicable)
- Verify positiveTokens remains flat comma-separated format
- Verify sections don't appear in positiveTokens string
- Test with empty selections (sections should be undefined)

DO NOT:
- Modify positiveTokens format
- Change token counting logic
- Add section headers to positiveTokens
- Modify UI components
- Implement sentence formatting
```

### COMPLETION CRITERIA
- [ ] Prompt type extended with optional sections field
- [ ] CATEGORY_TO_SECTION_MAP constant created in prompt-assembler.ts
- [ ] assemblePrompt builds sections object from fragments
- [ ] Sections use same formatting as positiveTokens (weights, separator)
- [ ] Sections only included if content exists
- [ ] positiveTokens remains unchanged (flat comma-separated)
- [ ] Sections object structure verified in browser dev tools
- [ ] No regression in existing prompt generation

---

## PHASE 3: PromptPreview UI Changes (HIGH PRIORITY)

### GOAL
Modify PromptPreview component to display prompt sections with headers when sections are available, while maintaining backward compatibility with flat display. The copy-to-clipboard functionality must always use the flat positiveTokens string (never sections or headers) for Stable Diffusion compatibility.

### SCOPE
- Modify PromptPreview.tsx to conditionally render sections or flat format
- Add section display with user-friendly headers (Scene, Characters, Actions, etc.)
- Define section display order matching semantic priority
- Hide empty sections
- Add CSS styles for sectioned display
- Preserve existing copy functionality (uses positiveTokens only)
- Maintain backward compatibility (flat display when sections unavailable)

### OUT OF SCOPE
- Sentence formatting
- Changes to positiveTokens content
- Changes to copy functionality behavior
- Token count display changes
- Negative prompt sectioning
- Section headers in copied text

### EXACT INTERNAL PROMPT TEXT

```
You are implementing sectioned display in PromptPreview. Your task:

1. MODIFY PROMPTPREVIEW COMPONENT (src/ui/components/PromptPreview.tsx):
   - Locate the prompt-preview-content div (lines 85-101)
   - Replace the content rendering logic with conditional:
     
     IF (prompt exists AND prompt.sections exists AND prompt.sections has content):
       Render sections display
     ELSE:
       Render existing flat display (backward compatibility)
   
   - Sections display structure:
     * Wrap in <div className="prompt-preview-sections">
     * Map through section keys in this order:
       ['scene', 'characters', 'actions', 'style', 'lighting', 'camera', 'effects', 'quality', 'post-processing']
     * For each sectionKey:
       - Get sectionValue from prompt.sections[sectionKey]
       - If sectionValue exists, render:
         <div className="prompt-preview-section">
           <label className="prompt-preview-section-label">
             {sectionLabels[sectionKey]}:
           </label>
           <div className="prompt-preview-section-text">
             {sectionValue}
           </div>
         </div>
       - If sectionValue doesn't exist, skip (don't render)
   
   - Section labels mapping:
     const sectionLabels = {
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
   
   - Keep negative prompt display unchanged (after sections/flat content)

2. COPY FUNCTIONALITY (src/ui/components/PromptPreview.tsx):
   - Locate handleCopy function (lines 52-62)
   - VERIFY it uses displayPositive (which comes from prompt.positiveTokens)
   - DO NOT MODIFY - copy must always use flat format
   - Sections are DISPLAY-ONLY, never copied

3. CSS STYLES (src/ui/components/PromptPreview.css):
   - Add styles at end of file:
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
   - Adjust colors to match existing dark theme if needed

CRITICAL REQUIREMENTS:
- Sections are DISPLAY-ONLY (never in copied text)
- Copy button MUST use positiveTokens (flat format)
- Empty sections MUST be hidden (not rendered)
- Section order MUST match specified order
- Backward compatibility: flat display when sections unavailable
- Section headers (Scene:, Characters:, etc.) are DISPLAY-ONLY
- No section markers, brackets, or headers in copied prompt

VERIFICATION:
- Generate prompt with multiple category selections
- Verify sections appear with headers in preview
- Verify empty sections are hidden
- Verify section order matches specification
- Click copy button
- Verify copied text is flat comma-separated (no headers, no section markers)
- Verify copied text matches positiveTokens exactly
- Test with prompt without sections (should show flat format)
- Verify styling matches existing design

DO NOT:
- Modify copy functionality to include sections
- Add section headers to copied text
- Modify positiveTokens
- Implement sentence formatting
- Change token count display
```

### COMPLETION CRITERIA
- [ ] PromptPreview conditionally renders sections or flat format
- [ ] Sections display with correct headers (Scene, Characters, Actions, etc.)
- [ ] Section order matches specification
- [ ] Empty sections are hidden
- [ ] CSS styles added and applied correctly
- [ ] Copy functionality uses positiveTokens only (verified)
- [ ] Copied text contains no section headers or markers
- [ ] Backward compatibility maintained (flat display when sections unavailable)
- [ ] Visual styling matches existing design
- [ ] No regression in existing preview display

---

## PHASE 4: Validation & Regression Safety

### GOAL
Verify all changes work correctly together, ensure backward compatibility, and confirm no regressions in existing functionality. Validate that the implementation matches the feedback requirements without introducing unintended features.

### SCOPE
- Test actions category integration
- Test section grouping in various scenarios
- Test section display in UI
- Verify backward compatibility
- Verify copy functionality correctness
- Check for TypeScript compilation errors
- Verify no console errors
- Validate against feedback requirements

### OUT OF SCOPE
- Performance optimization
- Additional features
- Sentence formatting
- Changes to existing working code

### EXACT INTERNAL PROMPT TEXT

```
You are performing validation and regression testing. Your task:

1. COMPILATION CHECK:
   - Run TypeScript compiler: npm run build (or equivalent)
   - Verify no type errors
   - Verify no compilation errors
   - Fix any type mismatches or errors

2. ACTIONS CATEGORY VALIDATION:
   - Navigate to Actions category in UI
   - Select multiple action attributes
   - Verify actions appear in generated prompt
   - Check browser console for any errors
   - Verify action fragments have category: 'actions'
   - Verify action fragments have semanticPriority: 150
   - Verify actions appear in correct position in prompt (check ordering)

3. SECTION GROUPING VALIDATION:
   - Generate prompt with selections from multiple categories:
     * At least one from: subject, environment, actions, style, lighting, camera, effects, quality
   - Open browser dev tools, inspect prompt object
   - Verify prompt.sections exists and has correct structure
   - Verify each section contains comma-separated text
   - Verify sections match categories selected
   - Verify positiveTokens is flat comma-separated (unchanged)
   - Verify sections object is separate from positiveTokens

4. SECTION DISPLAY VALIDATION:
   - With sections-enabled prompt, verify sections appear in Preview
   - Verify section headers are visible (Scene:, Characters:, etc.)
   - Verify section text is displayed correctly
   - Verify empty sections are NOT displayed
   - Verify section order matches specification
   - Verify styling looks correct

5. COPY FUNCTIONALITY VALIDATION (CRITICAL):
   - Generate prompt with sections
   - Click copy button
   - Paste copied text
   - Verify copied text is FLAT comma-separated format
   - Verify copied text contains NO section headers
   - Verify copied text contains NO section markers like [Scene], etc.
   - Verify copied text matches positiveTokens exactly
   - Test with multiple prompts to ensure consistency

6. BACKWARD COMPATIBILITY VALIDATION:
   - Test with prompt that has no sections (should still work)
   - Verify flat display appears when sections unavailable
   - Verify no errors when sections is undefined
   - Verify existing functionality unchanged:
     * Token count display
     * Negative prompt display
     * All UI interactions

7. FEEDBACK REQUIREMENTS CHECK:
   - ✅ "action description" requirement: Can users select actions? YES/NO
   - ✅ "organized into sections" requirement: Are prompts displayed in sections? YES/NO
   - Verify sections match user's mentioned categories: scene, characters, actions, etc.
   - Verify SD output remains flat (not sectioned)

8. REGRESSION TESTING:
   - Test all existing categories still work
   - Test question navigation still works
   - Test attribute selection still works
   - Test modifier/weight functionality still works
   - Test negative prompts still work
   - Test token counting still works
   - Test all UI components still function

9. CONSOLE ERROR CHECK:
   - Open browser console
   - Generate prompts, navigate categories
   - Verify no errors or warnings (except expected warnings for unmapped categories)
   - Check for any TypeScript runtime errors

10. FINAL VERIFICATION:
    - All phases complete
    - All tests passing
    - No regressions
    - Feedback requirements met
    - Backward compatibility maintained
    - Copy functionality correct (flat format only)

CREATE TEST REPORT:
- List all test cases executed
- List any issues found
- List any fixes applied
- Confirm all completion criteria met
```

### COMPLETION CRITERIA
- [ ] TypeScript compilation successful (no errors)
- [ ] Actions category fully functional
- [ ] Sections appear in prompt object correctly
- [ ] Sections display correctly in UI
- [ ] Copy functionality verified (flat format only, no headers)
- [ ] Backward compatibility confirmed
- [ ] Feedback requirements met (actions + organized sections)
- [ ] No regressions in existing functionality
- [ ] No console errors (except expected warnings)
- [ ] Test report created documenting validation results

---

## Execution Order & Safety Notes

### Execution Sequence
1. **PHASE 1** → **PHASE 2** → **PHASE 3** → **PHASE 4**
2. Each phase must be completed and verified before proceeding to next
3. Phase 4 should be executed after all previous phases are complete

### Highest Risk Phase

**PHASE 3 (PromptPreview UI Changes)** is the highest-risk phase because:

1. **Copy Functionality Risk**: The copy button must ALWAYS use positiveTokens (flat format). Any mistake here could break Stable Diffusion compatibility by including section headers or markers in copied text.

2. **Display Logic Complexity**: Conditional rendering logic (sections vs flat) must be correct. Incorrect conditions could break display entirely.

3. **User-Facing Impact**: Changes are immediately visible to users. Display bugs are highly noticeable.

4. **Backward Compatibility**: Must handle both cases (with sections, without sections) correctly. Missing fallback logic could break existing functionality.

**Mitigation Strategy for Phase 3**:
- Test copy functionality FIRST before testing display
- Verify copied text in external text editor (not just visually)
- Test with prompts that have sections AND prompts that don't
- Keep existing flat display code as fallback (don't delete)
- Double-check that sections are never included in copy logic

### Safety Checklist Before Each Phase

- [ ] Backup current working state (git commit)
- [ ] Read phase prompt carefully
- [ ] Understand scope and out-of-scope items
- [ ] Verify file paths and line numbers
- [ ] Test after each major change
- [ ] Verify no regressions before proceeding

### Critical Constraints Reminder

⚠️ **NEVER**:
- Add section headers to positiveTokens
- Include sections in copied text
- Implement sentence generation
- Change positiveTokens format (must remain flat comma-separated)
- Break backward compatibility

✅ **ALWAYS**:
- Keep sections as DISPLAY-ONLY
- Use positiveTokens for SD output
- Maintain backward compatibility
- Test copy functionality explicitly
- Verify no regressions

