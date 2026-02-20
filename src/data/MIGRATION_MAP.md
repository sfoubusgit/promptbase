# Migration Map: Old Generator → New Engine

## STEP 1: CONCEPT MAPPING

### Data Structures

| OLD CONCEPT | NEW ENGINE CONCEPT | NOTES |
|------------|-------------------|-------|
| `InterviewNode.answers[].id` | `AttributeDefinition.id` | Direct mapping, preserve IDs |
| `InterviewNode.answers[].label` | `AttributeDefinition.baseText` | May need expansion/normalization |
| `InterviewNode.question` | Used for context in expansion | Not stored in AttributeDefinition |
| `WeightAttribute.template` | Used in Modifier (via weight formatting) | Template becomes prompt fragment text |
| `WeightAttribute.tags` | Used for normalization | Not directly stored, used during migration |
| `SelectedAnswer` | `AttributeSelection` | Direct mapping |
| `SelectedRefinement` | `AttributeSelection` | Treated same as regular selection |
| `WeightValue` | `Modifier` | Maps to `Modifier.targetAttributeId` and `Modifier.value` |
| `customExtension` | `AttributeSelection.customExtension` | Direct mapping |
| `customElements` | **NOT MIGRATED** | Custom prompt elements don't fit clean model |

### Categories & Priorities

| OLD CATEGORY | NEW CATEGORY | NEW PRIORITY | NOTES |
|-------------|--------------|--------------|-------|
| character/* | `subject` | 1 | Character identity, archetype, etc. |
| character/face, hair, clothing | `attribute` | 2 | Physical attributes |
| style/* | `style` | 3 | Art styles |
| effects/* | `effect` | 4 | Visual effects |
| environment/* | `composition` | 5 | Scene composition |
| camera/* | `quality` | 6 | Camera/technical settings |

### Prompt Assembly Logic

| OLD BEHAVIOR | NEW ENGINE BEHAVIOR | STATUS |
|-------------|---------------------|--------|
| `expandAbstractAnswer()` | **NOT MIGRATED** | Complex string manipulation, doesn't fit clean model |
| `normalizeTemplate()` | **NOT MIGRATED** | Category-specific rules, too complex |
| `sanitizeTemplate()` | **NOT MIGRATED** | Template cleaning, not needed with clean baseText |
| Special case question handling | **NOT MIGRATED** | 50+ special cases, too brittle |
| Weight formatting `(template:value)` | `assemblePrompt()` uses `modelProfile.weightSyntax` | ✅ MIGRATED |
| Negative prompt defaults | `ModelProfile.defaultNegativePrompt` | ✅ MIGRATED |
| Custom elements | **NOT MIGRATED** | Doesn't fit AttributeDefinition model |

### Ordering Rules

| OLD BEHAVIOR | NEW ENGINE BEHAVIOR | STATUS |
|-------------|---------------------|--------|
| Answers → Refinements → Weights | `semanticPriority` + input order | ✅ IMPROVED |
| No explicit category ordering | Category-based priority | ✅ IMPROVED |

### Conflicts

| OLD BEHAVIOR | NEW ENGINE BEHAVIOR | STATUS |
|-------------|---------------------|--------|
| Single selection per node (implicit) | Explicit `conflictsWith` array | ✅ IMPROVED |
| No explicit conflict rules | Conflict detection in validator | ✅ IMPROVED |

---

## STEP 2: BEHAVIORS NOT MIGRATED (AND WHY)

### 1. Abstract Answer Expansion
**Old:** `expandAbstractAnswer()` expands vague answers like "subtle", "moderate" based on question context.

**Why Not Migrated:**
- Requires question text context (not in AttributeDefinition)
- 100+ special case rules
- Too brittle and hardcoded
- New engine uses explicit `baseText` - users should provide clear text

**Impact:** Migrated attributes will have explicit baseText, no expansion needed.

### 2. Template Normalization
**Old:** `normalizeTemplate()` applies category-specific rules (e.g., "hair" → "hairstyle with X").

**Why Not Migrated:**
- Category-specific string manipulation
- Not needed if baseText is already clear
- Would require storing tags in AttributeDefinition

**Impact:** Migrated attributes have complete baseText, no normalization needed.

### 3. Template Sanitization
**Old:** `sanitizeTemplate()` removes abstract words, applies fallbacks.

**Why Not Migrated:**
- Cleans up bad templates
- Not needed if baseText is well-formed
- Would add complexity to engine

**Impact:** Migration ensures baseText is clean and complete.

### 4. Special Case Question Handling
**Old:** 50+ special cases for specific questions (e.g., "What material textures..." → "emphasized X materials").

**Why Not Migrated:**
- Question-specific string manipulation
- Too many hardcoded rules
- Doesn't fit declarative model

**Impact:** Migrated attributes include full context in baseText.

### 5. Custom Prompt Elements
**Old:** Users can add arbitrary text to prompt/negative prompt.

**Why Not Migrated:**
- Doesn't fit AttributeDefinition model
- Would require new entity type
- Can be added as future feature

**Impact:** Users can use customExtension for similar functionality.

### 6. Intensity Weights Without Answers
**Old:** Effects nodes can have intensity weights without a selected answer.

**Why Not Migrated:**
- Requires question context
- Complex logic for synthetic answer IDs
- Doesn't fit clean selection model

**Impact:** All weights require a selection (cleaner model).

---

## STEP 3: WHAT IS MIGRATED

### ✅ Data Migration
- All answer labels → AttributeDefinition.baseText
- All node IDs → AttributeDefinition.id (preserved)
- Categories → AttributeDefinition.category (mapped)
- Priorities → AttributeDefinition.semanticPriority (mapped)
- Conflicts → AttributeDefinition.conflictsWith (inferred)

### ✅ Defaults Migration
- Negative prompt: "deformed, distorted, extra limbs, low detail, low quality, bad anatomy"
- Token limit: 77 (SD 1.5 default)
- Token separator: ", "
- Weight syntax: "attention" (format: (text:value))

### ✅ Behavior Migration
- Weight formatting: (text:value) ✅
- Custom extensions ✅
- Selection model ✅
- Conflict detection ✅ (improved)

---

## STEP 4: IMPROVEMENTS GAINED

1. **Explicit Ordering:** Semantic priority replaces implicit ordering
2. **Explicit Conflicts:** conflictsWith array replaces single-selection constraint
3. **Cleaner Text:** No expansion/normalization needed - baseText is explicit
4. **Deterministic:** No question-dependent string manipulation
5. **Testable:** Pure functions, no hidden heuristics
6. **Extensible:** Easy to add new attributes without special cases

---

## STEP 5: MIGRATION STRATEGY

1. Load all old JSON files
2. Extract all answers as AttributeDefinitions
3. Infer categories from node paths
4. Infer priorities from categories
5. Infer conflicts from answer groups
6. Generate clean baseText (expand abstract answers during migration)
7. Create question nodes for navigation
8. Preserve IDs deterministically

---

## STEP 6: VERIFICATION CHECKLIST

- [ ] All answer labels migrated
- [ ] All IDs preserved
- [ ] Categories correctly mapped
- [ ] Priorities correctly assigned
- [ ] Conflicts correctly inferred
- [ ] Negative prompt defaults set
- [ ] Model profile configured
- [ ] Question nodes created
- [ ] Category map updated
- [ ] No data loss

