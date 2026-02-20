# Style Art Category

This document describes the Style Art category that has been added to the prompt generator.

## Files Created

### 1. Attribute Definitions
**File:** `src/data/style-art.json`

Contains 33 attribute definitions organized into:

#### Main Art Styles (8 options)
- `style-anime` → "anime style" (conflicts with realistic styles)
- `style-semi-realistic` → "semi-realistic" (conflicts with anime/realistic)
- `style-realistic` → "realistic" (conflicts with anime)
- `style-painterly` → "painterly illustration"
- `style-3d-render` → "3D render"
- `style-cartoon` → "cartoon"
- `style-comic` → "comic book"
- `style-pixel` → "pixel art"

#### Anime Sub-Styles (8 options)
- `anime-soft-romantic` → "soft romantic anime"
- `anime-shounen` → "dynamic shounen action"
- `anime-gothic` → "gothic or dark anime"
- `anime-cinematic` → "cinematic anime realism"
- `anime-cel-style` → "old-school cel-style"
- `anime-chibi` → "chibi-inspired"
- `anime-moe` → "moe style"
- `anime-retro` → "retro anime"

#### Realism Sub-Styles (5 options)
- `realism-cinematic` → "cinematic realism"
- `realism-portrait` → "portrait photography look"
- `realism-natural-light` → "natural light realism"
- `realism-hyperrealistic` → "hyperrealistic"
- `realism-documentary` → "documentary style"

#### Painting Sub-Styles (7 options)
- `painting-oil` → "oil painting"
- `painting-watercolor` → "watercolor"
- `painting-ink-wash` → "ink and wash"
- `painting-gouache` → "gouache"
- `painting-digital-painterly` → "digital painting with painterly brushwork"
- `painting-acrylic` → "acrylic"
- `painting-pastel` → "pastel"

#### 3D Sub-Styles (5 options)
- `3d-cg-render` → "CG render"
- `3d-stylized` → "stylized 3D"
- `3d-clay` → "clay render"
- `3d-toy` → "toy-like figurine-like"
- `3d-low-poly` → "low poly"

### 2. Question Nodes
**File:** `src/data/questions/style-art.json`

Contains 5 question nodes:

1. **style-artstyle-root** (Main question)
   - Question: "What overall art style do you imagine?"
   - Description: "Choose the artistic style for your image"
   - Options: All 8 main art styles
   - Custom Extensions: All main styles allow custom text
   - Next: `null` (completes flow, but sub-questions available)

2. **style-anime-sub** (Anime refinement)
   - Question: "What type of anime style?"
   - Options: All 8 anime sub-styles
   - Next: `null`

3. **style-realism-sub** (Realism refinement)
   - Question: "What type of realistic style?"
   - Options: All 5 realism sub-styles
   - Next: `null`

4. **style-painting-sub** (Painting refinement)
   - Question: "What type of painting style?"
   - Options: All 7 painting sub-styles
   - Next: `null`

5. **style-3d-sub** (3D refinement)
   - Question: "What type of 3D style?"
   - Options: All 5 3D sub-styles
   - Next: `null`

## Integration

### Flow Connection
- Character archetype flavor question → automatically transitions to `style-artstyle-root`
- Style main question completes the basic flow
- Sub-questions are available for refinement (can be linked conditionally in future)

### Conflict Handling
- Anime style conflicts with realistic and semi-realistic
- Realistic conflicts with anime
- Semi-realistic conflicts with anime and realistic
- Other styles have no conflicts

## Usage Example

1. User completes character archetype → Selects "mage" with "cursed" flavor
2. Automatically transitions to style question → "What overall art style do you imagine?"
3. User selects "anime style" → Can add custom extension (e.g., "with vibrant colors")
4. Flow completes
5. Final prompt includes: "mage, cursed, anime style with vibrant colors"

## Future Enhancements

- Conditional sub-questions: Show anime-sub only if anime was selected
- Style intensity weights: Add modifier controls for style emphasis
- Additional sub-styles: Expand painting, 3D, and other categories
- Style combinations: Allow multiple style selections with proper conflict handling

