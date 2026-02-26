import type { WorkingSetHubEntry } from '../types';

const now = Date.parse('2026-02-20T12:00:00Z');
const day = 24 * 60 * 60 * 1000;

const buildWorkingSet = (id: string, name: string, buckets: Record<string, string[]>) => ({
  id,
  name,
  createdAt: now - day * 20,
  updatedAt: now - day * 5,
  categoryBuckets: Object.fromEntries(
    Object.entries(buckets).map(([categoryId, items]) => [
      categoryId,
      items.map((text, index) => ({
        id: `${id}_${categoryId}_${index + 1}`,
        poolId: `${id}_pool_${categoryId}`,
        poolItemId: `${id}_item_${index + 1}`,
        text,
        addedAt: now - day * 10,
      })),
    ])
  ),
});

export const workingSetHubMock: WorkingSetHubEntry[] = [
  {
    id: 'hub_ws_cinematic_portrait',
    creator: 'Studio Opal',
    title: 'Cinematic Portrait Set',
    summary: 'Focused portrait workflow with cinematic lighting and camera cues.',
    description:
      'A tight working set that keeps portraits consistent: subject descriptors, controlled lighting, and camera instructions.',
    tags: ['portrait', 'cinematic', 'lighting', 'camera'],
    category: 'Photography',
    languages: ['en'],
    license: 'CC-BY',
    heroImageUrl: null,
    ratingAvg: 4.6,
    ratingCount: 84,
    downloads: 960,
    createdAt: now - day * 40,
    updatedAt: now - day * 5,
    payload: buildWorkingSet('ws_cinematic_portrait', 'Cinematic Portrait Set', {
      subject: ['studio portrait', 'expressive gaze', 'three-quarter pose'],
      lighting: ['soft key light', 'rim light glow'],
      camera: ['85mm lens', 'shallow depth of field'],
      'post-processing': ['cinematic color grade', 'subtle film grain'],
    }),
  },
  {
    id: 'hub_ws_painterly_landscape',
    creator: 'Golden Vale',
    title: 'Painterly Landscape Set',
    summary: 'Painterly landscapes with soft gradients and atmospheric depth.',
    description:
      'Use this working set to keep scenic landscapes cohesive with painterly texture and mood.',
    tags: ['landscape', 'painterly', 'atmosphere'],
    category: 'Illustration',
    languages: ['en'],
    license: 'CC0',
    heroImageUrl: null,
    ratingAvg: 4.7,
    ratingCount: 62,
    downloads: 730,
    createdAt: now - day * 30,
    updatedAt: now - day * 2,
    payload: buildWorkingSet('ws_painterly_landscape', 'Painterly Landscape Set', {
      environment: ['rolling hills', 'misty horizon', 'distant mountains'],
      lighting: ['warm sunrise glow', 'soft atmospheric light'],
      style: ['painterly brush strokes', 'soft gradients'],
      effects: ['light haze', 'subtle bloom'],
    }),
  },
];
