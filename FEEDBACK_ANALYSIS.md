# User Feedback Analysis & Improvement Directions

## Original Feedback

> "Smooth experience, much simpler than the previous version (found no anatomy details, nsfw parts).
> What I miss is:
> - action description
> - sentence like prompt, organized into sections like scene, characters, actions etc."

---

## Part 1: Detailed Analysis of User Intent

### Positive Feedback (What Works)
- **Simplified experience**: User appreciates the streamlined approach
- **Clean content**: No NSFW/anatomy details found (intentional or by design) - this is perceived as positive
- **Overall flow**: Described as "smooth" - the UI/UX navigation works well

### Critical Missing Features

#### 1. "Action Description"
**Multiple Interpretations:**

**Assumption A: Dynamic Actions/Activities**
- User wants to describe what characters/subjects are *doing*
- Examples: "running", "jumping", "sitting", "fighting", "dancing", "reading", "looking at viewer", "walking away"
- This is about **motion, pose, activity, and narrative action**
- Currently missing: No category or attributes for character/subject actions/activities

**Assumption B: Action-oriented Style/Genre**
- User might want action-themed styles (like the existing `style:action` which just says "action" as a style tag)
- But this is more likely about describing WHAT is happening, not the style
- Need to distinguish between "action style" (cinematic, dynamic) vs "action description" (what's being done)

**Assumption C: Verb-based Descriptions**
- User wants to add verbs to prompts: "a man **waving**, **standing**, **holding** a sword"
- This makes prompts more dynamic and narrative
- Current system seems noun/adjective-focused (static descriptors)

**Assumption D: Pose/Gesture Extension**
- Could be related to character pose/gesture descriptions
- But user specifically said "action description" - suggests motion/activity, not just static poses

**Most Likely: Assumption A + C Combined**
- User wants a way to describe dynamic actions and activities that characters/subjects are performing
- This should be separate from static attributes like clothing, style, lighting
- Should integrate naturally into prompt structure

#### 2. "Sentence like prompt, organized into sections"

**Multiple Interpretations:**

**Assumption A: Human-Readable Paragraph Format**
- Instead of: `"man, red shirt, outdoor, bright lighting, cinematic style"`
- User wants: `"A man in a red shirt, standing outdoors in bright lighting, cinematic style"`
- Natural language sentences instead of comma-separated tokens

**Assumption B: Sectioned/Structured Display**
- User wants visual organization in the preview:
  ```
  Scene: outdoor, forest, daytime
  Character: man, red shirt, tall
  Actions: standing, looking at viewer, holding sword
  Style: cinematic, dramatic lighting
  Quality: high detail, 8k
  ```
- Still comma-separated within sections, but grouped visually/logically

**Assumption C: Sectioned Sentence Format**
- Combination: Natural sentences organized into labeled sections:
  ```
  Scene: A forest clearing during daytime.
  Character: A tall man wearing a red shirt.
  Actions: Standing confidently, looking directly at the viewer, holding a sword.
  Style: Cinematic composition with dramatic lighting.
  Quality: High detail, 8k resolution.
  ```

**Assumption D: Grammatically Correct Sentences**
- User wants prompts that read like proper English sentences
- Current format is fragmentary/tag-based
- Should use proper grammar, articles (a/an/the), conjunctions

**Assumption E: Section Headers in Final Prompt**
- User might want the actual Stable Diffusion prompt to include section markers:
  - `"[Scene] outdoor, forest [Character] man, red shirt [Actions] standing, looking [Style] cinematic"`
- But this is unlikely as Stable Diffusion doesn't use section markers
- More likely about display/organization

**Most Likely: Assumption B + C Combined**
- User wants the prompt preview to show organized sections (Scene, Characters, Actions, Style, etc.)
- Within each section, either comma-separated tokens OR natural sentences
- The actual Stable Diffusion output might still be comma-separated, but the user experience shows organized sections
- OR: Two output modes - "tag format" (current) vs "sentence format" (new)

**Section Organization Expectations:**
Based on user mention of "scene, characters, actions etc.":
1. **Scene** - Environment, location, setting
2. **Characters** - Subjects, people, creatures, objects
3. **Actions** - What characters/subjects are doing (NEW - currently missing)
4. **Style** - Art style, visual style
5. **Lighting** - Lighting conditions
6. **Camera** - Camera settings, angle, composition
7. **Effects** - Atmospheric effects, weather, particles
8. **Quality** - Technical quality settings

---

## Part 2: Core Problems Identified

### Problem 1: Missing Action/Activity Category
**Current State:**
- No dedicated category for describing actions/activities
- Fragments are mostly static descriptors (nouns, adjectives)
- No way to specify "what is happening" or "what characters are doing"

**Evidence:**
- Found only `style:action` (a style tag, not action description)
- Categories focus on: subject (what), style (how), lighting (when/conditions), environment (where), quality (technical)
- Missing: actions (what's happening/motion)

**Impact:**
- Prompts are static/descriptive but not narrative/dynamic
- Cannot create action-oriented scenes (fighting, running, dancing, etc.)
- Limits storytelling and dynamic image generation

### Problem 2: Flat, Unorganized Output Format
**Current State:**
- Prompt assembly: Simple comma-separated list
- Format: `fragment1, fragment2, fragment3, ...`
- No visual/logical grouping by category
- No sentence structure or natural language

**Evidence:**
- `prompt-assembler.ts`: Uses `join(modelProfile.tokenSeparator)` - flat concatenation
- `tokenSeparator: ', '` - simple comma separation
- Fragments ordered by priority, but no section grouping in output
- Display shows single text block

**Impact:**
- Hard to read/understand what each part contributes
- Difficult to edit specific aspects (e.g., "I want to change the action but keep the style")
- Doesn't match user mental model of organized sections
- Less intuitive for users coming from narrative/storytelling backgrounds

### Problem 3: No Sentence/Paragraph Mode
**Current State:**
- All outputs are token/tag-based
- No natural language generation
- No grammatical structure

**Evidence:**
- Fragments are concatenated as-is
- No sentence templates or grammar rules
- No mode switching between "tags" and "sentences"

**Impact:**
- Prompts feel technical/mechanical
- Less accessible to non-technical users
- Doesn't match how users naturally think about images

---

## Part 3: Solution Directions & Improvement Ideas

### Solution Direction 1: Add Action/Activity Category

#### 1.1 Create New "Actions" Category
**Approach:**
- Add new category: `actions` (or `activity`, `motion`, `behavior`)
- Create `src/data/actions.json` with attribute definitions
- Create `src/data/questions/actions.json` with question nodes
- Update category types in `entities.ts`

**Attribute Types to Include:**
- **Body Actions**: running, jumping, sitting, standing, walking, lying, kneeling
- **Arm/Hand Gestures**: waving, pointing, holding, reaching, crossing arms, hands on hips
- **Facial Actions**: smiling, frowning, laughing, crying, shouting, looking at viewer, looking away
- **Complex Actions**: fighting, dancing, playing, reading, writing, eating, drinking
- **Movement Speed**: static, slow motion, dynamic, frozen in motion, mid-action
- **Interaction Actions**: touching, hugging, shaking hands, pointing at, reaching for

**Integration:**
- Add to `categoryMap.ts` under new "Actions" section
- Set semantic priority (likely priority 2-3, after subject but before style)
- Allow custom extensions for specific actions

**Questions to Consider:**
- Should actions be tied to specific subjects? (e.g., "character action" vs "general action")
- How to handle multiple actions? (one character doing multiple things, or multiple characters with different actions)
- Should actions have intensity/modifiers? (e.g., "running fast", "slowly walking")

#### 1.2 Alternative: Action as Subcategory of Subject
**Approach:**
- Instead of new category, add action attributes to `subject` category
- Create question nodes like "subject-action-root" in `questions/subject.json`
- Attributes like `subject:action-running`, `subject:action-sitting`

**Pros:**
- Actions are inherently tied to subjects, so this makes semantic sense
- Simpler implementation (no new category)
- Less architectural changes

**Cons:**
- Less flexible if you want scene-level actions (e.g., "snow falling", "wind blowing")
- Harder to organize in UI if actions are mixed with subject types

#### 1.3 Hybrid: Actions as Attributes with Special Handling
**Approach:**
- Create action attributes in a new category but with special semantic meaning
- In prompt assembly, actions are formatted differently or grouped separately
- Actions might use verbs instead of nouns ("running" not "run")

---

### Solution Direction 2: Sectioned/Organized Prompt Display

#### 2.1 Sectioned Preview (Display-Only Organization)
**Approach:**
- Keep current comma-separated format for Stable Diffusion
- Add visual section grouping in `PromptPreview.tsx`
- Group fragments by category when displaying
- Show section headers: "Scene:", "Characters:", "Actions:", "Style:", etc.

**Implementation:**
- Modify `PromptPreview.tsx` to parse fragments by category
- Group `positiveTokens` by category after splitting
- Display in organized sections with headers
- Copy functionality still outputs flat comma-separated format (SD-compatible)

**Example Display:**
```
Scene: outdoor, forest, daytime
Characters: man, red shirt, tall
Actions: standing, looking at viewer
Style: cinematic, dramatic lighting
Camera: wide angle, shallow depth of field
Quality: high detail, 8k
```

**Pros:**
- No changes to engine/prompt assembly (backward compatible)
- Only UI changes needed
- Stable Diffusion still gets proper format
- Better UX immediately

**Cons:**
- Requires storing category info in Prompt object (currently not stored)
- Need to reconstruct category mapping from fragments (requires reverse lookup)

#### 2.2 Sectioned Output with Category Preservation
**Approach:**
- Modify `Prompt` type to store sections separately
- Update `prompt-assembler.ts` to group fragments by category
- Add new field: `sections: { [category: string]: string }`
- Keep `positiveTokens` for backward compatibility (flat format)

**Implementation:**
```typescript
interface Prompt {
  positiveTokens: string; // Flat format (current)
  sections: {              // NEW: Organized by category
    scene?: string;
    characters?: string;
    actions?: string;
    style?: string;
    lighting?: string;
    camera?: string;
    effects?: string;
    quality?: string;
  };
  negativeTokens: string;
  tokenCount: number;
  // ...
}
```

**Pros:**
- Structured data available for flexible display
- Can support multiple output formats (flat, sectioned, sentences)
- Better separation of concerns

**Cons:**
- Requires changes to engine and all consumers
- More complex data structure
- Need to decide category → section name mapping

#### 2.3 Section Headers in Prompt Text (Not Recommended)
**Approach:**
- Add section markers directly in prompt string
- Format: `"[Scene] outdoor, forest [Characters] man [Actions] standing [Style] cinematic"`

**Cons:**
- Stable Diffusion doesn't use section markers (they become literal tokens)
- Wastes token budget
- Not standard practice
- Would need to strip them before sending to SD (defeats purpose)

**Verdict: Not recommended** - Section organization should be display-only

---

### Solution Direction 3: Sentence/Paragraph Format

#### 3.1 Sentence Mode as Alternative Output Format
**Approach:**
- Add prompt format toggle: "Tags" vs "Sentences"
- Create new module: `sentence-formatter.ts`
- Convert fragments into natural language sentences
- Group by sections and write proper sentences

**Implementation:**
- Add `formatMode: 'tags' | 'sentences'` to ModelProfile or user preferences
- Create sentence templates per category:
  - Scene: "A {environment} scene during {time}"
  - Characters: "A {subject} wearing {clothing}"
  - Actions: "{subject} is {action}"
  - Style: "Rendered in {style} style"
- Use grammar rules: articles (a/an/the), conjunctions, proper verb forms

**Example Output:**
```
Scene: A forest clearing during daytime.
Character: A tall man wearing a red shirt.
Actions: The man is standing confidently and looking directly at the viewer.
Style: Cinematic composition with dramatic lighting.
Quality: High detail, 8k resolution.
```

**Challenges:**
- Grammar complexity (pluralization, articles, verb conjugation)
- Maintaining semantic meaning while adding grammar
- Some SD models might perform better with tags (needs testing)
- Token budget considerations (sentences use more tokens)

**Pros:**
- More readable and intuitive
- Better for users who think in narrative terms
- Easier to edit and understand

**Cons:**
- Complex implementation (NLP-like rules)
- May need different token counting
- Potential compatibility issues with some SD models
- Could waste tokens on grammar words

#### 3.2 Hybrid: Sentence Templates per Category
**Approach:**
- Use templates that combine fragments into sentences within sections
- Less flexible than full NLP, but more predictable
- Example: `"A {subject_list} in a {environment}, {action_description}, {style} style"`

**Pros:**
- Simpler than full sentence generation
- More readable than tags
- Predictable output

**Cons:**
- Less flexible (templates might not fit all combinations)
- Still requires grammar rules for some cases

#### 3.3 Smart Concatenation with Grammar Hints
**Approach:**
- Add grammar hints to AttributeDefinitions (e.g., `article: "a" | "an" | "the"`, `verbForm: "present" | "past"`)
- Use hints to construct sentences during assembly
- More structured than templates, less complex than full NLP

**Implementation:**
- Extend `AttributeDefinition` with optional grammar metadata
- `prompt-assembler.ts` uses hints to construct sentences
- Falls back to tags if hints missing

---

### Solution Direction 4: Combined Approach (Recommended)

#### 4.1 Multi-Format Support System
**Approach:**
- Implement all three improvements simultaneously
- Add Actions category
- Add sectioned organization (display + data structure)
- Add sentence format as optional mode
- User can choose: "Tags" or "Sentences" format, with sectioned preview always shown

**Implementation Phases:**

**Phase 1: Actions Category**
1. Create `actions.json` and `questions/actions.json`
2. Update category types
3. Add to category map
4. Test integration

**Phase 2: Sectioned Display**
1. Extend `Prompt` type with `sections` field (optional for backward compat)
2. Update `prompt-assembler.ts` to populate sections
3. Update `PromptPreview.tsx` to display sections
4. Keep `positiveTokens` for SD compatibility

**Phase 3: Sentence Format (Optional)**
1. Add format toggle to UI
2. Create `sentence-formatter.ts` module
3. Implement sentence generation with templates
4. Test with various SD models

**Benefits:**
- Addresses all user feedback points
- Backward compatible (tags mode remains default)
- Progressive enhancement (can implement phases separately)
- Flexible (users choose format)

---

### Solution Direction 5: Alternative Thinking - Prompt Templates

#### 5.1 Template-Based Prompt Structure
**Approach:**
- Define prompt templates that users can choose from
- Templates define structure: "A {character} {action} in {scene} with {style} style"
- Users fill in template slots through questions
- Automatically generates sentence-like prompts

**Example Templates:**
- "Portrait": "{character} {action}, {style} style, {lighting}"
- "Scene": "{scene} with {character} {action}, {style}, {lighting}"
- "Action": "{character} {action} in {scene}, {style}, {camera}"

**Pros:**
- Natural sentence structure built-in
- Flexible (multiple templates)
- Users understand structure

**Cons:**
- Less flexible than free-form selection
- Requires template definition work
- Might not cover all use cases

---

### Solution Direction 6: Enhanced Fragment Ordering & Grouping

#### 6.1 Category-Based Grouping in Assembly
**Approach:**
- Keep current flat output for SD
- But group fragments by category during assembly
- Add section separators (visual only, not in SD output)
- Display shows logical grouping

**Implementation:**
- Modify `assemblePrompt` to create section groups
- Join sections with visual separators in preview
- Strip separators when copying to clipboard (SD format)
- Or: Use newline separators in display, commas in copy

**Example:**
- Display (with newlines): `"man, red shirt\n\noutdoor, forest\n\ncinematic style"`
- Copy (SD format): `"man, red shirt, outdoor, forest, cinematic style"`

**Pros:**
- Minimal code changes
- Immediate visual improvement
- SD compatibility maintained

**Cons:**
- Less structured than dedicated sections
- No section labels/headers
- Still not "sentence-like"

---

## Part 4: Recommended Implementation Strategy

### Immediate Priority: Actions Category
**Why First:**
- Directly addresses "action description" feedback
- No ambiguity - clearly missing feature
- Independent feature (can be added without other changes)

**Steps:**
1. Research common action/activity keywords for image generation
2. Design attribute structure (verbs vs nouns, intensity modifiers)
3. Create `actions.json` with 30-50 common actions
4. Create question flow in `questions/actions.json`
5. Integrate into category system
6. Test with sample prompts

### Secondary Priority: Sectioned Display
**Why Second:**
- Addresses "organized into sections" feedback
- Improves UX immediately
- Doesn't break existing functionality

**Steps:**
1. Extend `Prompt` type with optional `sections` object
2. Update `prompt-assembler.ts` to group fragments by category
3. Update `PromptPreview.tsx` to display sections with headers
4. Map categories to user-friendly section names
5. Keep backward compatibility (flat format still available)

### Optional/Future: Sentence Format
**Why Optional:**
- More complex to implement correctly
- Needs testing with SD models
- May not be preferred by all users
- Can be added later if user demand is high

**Steps (if pursued):**
1. Research sentence formatting for Stable Diffusion prompts
2. Create sentence template system
3. Add format toggle to UI
4. Implement sentence generator module
5. Test with various SD models
6. Compare results (tags vs sentences)

---

## Part 5: Key Questions to Resolve

### About Actions:
1. **Verb form**: Should actions use verbs ("running") or gerunds ("running") or nouns ("run")?
2. **Subject binding**: Are actions always tied to a subject, or can there be scene-level actions?
3. **Multiple actions**: Can one character have multiple actions? How to handle?
4. **Action intensity**: Should actions have modifiers (fast, slow, gentle, aggressive)?
5. **Action-state distinction**: Should we separate "actions" (doing) from "states" (being/feeling)?

### About Sections:
1. **Category mapping**: How do technical categories map to user-facing section names?
   - `subject` → "Characters" or "Subjects"?
   - `environment` → "Scene" or "Environment"?
   - `effects` → "Effects" or "Atmosphere"?
2. **Section order**: What order should sections appear? (Should match semantic priority?)
3. **Empty sections**: Should empty sections be hidden or shown as "None selected"?
4. **Section styling**: Should sections be collapsible, or always visible?

### About Sentence Format:
1. **SD compatibility**: Do SD models perform better with tags or sentences? (Needs testing)
2. **Token budget**: Sentences use more tokens - is this acceptable?
3. **Grammar complexity**: How sophisticated should grammar be? (Articles, plurals, verb forms)
4. **Template vs NLP**: Use templates (simpler) or NLP rules (more flexible)?
5. **User preference**: Should this be a toggle, or always-on, or always-off?

---

## Part 6: Open Questions for User Clarification

Before implementing, consider asking user:

1. **Actions:**
   - When you say "action description", do you mean what characters are doing (running, sitting, fighting)?
   - Should actions be separate from poses/gestures, or are they the same thing?
   - Do you want scene-level actions (e.g., "snow falling", "wind blowing") or just character actions?

2. **Sections:**
   - Do you want sections shown in the preview only, or also in the copied prompt?
   - What section names do you prefer? (Scene, Characters, Actions, Style, Lighting, Camera, Effects, Quality?)
   - Should sections be collapsible/expandable, or always visible?

3. **Sentence format:**
   - Do you want actual sentences (with grammar), or just organized tags?
   - Would you use sentence format for Stable Diffusion, or just for readability?
   - Should this be optional (toggle) or the default?

---

## Summary

**User wants:**
1. ✅ **Actions category** - Ability to describe what characters/subjects are doing
2. ✅ **Organized sections** - Visual/logical grouping of prompt parts (Scene, Characters, Actions, Style, etc.)
3. ⚠️ **Sentence format** - Possibly natural language sentences instead of tags (needs clarification)

**Recommended approach:**
1. **Phase 1**: Add Actions category (clear requirement)
2. **Phase 2**: Implement sectioned display (clear requirement, improves UX)
3. **Phase 3**: Consider sentence format (needs testing and user validation)

**Key insight:**
The user wants prompts to feel more narrative and organized, not just a flat list of tags. This suggests a shift from "technical tag system" to "storytelling tool" - more accessible and intuitive for creative use.

