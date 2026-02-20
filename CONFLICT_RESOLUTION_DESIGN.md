# Conflict Resolution Design Proposal

## Executive Summary

Proposes a minimal, post-assembly conflict resolution strategy that filters conflicting fragments before final prompt assembly. No UI changes required; preserves user intent through predictable resolution rules.

---

## Identified Mutually Exclusive Categories

Based on current attribute definitions and semantic analysis:

### 1. **Subject Count** (Explicitly Defined)
- **Category:** `subject`
- **Attributes:** `subject:count-single` ↔ `subject:count-multiple`
- **Status:** Conflicts already defined in data

### 2. **Lighting Intensity** (Semantically Contradictory)
- **Category:** `lighting`
- **Attributes:** Intensity scale from `very-bright` to `very-dim`
- **Pattern:** Multiple mutually exclusive intensity levels
- **Current State:** No conflicts defined (all have `conflictsWith: []`)
- **Example Conflicts:** 
  - `lighting:intensity-very-bright` ↔ `lighting:intensity-very-dim`
  - `lighting:intensity-bright` ↔ `lighting:intensity-dim`
  - `lighting:intensity-strong` ↔ `lighting:intensity-soft`

### 3. **Age Groups** (Semantically Mutually Exclusive)
- **Category:** `subject` 
- **Attributes:** `child`, `teenager`, `adult`, `elderly`
- **Current State:** No conflicts defined
- **Pattern:** One age descriptor per subject

### 4. **Gender/Pronouns** (Conceptually Mutually Exclusive)
- **Category:** `subject`
- **Attributes:** `man`, `woman` (and potentially gendered descriptors)
- **Current State:** Example shows conflicts, but not fully populated in data
- **Note:** May want to allow multiple if describing multiple subjects

### 5. **Style Categories** (Aesthetic Mutually Exclusive)
- **Category:** `style`
- **Attributes:** `anime`, `realistic`, `photorealistic`, `cartoon`
- **Current State:** Example shows conflicts
- **Pattern:** One primary style per image

### 6. **Hair Length** (Physical Mutually Exclusive)
- **Category:** `attribute` or `anatomy-details`
- **Attributes:** `long hair` ↔ `short hair`
- **Current State:** Example shows conflicts
- **Pattern:** Physical characteristics that cannot coexist

---

## Resolution Strategy

### Core Principle: **"Last Selected Wins" with Priority Tie-Breaker**

When conflicting fragments are detected, keep the fragment that:
1. **Primary:** Was selected most recently (based on selection order in input array)
2. **Secondary:** Has higher semantic priority (if selection order is ambiguous)
3. **Tertiary:** Has lexicographically first attribute ID (for determinism)

### Implementation Location

**Module:** `src/modules/fragment-orderer.ts` (or new `src/modules/conflict-resolver.ts`)

**Rationale:**
- Fragments already have `sourceAttributeId` (tracks origin)
- Selection order is preserved in fragment generation
- Resolution happens before sections are built
- No changes needed to data model or UI

### Resolution Algorithm

```
1. Group fragments by conflict group (using conflictsWith relationships)
2. For each conflict group:
   a. If group has 1 fragment → keep it
   b. If group has >1 fragments → resolve conflict
3. Resolution within group:
   a. Sort by selection order (original input order)
   b. Keep last fragment (most recently selected)
   c. If order ambiguous, use semanticPriority (lower number = higher priority)
   d. If still ambiguous, use sourceAttributeId (lexicographic)
4. Return filtered fragments
```

### Conflict Group Detection

**Approach:** Build conflict groups dynamically from `conflictsWith` relationships

**Algorithm:**
- Create bidirectional conflict map (if A conflicts with B, both are in same group)
- Use transitive closure (if A↔B and B↔C, then A↔B↔C are same group)
- For semantic groups without explicit conflicts (e.g., lighting intensity), use attribute ID patterns

**Examples:**
- Explicit: `subject:count-single` ↔ `subject:count-multiple` (defined in data)
- Pattern-based: All `lighting:intensity-*` attributes form implicit group

---

## Implementation Approach

### Phase 1: Explicit Conflicts Only (Minimal Increment)

**Scope:** Resolve only conflicts explicitly defined in `conflictsWith` arrays

**Changes Required:**
1. Add conflict resolution function in `fragment-orderer.ts`
2. Call resolution before fragment ordering
3. Log resolved conflicts to console (development visibility)

**Impact:**
- Handles subject count conflicts immediately
- No data changes needed
- Predictable behavior

### Phase 2: Semantic Conflict Groups (Incremental Enhancement)

**Scope:** Add pattern-based conflict detection for semantic groups

**Changes Required:**
1. Define conflict group patterns (e.g., `lighting:intensity-*` prefix matching)
2. Extend resolution to handle implicit groups
3. Optionally add metadata to attribute definitions for explicit grouping

**Impact:**
- Resolves lighting intensity conflicts
- Can be extended to other semantic groups incrementally

### Phase 3: Category-Level Conflicts (Future Enhancement)

**Scope:** Allow category-wide conflict rules (e.g., "only one age descriptor")

**Changes Required:**
1. Add category metadata for conflict rules
2. Extend resolution algorithm to handle category-level conflicts

**Impact:**
- Handles age groups, style categories systematically
- More comprehensive but requires more analysis

---

## Resolution Behavior Examples

### Example 1: Subject Count Conflict
**Input:** User selects both "single subject" and "multiple subjects"
**Resolution:** Keep "multiple subjects" (last selected)
**Output:** Only "multiple subjects" in prompt

### Example 2: Lighting Intensity Conflict
**Input:** User selects "very bright lighting", "dim lighting", "soft lighting"
**Resolution:** Keep "soft lighting" (last selected)
**Output:** Only "soft lighting" in Lighting section

### Example 3: Style Conflict
**Input:** User selects "anime style", then "realistic style"
**Resolution:** Keep "realistic style" (last selected)
**Output:** Only "realistic style" in Style section

### Example 4: No Conflict
**Input:** User selects "bright lighting" and "three-quarter lighting"
**Resolution:** Keep both (different aspects, not mutually exclusive)
**Output:** Both in Lighting section

---

## User Intent Preservation

### Strategy Justification

**"Last Selected Wins"** preserves user intent because:
- User's final choice represents their current preference
- Allows iterative refinement (user can change mind by selecting new attribute)
- Predictable behavior (most recent action takes effect)
- No silent confusion (conflicts are logged for debugging)

### Alternative Strategies Considered

1. **"First Selected Wins"**
   - ❌ User must deselect before changing
   - ❌ Less intuitive for iterative workflows

2. **"Weight-Based Resolution"**
   - ❌ Requires weights to be set (not always the case)
   - ❌ More complex, less predictable

3. **"Priority-Based Only"**
   - ❌ Ignores user's selection order
   - ❌ May not reflect user intent

4. **"Keep All, Mark Conflicts"**
   - ❌ Requires UI changes to show conflicts
   - ❌ Out of scope for minimal approach

---

## Logging and Visibility

### Development Logging

**Console Output (Development Only):**
```
[Conflict Resolution] Resolved conflict in group "subject:count":
  - Removed: "single subject" (selected earlier)
  - Kept: "multiple subjects" (selected later)
```

**Purpose:**
- Developers can verify resolution behavior
- Helps debug unexpected prompt outputs
- No user-facing changes required

### Production Behavior

**Silent Resolution:**
- Conflicts resolved automatically
- No UI indicators
- No error messages
- Prompt generation continues normally

**Rationale:**
- Avoids confusing users with conflict warnings
- Resolution is predictable and preserves intent
- Matches current "conflicts are ignored" philosophy but with smart filtering

---

## Edge Cases and Special Considerations

### 1. Missing Conflict Definitions

**Problem:** Some semantic conflicts not defined in `conflictsWith` arrays

**Solution:** 
- Phase 1: Only resolve explicit conflicts
- Phase 2+: Add pattern-based detection
- Incremental approach allows gradual coverage

### 2. Transitive Conflicts

**Problem:** If A↔B and B↔C, should A↔C?

**Solution:** Use transitive closure in conflict group detection
- Group: [A, B, C] (all conflict with each other)
- Resolution applies to entire group

### 3. Negative Prompt Conflicts

**Problem:** Should negative prompt attributes have conflict resolution?

**Solution:** 
- Apply same resolution to negative fragments
- Negative attributes rarely conflict (they're exclusions)
- Can be handled identically for consistency

### 4. Weighted Fragments

**Problem:** Does fragment weight affect resolution?

**Solution:**
- Weights are ignored for conflict resolution
- Resolution uses selection order, not weight
- Weights still apply to kept fragments

### 5. Custom Extensions

**Problem:** Attributes with custom extensions - do they conflict differently?

**Solution:**
- Conflict detection based on attribute ID, not text
- Custom extension doesn't change conflict relationship
- Resolution same as non-extended attributes

---

## Integration Points

### Where Resolution Happens

**Recommended:** `src/modules/fragment-orderer.ts`

**Flow:**
```
generateFragments() 
  → [resolveConflicts()] ← NEW
  → orderFragments() (existing)
  → assemblePrompt()
```

**Alternative:** New module `src/modules/conflict-resolver.ts`

**Flow:**
```
generateFragments()
  → resolveConflicts() ← NEW MODULE
  → orderFragments()
  → assemblePrompt()
```

**Recommendation:** Add to `fragment-orderer.ts` (simpler, fewer files)

### Data Requirements

**Input:** 
- `PromptFragment[]` (with `sourceAttributeId`)
- `AttributeDefinition[]` (for `conflictsWith` lookups)
- Selection order (preserved in fragment generation order)

**Output:**
- `PromptFragment[]` (filtered, conflicts resolved)

**No new data structures needed.**

---

## Testing Strategy

### Unit Tests

1. **Single Conflict Resolution**
   - Two conflicting fragments → keep last selected
   
2. **Multiple Conflicts in Group**
   - Three+ conflicting fragments → keep last selected

3. **No Conflicts**
   - Non-conflicting fragments → all preserved

4. **Transitive Conflicts**
   - A↔B, B↔C → all three in same group

5. **Selection Order Preservation**
   - Verify order determines winner

6. **Priority Tie-Breaker**
   - Same order → higher priority wins

### Integration Tests

1. **End-to-End Conflict Resolution**
   - Select conflicting attributes → verify prompt has only resolved fragment

2. **Section Assembly with Conflicts**
   - Verify resolved fragments appear in correct sections

3. **Negative Prompt Conflicts**
   - Verify negative fragments also resolved

---

## Success Criteria

✅ **No UI Changes Required**
- Resolution happens in prompt assembly
- User sees final result, not conflict indicators

✅ **User Intent Preserved**
- Most recently selected attribute wins
- Predictable behavior

✅ **No Silent Confusion**
- Conflicts logged for debugging
- Resolution is deterministic and explainable

✅ **Incremental Implementation**
- Phase 1: Explicit conflicts only (minimal change)
- Phase 2+: Semantic groups (can add gradually)

✅ **Backward Compatible**
- If no conflicts exist, behavior unchanged
- Resolution only activates when conflicts detected

---

## Risks and Mitigations

### Risk 1: User Expects All Selections to Appear

**Mitigation:**
- Document behavior (last selected wins)
- Logging helps debug unexpected results
- Consider future UI indicator (out of scope for Phase 1)

### Risk 2: Pattern-Based Conflicts Are Too Aggressive

**Mitigation:**
- Start with explicit conflicts only (Phase 1)
- Test pattern matching carefully before Phase 2
- Allow override via explicit `conflictsWith` definitions

### Risk 3: Resolution Order Affects Outcome

**Mitigation:**
- Use deterministic tie-breakers (priority, then ID)
- Document resolution algorithm clearly
- Test edge cases thoroughly

---

## Conclusion

This proposal provides a minimal, predictable conflict resolution strategy that:
- Requires **zero UI changes**
- Preserves user intent via **"last selected wins"**
- Avoids silent confusion through **deterministic logging**
- Can be implemented **incrementally** (Phase 1 → Phase 2 → Phase 3)

The strategy integrates cleanly into existing fragment ordering pipeline and requires no schema changes or user-facing modifications.


