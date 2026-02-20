import type { Pool, PoolItem, PoolStore } from '../types';

const STORAGE_KEY = 'promptgen:user_pools';

const blankStore = (): PoolStore => ({ version: 1, pools: [] });

const normalizeText = (value: string): string =>
  value.replace(/\s+/g, ' ').trim();

const makeId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const SEED_POOL_NAME = 'Nature elements and phrases';
const CREATIVE_POOL_NAME = 'Surreal scenes and motifs';

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

const createSeedStore = (): PoolStore => ({ version: 1, pools: [createSeedPool()] });

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
