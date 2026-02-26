import type { WorkingSet, WorkingSetItemRef, WorkingSetStore } from '../types';

const STORAGE_KEY = 'promptgen:working_sets:v2';

const blankStore = (): WorkingSetStore => ({
  version: 2,
  activeId: null,
  sets: [],
});

const loadStore = (): WorkingSetStore => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankStore();
    const parsed = JSON.parse(raw) as WorkingSetStore;
    if (!parsed || parsed.version !== 2 || !Array.isArray(parsed.sets)) {
      return blankStore();
    }
    return parsed;
  } catch {
    return blankStore();
  }
};

const saveStore = (store: WorkingSetStore) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
};

const makeId = () => `ws_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const makeItemId = () => `wsi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const listWorkingSets = (): WorkingSet[] => loadStore().sets;

export const getActiveWorkingSetId = (): string | null => loadStore().activeId;

export const setActiveWorkingSetId = (id: string | null) => {
  const store = loadStore();
  store.activeId = id;
  saveStore(store);
};

export const createWorkingSet = (name: string, payload?: Partial<Omit<WorkingSet, 'id' | 'name' | 'createdAt' | 'updatedAt'>>) => {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Working Set name is required.');
  const now = Date.now();
  const next: WorkingSet = {
    id: makeId(),
    name: trimmed,
    createdAt: now,
    updatedAt: now,
    categoryBuckets: payload?.categoryBuckets ?? {},
  };
  const store = loadStore();
  store.sets = [next, ...store.sets];
  store.activeId = next.id;
  saveStore(store);
  return next;
};

export const updateWorkingSet = (id: string, patch: Partial<Omit<WorkingSet, 'id' | 'createdAt'>>) => {
  const store = loadStore();
  const idx = store.sets.findIndex(item => item.id === id);
  if (idx === -1) return null;
  store.sets[idx] = {
    ...store.sets[idx],
    ...patch,
    updatedAt: Date.now(),
  };
  saveStore(store);
  return store.sets[idx];
};

export const deleteWorkingSet = (id: string) => {
  const store = loadStore();
  store.sets = store.sets.filter(item => item.id !== id);
  if (store.activeId === id) {
    store.activeId = store.sets[0]?.id ?? null;
  }
  saveStore(store);
  return store.sets;
};

export const exportWorkingSetPayload = (id: string): { version: 2; workingSet: WorkingSet } => {
  const store = loadStore();
  const workingSet = store.sets.find(set => set.id === id);
  if (!workingSet) {
    throw new Error('Working Set not found.');
  }
  return { version: 2, workingSet };
};

export const importWorkingSetPayload = (
  payload: { version: number; workingSet: WorkingSet },
  mode: 'merge' | 'replace'
) => {
  if (!payload || payload.version !== 2 || !payload.workingSet) {
    throw new Error('Invalid Working Set payload.');
  }

  const incoming = payload.workingSet;
  const store = loadStore();
  const existingIndex = store.sets.findIndex(set => set.name === incoming.name);

  const sanitizeBuckets = (buckets: WorkingSet['categoryBuckets']) => {
    const next: WorkingSet['categoryBuckets'] = {};
    Object.entries(buckets).forEach(([categoryId, items]) => {
      next[categoryId] = items.map(item => ({
        ...item,
        id: makeItemId(),
        addedAt: Date.now(),
      }));
    });
    return next;
  };

  const nextSet: WorkingSet = {
    ...incoming,
    id: makeId(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    categoryBuckets: sanitizeBuckets(incoming.categoryBuckets || {}),
  };

  if (existingIndex === -1) {
    store.sets.unshift(nextSet);
    store.activeId = nextSet.id;
    saveStore(store);
    return nextSet;
  }

  if (mode === 'replace') {
    store.sets[existingIndex] = { ...nextSet, name: incoming.name };
    store.activeId = store.sets[existingIndex].id;
    saveStore(store);
    return store.sets[existingIndex];
  }

  const existing = store.sets[existingIndex];
  const mergedBuckets: WorkingSet['categoryBuckets'] = { ...existing.categoryBuckets };
  Object.entries(nextSet.categoryBuckets).forEach(([categoryId, items]) => {
    mergedBuckets[categoryId] = [...(mergedBuckets[categoryId] ?? []), ...items];
  });
  store.sets[existingIndex] = {
    ...existing,
    categoryBuckets: mergedBuckets,
    updatedAt: Date.now(),
  };
  store.activeId = store.sets[existingIndex].id;
  saveStore(store);
  return store.sets[existingIndex];
};

export const addWorkingSetItem = (
  setId: string,
  categoryId: string,
  item: Omit<WorkingSetItemRef, 'id' | 'addedAt'>
) => {
  const store = loadStore();
  const idx = store.sets.findIndex(set => set.id === setId);
  if (idx === -1) return null;
  const next = { ...store.sets[idx] };
  const bucket = next.categoryBuckets[categoryId] ?? [];
  if (bucket.some(existing => existing.poolId === item.poolId && existing.poolItemId === item.poolItemId)) {
    return next;
  }
  const nextItem: WorkingSetItemRef = {
    ...item,
    id: makeItemId(),
    addedAt: Date.now(),
  };
  next.categoryBuckets = {
    ...next.categoryBuckets,
    [categoryId]: [...bucket, nextItem],
  };
  next.updatedAt = Date.now();
  store.sets[idx] = next;
  saveStore(store);
  return next;
};

export const removeWorkingSetItem = (setId: string, categoryId: string, itemId: string) => {
  const store = loadStore();
  const idx = store.sets.findIndex(set => set.id === setId);
  if (idx === -1) return null;
  const next = { ...store.sets[idx] };
  const bucket = next.categoryBuckets[categoryId] ?? [];
  next.categoryBuckets = {
    ...next.categoryBuckets,
    [categoryId]: bucket.filter(item => item.id !== itemId),
  };
  next.updatedAt = Date.now();
  store.sets[idx] = next;
  saveStore(store);
  return next;
};

export const clearWorkingSetCategory = (setId: string, categoryId: string) => {
  const store = loadStore();
  const idx = store.sets.findIndex(set => set.id === setId);
  if (idx === -1) return null;
  const next = { ...store.sets[idx] };
  next.categoryBuckets = { ...next.categoryBuckets, [categoryId]: [] };
  next.updatedAt = Date.now();
  store.sets[idx] = next;
  saveStore(store);
  return next;
};
