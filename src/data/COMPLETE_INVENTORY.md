# COMPLETE DATA INVENTORY - OLD GENERATOR

## Purpose
This document lists ALL categories, files, and estimated attribute counts from the old generator to ensure complete migration.

## File Structure

### ROOT
- `root.json` - Entry point (3 answers)

### CHARACTER (16 files)
1. `character/identity.json` - Character identity/type (4 answers + sub-questions)
2. `character/ethnicity.json` - Ethnic background (9 answers)
3. `character/archetype.json` - Character archetype (10 archetypes + 6 flavors)
4. `character/expression.json` - Facial expressions (11 expressions + intensity)
5. `character/pose.json` - Character poses (stance + gesture options)
6. `character/clothing.json` - Clothing styles (8 categories with sub-options)
7. `character/accessories.json` - Accessories (7 categories with sub-options)
8. `character/face.json` - Face details (face shape, eyes, jawline, lips, eyebrows)
9. `character/face_art.json` - Face art/makeup (7 categories with many sub-options)
10. `character/personality.json` - Personality traits (10 traits + intensity)
11. `character/powers.json` - Special powers (magic + sci-fi abilities)
12. `character/fantasy_races.json` - Fantasy races (8 races with sub-types)
13. `character/scifi_races.json` - Sci-fi beings (5 types with sub-variants)
14. `character/nsfw.json` - NSFW attributes (7 categories with detailed options)
15. `character/body_hair.json` - Body hair (4 attributes: amount, texture, color, location)
16. `character/hair.json` - Hair styles (NOT YET SCANNED - NEEDS VERIFICATION)

### STYLE (10 files)
1. `style/artstyle_root.json` - Main art style selection (8 styles)
2. `style/anime_styles.json` - Anime sub-styles (8 types + weights)
3. `style/realism_styles.json` - Realism sub-styles (5 types + weights)
4. `style/painting_styles.json` - Painting styles (7 types + weights)
5. `style/3d_styles.json` - 3D render styles (5 types + weights)
6. `style/cinematic_styles.json` - Cinematic styles (6 types + weights)
7. `style/color_palettes.json` - Color palettes (8 palettes + saturation)
8. `style/texture_materials.json` - Material textures (8 materials + presence)
9. `style/lighting.json` - Lighting styles (12 types + intensity)
10. `style/lighting.json` - (duplicate check needed)

### ENVIRONMENT (12 files)
1. `environment/env_root.json` - Environment type selection (7 types)
2. `environment/nature_biomes.json` - Natural biomes (8 biomes with sub-types)
3. `environment/cities_and_settlements.json` - Cities (6 types + detail + density)
4. `environment/interiors.json` - Interior spaces (5 types with sub-options)
5. `environment/fantasy_realms.json` - Fantasy realms (6 types + intensity)
6. `environment/scifi_worlds.json` - Sci-fi worlds (6 types + intensity)
7. `environment/ruins_and_structures.json` - Ruins (5 types + condition)
8. `environment/atmosphere_and_mood.json` - Atmosphere/mood (7 moods + intensity + fog)
9. `environment/time_of_day.json` - Time of day (6 times)
10. `environment/weather.json` - Weather (6 types + intensity)
11. `environment/terrain_details.json` - Terrain details (7 options)

### CAMERA (7 files)
1. `camera/angle_and_perspective.json` - Camera angles (6 angles)
2. `camera/framing_and_composition.json` - Framing (6 shot types)
3. `camera/perspective.json` - Visual perspective (7 perspectives with refinements)
4. `camera/lens_and_focal_length.json` - Focal length (4 types)
5. `camera/depth_of_field.json` - Depth of field (4 levels + strength)
6. `camera/motion_and_blur.json` - Motion blur (4 levels + strength)
7. `camera/render_quality.json` - Render quality (3 levels)

### EFFECTS (14 files)
1. `effects/effects_root.json` - Effects category selection (8 categories)
2. `effects/lighting_effects.json` - Lighting effects (6 categories with many sub-options)
3. `effects/light_effects.json` - Light effects (6 types + intensity)
4. `effects/atmosphere_particles.json` - Atmosphere/particles (4 categories with sub-options)
5. `effects/fog_and_haze.json` - Fog/haze (5 types)
6. `effects/particles_and_sparks.json` - Particles/sparks (6 types + intensity)
7. `effects/magic_and_aura.json` - Magic/aura (4 types + intensity)
8. `effects/magical_energetic.json` - Magical/energetic (3 categories with sub-options)
9. `effects/color_grading_mood.json` - Color grading (3 categories with many sub-options)
10. `effects/distortions_and_glitches.json` - Distortions (3 types)
11. `effects/post_processing_film.json` - Post-processing (3 categories with sub-options)
12. `effects/surface_material_fx.json` - Surface/material FX (3 categories with sub-options)
13. `effects/camera_resolution_boosters.json` - Camera/resolution boosters (2 categories with sub-options)

## ESTIMATED TOTAL ATTRIBUTES

### Character Category
- Identity: ~20 attributes
- Ethnicity: ~9 attributes
- Archetype: ~16 attributes
- Expression: ~14 attributes
- Pose: ~15 attributes
- Clothing: ~50+ attributes (multiple sub-categories)
- Accessories: ~40+ attributes (multiple sub-categories)
- Face: ~50+ attributes (multiple face features)
- Face Art: ~100+ attributes (extensive makeup/art options)
- Personality: ~13 attributes
- Powers: ~20+ attributes
- Fantasy Races: ~30+ attributes
- Sci-fi Races: ~20+ attributes
- NSFW: ~50+ attributes
- Body Hair: ~25 attributes
- Hair: ~? (NEEDS VERIFICATION)

**Character Subtotal: ~450+ attributes**

### Style Category
- Art Style Root: ~8 attributes
- Anime Styles: ~11 attributes
- Realism Styles: ~8 attributes
- Painting Styles: ~10 attributes
- 3D Styles: ~8 attributes
- Cinematic Styles: ~9 attributes
- Color Palettes: ~12 attributes
- Texture Materials: ~11 attributes
- Lighting: ~15 attributes

**Style Subtotal: ~90+ attributes**

### Environment Category
- Env Root: ~7 attributes
- Nature Biomes: ~30+ attributes
- Cities: ~20+ attributes
- Interiors: ~20+ attributes
- Fantasy Realms: ~9 attributes
- Sci-fi Worlds: ~9 attributes
- Ruins: ~9 attributes
- Atmosphere/Mood: ~12 attributes
- Time of Day: ~6 attributes
- Weather: ~9 attributes
- Terrain Details: ~7 attributes

**Environment Subtotal: ~140+ attributes**

### Camera Category
- Angle/Perspective: ~6 attributes
- Framing: ~6 attributes
- Perspective: ~30+ attributes (with refinements)
- Lens/Focal: ~4 attributes
- Depth of Field: ~7 attributes
- Motion/Blur: ~7 attributes
- Render Quality: ~4 attributes

**Camera Subtotal: ~65+ attributes**

### Effects Category
- Effects Root: ~8 attributes
- Lighting Effects: ~50+ attributes (extensive sub-categories)
- Light Effects: ~9 attributes
- Atmosphere/Particles: ~30+ attributes
- Fog/Haze: ~5 attributes
- Particles/Sparks: ~9 attributes
- Magic/Aura: ~7 attributes
- Magical/Energetic: ~20+ attributes
- Color Grading: ~30+ attributes
- Distortions: ~3 attributes
- Post-Processing: ~20+ attributes
- Surface/Material FX: ~15+ attributes
- Camera/Resolution Boosters: ~15+ attributes

**Effects Subtotal: ~220+ attributes**

## GRAND TOTAL ESTIMATE
**~965+ attributes across all categories**

## MIGRATION VERIFICATION CHECKLIST

- [ ] All 60+ JSON files are found by glob pattern
- [ ] All nodes are collected in first pass
- [ ] All answers are converted to AttributeDefinitions
- [ ] All question nodes are created with correct attributeIds
- [ ] All nextNodeId links are preserved
- [ ] All conflictsWith relationships are inferred
- [ ] All isNegative flags are set correctly
- [ ] All categories are inferred correctly
- [ ] All semantic priorities are assigned
- [ ] Total attribute count matches estimate (~965+)
- [ ] Total question node count matches file count

## KNOWN ISSUES TO ADDRESS

1. **Hair category not yet scanned** - Need to read `character/hair.json`
2. **Abstract answers** - Some nodes may have abstract answers that need expansion
3. **Weight templates** - Old generator has weight sliders that map to Modifiers
4. **Skip answers** - Navigation-only answers should be skipped but nextNodeId captured
5. **Duplicate node IDs** - Need to verify no conflicts

## NEXT STEPS

1. Verify glob pattern finds ALL files
2. Add logging to show file count and node count
3. Verify migration processes every answer
4. Compare final counts against this inventory
5. Document any missing or unmigrated data

