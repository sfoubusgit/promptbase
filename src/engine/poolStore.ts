import type { Pool, PoolItem, PoolStore } from '../types';

const STORAGE_KEY = 'promptgen:user_pools';

const blankStore = (): PoolStore => ({ version: 1, pools: [] });

const normalizeText = (value: string): string =>
  value.replace(/\s+/g, ' ').trim();

const makeId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const SEED_POOL_NAME = 'Nature elements and phrases';
const CREATIVE_POOL_NAME = 'Surreal scenes and motifs';
const FOGBOUND_POOL_NAME = 'Fogbound Forestcore';
const APOTHECARY_POOL_NAME = 'Wildcrafted Apothecary';
const DESERT_NOMAD_POOL_NAME = 'Desert Sun Nomad';
const ARCTIC_SILENCE_POOL_NAME = 'Arctic Silencecore';
const FAERGHUS_KNIGHT_POOL_NAME = 'Faerghus Frostbound Knight';

const createSeedPool = (): Pool => {
  const now = Date.now();
  return {
    id: makeId('pool'),
    name: SEED_POOL_NAME,
    createdAt: now,
    updatedAt: now,
    items: [
      { id: makeId('item'), text: 'misty pine forest', tags: ['nature', 'forest'] },
      { id: makeId('item'), text: 'sunlit meadow', tags: ['nature', 'meadow'] },
      { id: makeId('item'), text: 'ancient oak tree', tags: ['nature', 'tree'] },
      { id: makeId('item'), text: 'rocky mountain ridge', tags: ['nature', 'mountain'] },
      { id: makeId('item'), text: 'winding river', tags: ['nature', 'water'] },
      { id: makeId('item'), text: 'waterfall spray', tags: ['nature', 'water'] },
      { id: makeId('item'), text: 'fog rolling over hills', tags: ['nature', 'atmosphere'] },
      { id: makeId('item'), text: 'wildflower field', tags: ['nature', 'flowers'] },
      { id: makeId('item'), text: 'mossy stones', tags: ['nature', 'forest'] },
      { id: makeId('item'), text: 'golden hour haze', tags: ['nature', 'light'] },
      { id: makeId('item'), text: 'rain-soaked leaves', tags: ['nature', 'rain'] },
      { id: makeId('item'), text: 'starry night sky', tags: ['nature', 'sky'] },
      { id: makeId('item'), text: 'coastal cliffs', tags: ['nature', 'coast'] },
      { id: makeId('item'), text: 'snow-dusted peaks', tags: ['nature', 'snow'] },
      { id: makeId('item'), text: 'glowing bioluminescent fungi', tags: ['nature', 'forest'] },
      { id: makeId('item'), text: 'desert dunes at dusk', tags: ['nature', 'desert'] },
    ],
  };
};

const createCreativePool = (): Pool => {
  const now = Date.now();
  return {
    id: makeId('pool'),
    name: CREATIVE_POOL_NAME,
    createdAt: now,
    updatedAt: now,
    items: [
      { id: makeId('item'), text: 'a city floating above a calm ocean', tags: ['surreal', 'city'] },
      { id: makeId('item'), text: 'a mirror lake reflecting a second sky', tags: ['surreal', 'water'] },
      { id: makeId('item'), text: 'endless stairways spiraling into clouds', tags: ['surreal', 'architecture'] },
      { id: makeId('item'), text: 'a desert of glass with soft blue dunes', tags: ['surreal', 'desert'] },
      { id: makeId('item'), text: 'a forest where trees glow like lanterns', tags: ['surreal', 'forest'] },
      { id: makeId('item'), text: 'a train of light crossing the night sky', tags: ['surreal', 'sky'] },
      { id: makeId('item'), text: 'a waterfall that flows upward', tags: ['surreal', 'water'] },
      { id: makeId('item'), text: 'a mountain split open revealing starlight', tags: ['surreal', 'mountain'] },
      { id: makeId('item'), text: 'a quiet library floating in space', tags: ['surreal', 'interior'] },
      { id: makeId('item'), text: 'a giant moon resting on a meadow', tags: ['surreal', 'moon'] },
      { id: makeId('item'), text: 'a river of clouds through a canyon', tags: ['surreal', 'atmosphere'] },
      { id: makeId('item'), text: 'a lighthouse on an endless plain', tags: ['surreal', 'landscape'] },
    ],
  };
};

const createFogboundPool = (): Pool => {
  const now = Date.now();
  return {
    id: makeId('pool'),
    name: FOGBOUND_POOL_NAME,
    createdAt: now,
    updatedAt: now,
    items: [
      { id: makeId('item'), text: 'fog-laced conifer grove', tags: ['fog', 'forest', 'atmosphere'] },
      { id: makeId('item'), text: 'moss-draped roots', tags: ['forest', 'moss', 'texture'] },
      { id: makeId('item'), text: 'silver mist threading through ferns', tags: ['fog', 'forest'] },
      { id: makeId('item'), text: 'dew-heavy spiderwebs', tags: ['fog', 'detail'] },
      { id: makeId('item'), text: 'weathered stone path', tags: ['forest', 'path'] },
      { id: makeId('item'), text: 'ancient cedar silhouettes', tags: ['forest', 'trees'] },
      { id: makeId('item'), text: 'lichen-speckled boulders', tags: ['forest', 'stone'] },
      { id: makeId('item'), text: 'soft lantern glow in the mist', tags: ['fog', 'light'] },
      { id: makeId('item'), text: 'dripping canopy hush', tags: ['forest', 'rain'] },
      { id: makeId('item'), text: 'half-hidden shrine', tags: ['forest', 'mystic'] },
      { id: makeId('item'), text: 'trail of scattered pinecones', tags: ['forest', 'detail'] },
      { id: makeId('item'), text: 'old wooden footbridge', tags: ['forest', 'structure'] },
      { id: makeId('item'), text: 'mist curling around trunks', tags: ['fog', 'forest'] },
      { id: makeId('item'), text: 'quiet creek shimmer', tags: ['forest', 'water'] },
      { id: makeId('item'), text: 'fern-shadowed ground cover', tags: ['forest', 'foliage'] },
      { id: makeId('item'), text: 'soft footsteps on damp earth', tags: ['forest', 'mood'] },
    ],
  };
};

const createApothecaryPool = (): Pool => {
  const now = Date.now();
  return {
    id: makeId('pool'),
    name: APOTHECARY_POOL_NAME,
    createdAt: now,
    updatedAt: now,
    items: [
      { id: makeId('item'), text: 'shelf of amber tincture bottles', tags: ['apothecary', 'glass'] },
      { id: makeId('item'), text: 'bundles of dried herbs', tags: ['apothecary', 'herbs'] },
      { id: makeId('item'), text: 'mortar and pestle stained green', tags: ['apothecary', 'tools'] },
      { id: makeId('item'), text: 'handwritten remedy labels', tags: ['apothecary', 'detail'] },
      { id: makeId('item'), text: 'brass scale with tiny weights', tags: ['apothecary', 'tools'] },
      { id: makeId('item'), text: 'beeswax candles with soft glow', tags: ['apothecary', 'light'] },
      { id: makeId('item'), text: 'stacks of aged recipe books', tags: ['apothecary', 'books'] },
      { id: makeId('item'), text: 'linen sachets tied with twine', tags: ['apothecary', 'herbs'] },
      { id: makeId('item'), text: 'copper distillation coil', tags: ['apothecary', 'tools'] },
      { id: makeId('item'), text: 'jars of dried mushrooms', tags: ['apothecary', 'fungi'] },
      { id: makeId('item'), text: 'pressed wildflower pages', tags: ['apothecary', 'botanical'] },
      { id: makeId('item'), text: 'smoky resin incense', tags: ['apothecary', 'atmosphere'] },
      { id: makeId('item'), text: 'crystal vials with shimmering oils', tags: ['apothecary', 'glass'] },
      { id: makeId('item'), text: 'wooden counter worn smooth', tags: ['apothecary', 'interior'] },
      { id: makeId('item'), text: 'woven baskets of roots and bark', tags: ['apothecary', 'herbs'] },
      { id: makeId('item'), text: 'herbal steam curling in the air', tags: ['apothecary', 'atmosphere'] },
    ],
  };
};

const createDesertNomadPool = (): Pool => {
  const now = Date.now();
  return {
    id: makeId('pool'),
    name: DESERT_NOMAD_POOL_NAME,
    createdAt: now,
    updatedAt: now,
    items: [
      { id: makeId('item'), text: 'sun-bleached sand dunes', tags: ['desert', 'landscape'] },
      { id: makeId('item'), text: 'wind-carved canyon walls', tags: ['desert', 'terrain'] },
      { id: makeId('item'), text: 'nomad cloak fluttering in the wind', tags: ['nomad', 'fabric'] },
      { id: makeId('item'), text: 'brass compass with worn etching', tags: ['nomad', 'tool'] },
      { id: makeId('item'), text: 'camel caravan on the horizon', tags: ['desert', 'travel'] },
      { id: makeId('item'), text: 'sun-baked leather satchel', tags: ['nomad', 'gear'] },
      { id: makeId('item'), text: 'oasis shimmer in the distance', tags: ['desert', 'water'] },
      { id: makeId('item'), text: 'sandstorm haze', tags: ['desert', 'atmosphere'] },
      { id: makeId('item'), text: 'woven tent with patterned rugs', tags: ['nomad', 'shelter'] },
      { id: makeId('item'), text: 'carved wooden prayer beads', tags: ['nomad', 'ritual'] },
      { id: makeId('item'), text: 'ceramic water flask', tags: ['nomad', 'gear'] },
      { id: makeId('item'), text: 'dune grasses catching light', tags: ['desert', 'flora'] },
      { id: makeId('item'), text: 'solar glare over the flats', tags: ['desert', 'light'] },
      { id: makeId('item'), text: 'trail of footprints in sand', tags: ['desert', 'detail'] },
      { id: makeId('item'), text: 'weathered map scroll', tags: ['nomad', 'map'] },
      { id: makeId('item'), text: 'burning ember campfire', tags: ['nomad', 'light'] },
    ],
  };
};

const createArcticSilencePool = (): Pool => {
  const now = Date.now();
  return {
    id: makeId('pool'),
    name: ARCTIC_SILENCE_POOL_NAME,
    createdAt: now,
    updatedAt: now,
    items: [
      { id: makeId('item'), text: 'frozen fjord expanse', tags: ['arctic', 'landscape'] },
      { id: makeId('item'), text: 'snow-dusted pine silhouettes', tags: ['arctic', 'forest'] },
      { id: makeId('item'), text: 'ice-crusted shoreline', tags: ['arctic', 'ice'] },
      { id: makeId('item'), text: 'soft aurora glow', tags: ['arctic', 'light'] },
      { id: makeId('item'), text: 'frost-laced windowpane', tags: ['arctic', 'detail'] },
      { id: makeId('item'), text: 'wind-carved snowdrifts', tags: ['arctic', 'snow'] },
      { id: makeId('item'), text: 'silent white valley', tags: ['arctic', 'mood'] },
      { id: makeId('item'), text: 'glacial ice cracks', tags: ['arctic', 'ice'] },
      { id: makeId('item'), text: 'faint blue twilight', tags: ['arctic', 'light'] },
      { id: makeId('item'), text: 'distant wolf tracks', tags: ['arctic', 'detail'] },
      { id: makeId('item'), text: 'steam rising from breath', tags: ['arctic', 'atmosphere'] },
      { id: makeId('item'), text: 'snow-laden spruce boughs', tags: ['arctic', 'forest'] },
      { id: makeId('item'), text: 'frozen lake mirror', tags: ['arctic', 'ice'] },
      { id: makeId('item'), text: 'ice lantern glimmer', tags: ['arctic', 'light'] },
      { id: makeId('item'), text: 'distant mountain ridge', tags: ['arctic', 'mountain'] },
      { id: makeId('item'), text: 'whispering snowfall', tags: ['arctic', 'snow'] },
    ],
  };
};

const createFaerghusKnightPool = (): Pool => {
  const now = Date.now();
  return {
    id: makeId('pool'),
    name: FAERGHUS_KNIGHT_POOL_NAME,
    createdAt: now,
    updatedAt: now,
    items: [
      { id: makeId('item'), text: 'frost-rimed plate armor', tags: ['knight', 'armor'] },
      { id: makeId('item'), text: 'ice-blue tabard', tags: ['knight', 'fabric'] },
      { id: makeId('item'), text: 'silver crest on the breastplate', tags: ['knight', 'detail'] },
      { id: makeId('item'), text: 'fur-lined mantle', tags: ['knight', 'winter'] },
      { id: makeId('item'), text: 'snow-dusted warhorse', tags: ['knight', 'mount'] },
      { id: makeId('item'), text: 'frozen breath in the air', tags: ['winter', 'atmosphere'] },
      { id: makeId('item'), text: 'crystalline longsword', tags: ['knight', 'weapon'] },
      { id: makeId('item'), text: 'frosted kite shield', tags: ['knight', 'shield'] },
      { id: makeId('item'), text: 'snow-laden banners', tags: ['knight', 'standard'] },
      { id: makeId('item'), text: 'glacial cathedral backdrop', tags: ['winter', 'architecture'] },
      { id: makeId('item'), text: 'ice-bound battlefield', tags: ['winter', 'scene'] },
      { id: makeId('item'), text: 'cold steel gauntlets', tags: ['knight', 'armor'] },
      { id: makeId('item'), text: 'snowfall drifting past the visor', tags: ['winter', 'atmosphere'] },
      { id: makeId('item'), text: 'frost-bright heraldry', tags: ['knight', 'detail'] },
      { id: makeId('item'), text: 'blue-white glow along the blade', tags: ['knight', 'weapon'] },
      { id: makeId('item'), text: 'winterlight glinting on armor', tags: ['winter', 'light'] },
    ],
  };
};

const createSeedStore = (): PoolStore => ({
  version: 1,
  pools: [
    createSeedPool(),
    createFogboundPool(),
    createApothecaryPool(),
    createDesertNomadPool(),
    createArcticSilencePool(),
    createFaerghusKnightPool(),
  ],
});

const loadStore = (): PoolStore => {
  if (typeof window === 'undefined') return blankStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createSeedStore();
      saveStore(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as PoolStore;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.pools)) {
      return blankStore();
    }
    const seededPools: Pool[] = [];
    if (!parsed.pools.some(pool => pool.name === SEED_POOL_NAME)) {
      seededPools.push(createSeedPool());
    }
    if (!parsed.pools.some(pool => pool.name === CREATIVE_POOL_NAME)) {
      seededPools.push(createCreativePool());
    }
    if (!parsed.pools.some(pool => pool.name === FOGBOUND_POOL_NAME)) {
      seededPools.push(createFogboundPool());
    }
    if (!parsed.pools.some(pool => pool.name === APOTHECARY_POOL_NAME)) {
      seededPools.push(createApothecaryPool());
    }
    if (!parsed.pools.some(pool => pool.name === DESERT_NOMAD_POOL_NAME)) {
      seededPools.push(createDesertNomadPool());
    }
    if (!parsed.pools.some(pool => pool.name === ARCTIC_SILENCE_POOL_NAME)) {
      seededPools.push(createArcticSilencePool());
    }
    if (!parsed.pools.some(pool => pool.name === FAERGHUS_KNIGHT_POOL_NAME)) {
      seededPools.push(createFaerghusKnightPool());
    }
    if (seededPools.length > 0) {
      parsed.pools = [...seededPools, ...parsed.pools];
      saveStore(parsed);
    }
    return parsed;
  } catch {
    return blankStore();
  }
};

const saveStore = (store: PoolStore) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const listPools = (): Pool[] => {
  return loadStore().pools;
};

export const getPool = (poolId: string): Pool | null => {
  return loadStore().pools.find(pool => pool.id === poolId) ?? null;
};

export const createPool = (name: string): Pool => {
  const trimmed = normalizeText(name);
  if (!trimmed) {
    throw new Error('Pool name cannot be empty.');
  }
  const now = Date.now();
  const pool: Pool = {
    id: makeId('pool'),
    name: trimmed,
    createdAt: now,
    updatedAt: now,
    items: [],
  };
  const store = loadStore();
  store.pools.unshift(pool);
  saveStore(store);
  return pool;
};

export const renamePool = (poolId: string, name: string): Pool | null => {
  const trimmed = normalizeText(name);
  if (!trimmed) {
    throw new Error('Pool name cannot be empty.');
  }
  const store = loadStore();
  const next = store.pools.map(pool =>
    pool.id === poolId ? { ...pool, name: trimmed, updatedAt: Date.now() } : pool
  );
  store.pools = next;
  saveStore(store);
  return next.find(pool => pool.id === poolId) ?? null;
};

export const deletePool = (poolId: string): Pool[] => {
  const store = loadStore();
  store.pools = store.pools.filter(pool => pool.id !== poolId);
  saveStore(store);
  return store.pools;
};

export const addItemToPool = (poolId: string, text: string, tags?: string[], note?: string): PoolItem => {
  const normalizedText = normalizeText(text);
  if (!normalizedText) {
    throw new Error('Item text cannot be empty.');
  }
  const store = loadStore();
  const pool = store.pools.find(item => item.id === poolId);
  if (!pool) {
    throw new Error('Pool not found.');
  }
  const item: PoolItem = {
    id: makeId('item'),
    text: normalizedText,
    tags: tags && tags.length > 0 ? tags.map(normalizeText).filter(Boolean) : undefined,
    note: note ? normalizeText(note) : undefined,
  };
  pool.items.unshift(item);
  pool.updatedAt = Date.now();
  saveStore(store);
  return item;
};

export const updatePoolItem = (poolId: string, updated: PoolItem): PoolItem | null => {
  const store = loadStore();
  const pool = store.pools.find(item => item.id === poolId);
  if (!pool) return null;
  pool.items = pool.items.map(item => (item.id === updated.id ? updated : item));
  pool.updatedAt = Date.now();
  saveStore(store);
  return updated;
};

export const deletePoolItem = (poolId: string, itemId: string): PoolItem[] => {
  const store = loadStore();
  const pool = store.pools.find(item => item.id === poolId);
  if (!pool) return [];
  pool.items = pool.items.filter(item => item.id !== itemId);
  pool.updatedAt = Date.now();
  saveStore(store);
  return pool.items;
};

export const exportPoolPayload = (poolId: string): { version: 1; pool: Pool } => {
  const pool = getPool(poolId);
  if (!pool) {
    throw new Error('Pool not found.');
  }
  return {
    version: 1,
    pool,
  };
};

export const importPoolPayload = (
  payload: { version: number; pool: Pool },
  mode: 'merge' | 'replace'
): Pool => {
  if (!payload || payload.version !== 1 || !payload.pool) {
    throw new Error('Invalid pool payload.');
  }
  const incoming = payload.pool;
  const store = loadStore();
  const existingIndex = store.pools.findIndex(pool => pool.name === incoming.name);

  const sanitizeItems = (items: PoolItem[]) =>
    items.map(item => ({
      ...item,
      id: makeId('item'),
      text: normalizeText(item.text),
      tags: item.tags?.map(normalizeText).filter(Boolean),
      note: item.note ? normalizeText(item.note) : undefined,
    }));

  const nextPool: Pool = {
    ...incoming,
    id: makeId('pool'),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    items: sanitizeItems(incoming.items || []),
  };

  if (existingIndex === -1) {
    store.pools.unshift(nextPool);
    saveStore(store);
    return nextPool;
  }

  if (mode === 'replace') {
    store.pools[existingIndex] = { ...nextPool, name: incoming.name };
    saveStore(store);
    return store.pools[existingIndex];
  }

  // merge
  const existing = store.pools[existingIndex];
  const mergedItems = [...existing.items, ...nextPool.items];
  store.pools[existingIndex] = {
    ...existing,
    items: mergedItems,
    updatedAt: Date.now(),
  };
  saveStore(store);
  return store.pools[existingIndex];
};

export const exportAllPoolsPayload = (): PoolStore => {
  return loadStore();
};

export const importAllPoolsPayload = (payload: PoolStore, mode: 'merge' | 'replace') => {
  if (!payload || payload.version !== 1 || !Array.isArray(payload.pools)) {
    throw new Error('Invalid pools payload.');
  }
  const store = loadStore();
  if (mode === 'replace') {
    saveStore({ version: 1, pools: payload.pools });
    return;
  }
  const existingNames = new Set(store.pools.map(pool => pool.name));
  const merged = [...store.pools];
  payload.pools.forEach(pool => {
    if (!existingNames.has(pool.name)) {
      merged.push(pool);
    }
  });
  saveStore({ version: 1, pools: merged });
};

export const exportPoolCsv = (poolId: string): string => {
  const pool = getPool(poolId);
  if (!pool) {
    throw new Error('Pool not found.');
  }
  const rows = pool.items.map(item => {
    const tags = item.tags ? item.tags.join(', ') : '';
    const note = item.note ?? '';
    const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
    return [item.text, tags, note].map(escape).join(',');
  });
  return ['text,tags,note', ...rows].join('\n');
};

export const importPoolCsv = (poolId: string, csv: string, mode: 'merge' | 'replace') => {
  const pool = getPool(poolId);
  if (!pool) {
    throw new Error('Pool not found.');
  }
  const lines = csv.split('\n').map(line => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    throw new Error('CSV is empty.');
  }
  const startIndex = lines[0].toLowerCase().startsWith('text') ? 1 : 0;
  const items: PoolItem[] = [];
  for (let i = startIndex; i < lines.length; i += 1) {
    const line = lines[i];
    const parts = line.split(',').map(part => part.replace(/^"|"$/g, '').trim());
    if (!parts[0]) continue;
    items.push({
      id: makeId('item'),
      text: normalizeText(parts[0]),
      tags: parts[1] ? parseTagsCsv(parts[1]) : undefined,
      note: parts[2] ? normalizeText(parts[2]) : undefined,
    });
  }
  const store = loadStore();
  const poolIndex = store.pools.findIndex(item => item.id === poolId);
  if (poolIndex === -1) {
    throw new Error('Pool not found.');
  }
  if (mode === 'replace') {
    store.pools[poolIndex] = {
      ...store.pools[poolIndex],
      items,
      updatedAt: Date.now(),
    };
  } else {
    store.pools[poolIndex] = {
      ...store.pools[poolIndex],
      items: [...store.pools[poolIndex].items, ...items],
      updatedAt: Date.now(),
    };
  }
  saveStore(store);
};

const parseTagsCsv = (raw: string): string[] =>
  raw
    .split(',')
    .map(tag => normalizeText(tag))
    .filter(Boolean);
