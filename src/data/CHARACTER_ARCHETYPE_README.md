# Character Archetype Category

This document describes the Character Archetype category that has been added to the prompt generator.

## Files Created

### 1. Attribute Definitions
**File:** `src/data/character-archetype.json`

Contains 16 attribute definitions:
- **10 Archetype Types** (category: `subject`, priority: 1):
  - `archetype-mage` → "mage"
  - `archetype-knight` → "knight"
  - `archetype-rogue` → "rogue"
  - `archetype-healer` → "healer"
  - `archetype-scholar` → "scholar"
  - `archetype-hacker` → "hacker"
  - `archetype-pilot` → "pilot"
  - `archetype-merchant` → "merchant"
  - `archetype-warrior` → "warrior"
  - `archetype-ranger` → "ranger"

- **6 Flavor Modifiers** (category: `attribute`, priority: 2):
  - `archetype-flavor-wandering` → "wandering"
  - `archetype-flavor-royal` → "royal"
  - `archetype-flavor-cursed` → "cursed"
  - `archetype-flavor-chosen` → "chosen"
  - `archetype-flavor-fallen` → "fallen"
  - `archetype-flavor-ascended` → "ascended"

### 2. Question Nodes
**File:** `src/data/questions/character-archetype.json`

Contains 2 question nodes that define the interview flow:

1. **character-archetype-root**
   - Question: "What is the character's archetype or role?"
   - Description: "Choose the primary role or archetype that defines this character"
   - Options: All 10 archetype types
   - Custom Extensions: All archetypes allow custom text extensions
   - Next: `character-archetype-flavor`

2. **character-archetype-flavor**
   - Question: "What special flavor does this archetype have?"
   - Description: "Add a unique twist or flavor to the character archetype"
   - Options: All 6 flavor modifiers
   - Next: `null` (completes the flow)

## Integration

### Data Loading
- **Attribute Definitions**: Loaded via `loadAttributeDefinitions()` which now supports category-specific JSON files
- **Question Nodes**: Loaded via new `loadQuestionNodes()` function from `src/data/questions/**/*.json`

### App Integration
- App.tsx automatically detects and uses `character-archetype-root` as the initial question
- Falls back to demo data if files are not found
- All archetype options support custom text extensions

## Usage Example

1. User starts the app → Sees "What is the character's archetype or role?"
2. User selects "mage" → Can add custom extension (e.g., "with fire magic")
3. Automatically transitions to flavor question
4. User selects "cursed" → Flow completes
5. Final prompt includes: "mage with fire magic, cursed"

## Next Steps

To add more categories:
1. Create `src/data/[category-name].json` with AttributeDefinitions
2. Create `src/data/questions/[category-name].json` with QuestionNodes
3. Link categories by setting `nextNodeId` in question nodes
4. The system will automatically load and integrate them

