import type { PoolHubEntry } from '../types';

const now = Date.parse('2026-02-20T12:00:00Z');
const day = 24 * 60 * 60 * 1000;

const buildPool = (
  id: string,
  name: string,
  createdAt: number,
  updatedAt: number,
  items: Array<{ text: string; tags?: string[] }>
) => ({
  id,
  name,
  createdAt,
  updatedAt,
  items: items.map((item, index) => ({
    id: `${id}_item_${index + 1}`,
    text: item.text,
    tags: item.tags,
  })),
});

export const poolHubMock: PoolHubEntry[] = [
  {
    id: 'hub_cine_portrait',
    creator: 'Studio Opal',
    title: 'Cinematic Portrait Studio',
    summary: 'High-contrast studio portraits with cinematic tone mapping.',
    description:
      'A focused pool for creating cinematic studio portraits. Emphasizes controlled lighting, shallow depth of field, and modern color grading.',
    tags: ['portrait', 'studio', 'cinematic', 'lighting'],
    category: 'Photography',
    languages: ['en'],
    license: 'CC-BY',
    heroImageUrl: null,
    ratingAvg: 4.7,
    ratingCount: 128,
    downloads: 3120,
    createdAt: now - day * 40,
    updatedAt: now - day * 3,
    payload: buildPool(
      'cine_portrait_pool',
      'Cinematic Portrait Studio',
      now - day * 40,
      now - day * 3,
      [
        { text: 'cinematic portrait, shallow depth of field', tags: ['portrait'] },
        { text: 'soft key light, rim lighting', tags: ['lighting'] },
        { text: '85mm lens, f1.4, bokeh', tags: ['camera'] },
        { text: 'moody color grading, teal and amber', tags: ['color'] },
        { text: 'studio backdrop, subtle haze', tags: ['studio'] },
      ]
    ),
  },
  {
    id: 'hub_ancient_ruins',
    creator: 'Northwind Atlas',
    title: 'Ancient Ruins Explorer',
    summary: 'Overgrown temples, misty courtyards, and lost civilizations.',
    description:
      'Environment-focused pool featuring ruins, weathered stone, moss, and dramatic atmospheric lighting.',
    tags: ['environment', 'ruins', 'mist', 'adventure'],
    category: 'Environment',
    languages: ['en'],
    license: 'CC0',
    heroImageUrl: null,
    ratingAvg: 4.5,
    ratingCount: 94,
    downloads: 2260,
    createdAt: now - day * 60,
    updatedAt: now - day * 7,
    payload: buildPool(
      'ancient_ruins_pool',
      'Ancient Ruins Explorer',
      now - day * 60,
      now - day * 7,
      [
        { text: 'ancient stone temple, crumbling pillars', tags: ['structure'] },
        { text: 'overgrown vines, mossy surfaces', tags: ['nature'] },
        { text: 'morning mist, volumetric light', tags: ['lighting'] },
        { text: 'wide establishing shot, cinematic scale', tags: ['composition'] },
        { text: 'weathered carvings, relics', tags: ['detail'] },
      ]
    ),
  },
  {
    id: 'hub_scifi_ui',
    creator: 'Signal Forge',
    title: 'Sci-Fi UI Elements',
    summary: 'Futuristic interfaces, holograms, and neon HUDs.',
    description:
      'Designed for sci-fi dashboards, holographic overlays, and modern interface elements for concept art.',
    tags: ['sci-fi', 'ui', 'hologram', 'neon'],
    category: 'Design',
    languages: ['en'],
    license: 'CC-BY',
    heroImageUrl: null,
    ratingAvg: 4.3,
    ratingCount: 61,
    downloads: 1840,
    createdAt: now - day * 28,
    updatedAt: now - day * 2,
    payload: buildPool(
      'scifi_ui_pool',
      'Sci-Fi UI Elements',
      now - day * 28,
      now - day * 2,
      [
        { text: 'transparent HUD overlay, holographic panels', tags: ['ui'] },
        { text: 'neon cyan accents, glowing edges', tags: ['color'] },
        { text: 'data visualizations, radial charts', tags: ['interface'] },
        { text: 'floating icons, soft bloom', tags: ['effects'] },
        { text: 'dark background, high contrast UI', tags: ['contrast'] },
      ]
    ),
  },
  {
    id: 'hub_mythic_creatures',
    creator: 'Arcane Atelier',
    title: 'Mythic Creatures',
    summary: 'Dragons, spirits, and legendary beasts with rich texture.',
    description:
      'A pool of mythic creature descriptors and cinematic staging for fantasy illustration.',
    tags: ['fantasy', 'creature', 'epic', 'illustration'],
    category: 'Illustration',
    languages: ['en'],
    license: 'CC-BY-SA',
    heroImageUrl: null,
    ratingAvg: 4.8,
    ratingCount: 172,
    downloads: 4010,
    createdAt: now - day * 120,
    updatedAt: now - day * 10,
    payload: buildPool(
      'mythic_creatures_pool',
      'Mythic Creatures',
      now - day * 120,
      now - day * 10,
      [
        { text: 'ancient dragon with obsidian scales', tags: ['creature'] },
        { text: 'glowing runes, mystical aura', tags: ['magic'] },
        { text: 'stormy skies, dramatic backlight', tags: ['lighting'] },
        { text: 'epic scale, cinematic composition', tags: ['composition'] },
        { text: 'detailed feathers and horns', tags: ['detail'] },
      ]
    ),
  },
  {
    id: 'hub_fashion_lookbook',
    creator: 'Vanta Editorial',
    title: 'Fashion Lookbook',
    summary: 'Modern editorial styling for apparel and lifestyle shoots.',
    description:
      'Curated phrases for fashion lookbooks, styling, fabric details, and editorial lighting.',
    tags: ['fashion', 'editorial', 'modern', 'styling'],
    category: 'Photography',
    languages: ['en'],
    license: 'CC-BY',
    heroImageUrl: null,
    ratingAvg: 4.2,
    ratingCount: 43,
    downloads: 1230,
    createdAt: now - day * 18,
    updatedAt: now - day * 1,
    payload: buildPool(
      'fashion_lookbook_pool',
      'Fashion Lookbook',
      now - day * 18,
      now - day * 1,
      [
        { text: 'editorial fashion pose, clean backdrop', tags: ['pose'] },
        { text: 'softbox lighting, minimal shadows', tags: ['lighting'] },
        { text: 'textured fabric detail, close-up', tags: ['detail'] },
        { text: 'streetwear styling, layered silhouettes', tags: ['styling'] },
        { text: 'neutral palette with accent color', tags: ['color'] },
      ]
    ),
  },
  {
    id: 'hub_painterly_landscapes',
    creator: 'Golden Vale',
    title: 'Painterly Landscapes',
    summary: 'Brushy textures and soft gradients for scenic views.',
    description:
      'Landscape pool with painterly treatment, atmospheric perspective, and tranquil lighting cues.',
    tags: ['landscape', 'painterly', 'atmospheric', 'serene'],
    category: 'Illustration',
    languages: ['en'],
    license: 'CC0',
    heroImageUrl: null,
    ratingAvg: 4.6,
    ratingCount: 88,
    downloads: 1975,
    createdAt: now - day * 75,
    updatedAt: now - day * 5,
    payload: buildPool(
      'painterly_landscapes_pool',
      'Painterly Landscapes',
      now - day * 75,
      now - day * 5,
      [
        { text: 'soft brush strokes, painterly texture', tags: ['style'] },
        { text: 'rolling hills, distant mountains', tags: ['environment'] },
        { text: 'warm sunrise glow, soft gradients', tags: ['lighting'] },
        { text: 'misty horizon, atmospheric depth', tags: ['atmosphere'] },
        { text: 'serene mood, minimal clutter', tags: ['mood'] },
      ]
    ),
  },
];
