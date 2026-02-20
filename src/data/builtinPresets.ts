import { BuiltinPreset } from '../types';

export const BUILTIN_PRESETS: BuiltinPreset[] = [
  {
    id: 'curated-flux-portrait',
    name: 'Cinematic Portrait',
    description: 'Moody portrait with cinematic lighting and shallow depth of field.',
    modelId: 'flux-1-dev',
    useCase: 't2i',
    schemaVersion: '1.0',
    state: {
      sections: {
        main: 'a moody close-up portrait of a subject in soft window light',
        style: ['cinematic', 'film grain', 'high contrast'],
        camera: ['85mm lens', 'shallow depth of field'],
        lighting: ['soft key light', 'subtle rim light'],
      },
      negativePrompt: 'low quality, blurry, distorted',
      metadata: {
        aspect_ratio: '4:5',
        seed: '',
      },
    },
    tags: ['portrait', 'cinematic'],
  },
  {
    id: 'curated-flux-architecture',
    name: 'Modern Architecture',
    description: 'Clean architectural study with strong geometry and light.',
    modelId: 'flux-1-dev',
    useCase: 't2i',
    schemaVersion: '1.0',
    state: {
      sections: {
        main: 'minimalist modern building with sharp lines and reflective glass',
        style: ['architectural', 'photorealistic'],
        camera: ['wide angle', 'low angle'],
        lighting: ['golden hour', 'long shadows'],
      },
      negativePrompt: 'crowds, clutter, low detail',
      metadata: {
        aspect_ratio: '16:9',
        seed: '',
      },
    },
    tags: ['architecture', 'minimal'],
  },
  {
    id: 'curated-ltx2-night-market',
    name: 'Neon Night Market (2 scenes)',
    description: 'Two-scene neon noir chase with ambience and camera motion.',
    modelId: 'ltx2-video',
    useCase: 't2v',
    schemaVersion: '1.0',
    state: {
      sections: {
        global_main: 'a neon-lit night market chase in the rain',
        global_style: ['cinematic', 'neon noir'],
        global_color: ['teal and magenta', 'high contrast'],
        sound_profile: ['rain ambience', 'distant traffic', 'muffled footsteps'],
        scene: ['wide establishing shot of the market', 'close-up chase through alley'],
        scene_duration: [8, 6],
        scene_camera: ['dolly', 'handheld'],
      },
      negativePrompt: 'jitter, flicker, artifacts',
      metadata: {
        fps: 24,
        total_duration: 14,
        aspect_ratio: '16:9',
      },
    },
    tags: ['video', 'neon'],
  },
];
