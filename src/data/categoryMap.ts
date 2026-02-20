/**
 * Category Navigation Map
 * 
 * Maps category IDs to their entry node IDs for direct navigation.
 * Supports hierarchical structure with subcategories.
 */

export interface CategoryItem {
  label: string;
  nodeId?: string; // If provided, clicking navigates to this node
  subcategories?: CategoryItem[]; // Nested subcategories
}

export interface CategoryStructure {
  [categoryId: string]: CategoryItem[];
}

/**
 * Category map for navigation
 * 
 * Maps category IDs to their entry node IDs for direct navigation.
 */
export const CATEGORY_MAP: CategoryStructure = {
  subject: [
    {
      label: "People",
      nodeId: "subject-person-root"
    },
    {
      label: "Animals",
      nodeId: "subject-animal-root"
    },
    {
      label: "Characters",
      nodeId: "subject-character-root"
    },
    {
      label: "Creatures",
      nodeId: "subject-creature-root"
    },
    {
      label: "Objects",
      nodeId: "subject-object-root"
    },
    {
      label: "Count",
      nodeId: "subject-count-root"
    },
    {
      label: "Anatomy Issues",
      nodeId: "subject-anatomy-root"
    },
    {
      label: "NSFW",
      nodeId: "subject-nsfw-root"
    }
  ],
  style: [
    {
      label: "Illustration",
      nodeId: "style-illustration-root"
    },
    {
      label: "Realistic",
      nodeId: "style-realistic-root"
    },
    {
      label: "Painting",
      nodeId: "style-painting-root"
    },
    {
      label: "Digital",
      nodeId: "style-digital-root"
    },
    {
      label: "Cinematic",
      nodeId: "style-cinematic-root"
    },
    {
      label: "Genre",
      nodeId: "style-genre-root"
    },
    {
      label: "Minimalist",
      nodeId: "style-minimalist-root"
    }
  ],
  lighting: [
    {
      label: "Intensity",
      nodeId: "lighting-intensity-root"
    },
    {
      label: "Quality",
      nodeId: "lighting-quality-root"
    },
    {
      label: "Direction",
      nodeId: "lighting-direction-root"
    },
    {
      label: "Style",
      nodeId: "lighting-style-root"
    },
    {
      label: "Time-Based",
      nodeId: "lighting-time-root"
    },
    {
      label: "Cinematic",
      nodeId: "lighting-cinematic-root"
    },
    {
      label: "Artifacts",
      nodeId: "lighting-artifact-root"
    }
  ],
  camera: [
    {
      label: "Lens",
      nodeId: "camera-lens-root"
    },
    {
      label: "Depth of Field",
      nodeId: "camera-dof-root"
    },
    {
      label: "Stability",
      nodeId: "camera-stability-root"
    },
    {
      label: "Exposure & Motion",
      nodeId: "camera-exposure-root"
    },
    {
      label: "Specialty",
      nodeId: "camera-special-root"
    },
    {
      label: "Artifacts",
      nodeId: "camera-artifact-root"
    }
  ],
  environment: [
    {
      label: "Location",
      nodeId: "environment-location-root"
    },
    {
      label: "Setting",
      nodeId: "environment-setting-root"
    },
    {
      label: "Biome",
      nodeId: "environment-biome-root"
    },
    {
      label: "Space Density",
      nodeId: "environment-space-root"
    },
    {
      label: "Background",
      nodeId: "environment-background-root"
    },
    {
      label: "Artifacts",
      nodeId: "environment-artifact-root"
    }
  ],
  quality: [
    {
      label: "Quality Level",
      nodeId: "quality-level-root"
    },
    {
      label: "Resolution",
      nodeId: "quality-resolution-root"
    },
    {
      label: "Detail",
      nodeId: "quality-detail-root"
    },
    {
      label: "Focus",
      nodeId: "quality-focus-root"
    },
    {
      label: "Noise",
      nodeId: "quality-noise-root"
    },
    {
      label: "Cleanliness",
      nodeId: "quality-clean-root"
    },
    {
      label: "Artifacts",
      nodeId: "quality-artifact-root"
    }
  ],
  effects: [
    {
      label: "Atmospheric",
      nodeId: "effects-atmospheric-root"
    },
    {
      label: "Weather",
      nodeId: "effects-weather-root"
    },
    {
      label: "Particles",
      nodeId: "effects-particle-root"
    },
    {
      label: "Fire & Energy",
      nodeId: "effects-fire-root"
    },
    {
      label: "Water",
      nodeId: "effects-water-root"
    },
    {
      label: "Light & Optical",
      nodeId: "effects-light-root"
    },
    {
      label: "Artifacts",
      nodeId: "effects-artifact-root"
    }
  ],
  "post-processing": [
    {
      label: "Color & Tone",
      nodeId: "post-processing-color-root"
    },
    {
      label: "Contrast",
      nodeId: "post-processing-contrast-root"
    },
    {
      label: "Sharpness",
      nodeId: "post-processing-sharpness-root"
    },
    {
      label: "Atmospheric",
      nodeId: "post-processing-atmospheric-root"
    },
    {
      label: "Texture",
      nodeId: "post-processing-texture-root"
    },
    {
      label: "Optical",
      nodeId: "post-processing-optical-root"
    },
    {
      label: "Artifacts",
      nodeId: "post-processing-artifact-root"
    }
  ],
  actions: [
    {
      label: "Actions",
      nodeId: "actions-root"
    }
  ],
  "anatomy-details": [
    {
      label: "Breasts",
      nodeId: "anatomy-details-breasts"
    },
    {
      label: "Hips & Waist",
      nodeId: "anatomy-details-hips-waist"
    },
    {
      label: "Buttocks",
      nodeId: "anatomy-details-buttocks"
    },
    {
      label: "Thighs & Legs",
      nodeId: "anatomy-details-thighs-legs"
    },
    {
      label: "Penis",
      nodeId: "anatomy-details-penis"
    },
    {
      label: "Vagina & Labia",
      nodeId: "anatomy-details-vagina-labia"
    },
    {
      label: "Anal",
      nodeId: "anatomy-details-anal"
    },
    {
      label: "Overall Body Type",
      nodeId: "anatomy-details-body-type"
    },
    {
      label: "Skin & Surface Details",
      nodeId: "anatomy-details-skin-surface"
    },
    {
      label: "Pubic Hair",
      nodeId: "anatomy-details-pubic-hair"
    }
  ]
};

