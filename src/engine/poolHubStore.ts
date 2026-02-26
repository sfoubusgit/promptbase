import type { PoolHubEntry } from '../types';
import { poolHubMock } from '../data/poolHubMock';

const STORAGE_KEY = 'promptgen:pool_hub_store:v5';

type PoolHubComment = {
  id: string;
  entryId: string;
  author: string;
  authorId?: string;
  body: string;
  createdAt: number;
  updatedAt?: number;
  isDeleted?: boolean;
};

type PoolHubStore = {
  version: 5;
  entries: PoolHubEntry[];
  userRatings: Record<string, Record<string, number>>;
  comments: PoolHubComment[];
  flaggedEntries: Record<string, string[]>; // entryId -> reasons
};

const buildInitialStore = (): PoolHubStore => ({
  version: 5,
  entries: poolHubMock,
  userRatings: {},
  comments: [],
  flaggedEntries: {},
});

const migrateV4 = (raw: string): PoolHubStore => {
  try {
    const parsed = JSON.parse(raw) as {
      version?: number;
      entries?: PoolHubEntry[];
      userRatings?: Record<string, Record<string, number>>;
      comments?: PoolHubComment[];
    };
    if (parsed && parsed.version === 4 && Array.isArray(parsed.entries)) {
      return {
        version: 5,
        entries: parsed.entries,
        userRatings: parsed.userRatings ?? {},
        comments: Array.isArray(parsed.comments) ? parsed.comments : [],
        flaggedEntries: {},
      };
    }
  } catch {
    // ignore
  }
  return buildInitialStore();
};

const migrateV3 = (raw: string): PoolHubStore => {
  try {
    const parsed = JSON.parse(raw) as {
      version?: number;
      entries?: PoolHubEntry[];
      userRatings?: Record<string, Record<string, number>>;
      comments?: PoolHubComment[];
    };
    if (parsed && parsed.version === 3 && Array.isArray(parsed.entries)) {
      return {
        version: 5,
        entries: parsed.entries,
        userRatings: parsed.userRatings ?? {},
        comments: Array.isArray(parsed.comments) ? parsed.comments : [],
        flaggedEntries: {},
      };
    }
  } catch {
    // ignore
  }
  return buildInitialStore();
};

const migrateV2 = (raw: string): PoolHubStore => {
  try {
    const parsed = JSON.parse(raw) as {
      version?: number;
      entries?: PoolHubEntry[];
      userRatings?: Record<string, number>;
      comments?: PoolHubComment[];
    };
    if (parsed && parsed.version === 2 && Array.isArray(parsed.entries)) {
      return {
        version: 5,
        entries: parsed.entries,
        userRatings: parsed.userRatings ? { legacy: parsed.userRatings } : {},
        comments: Array.isArray(parsed.comments) ? parsed.comments : [],
        flaggedEntries: {},
      };
    }
  } catch {
    // ignore
  }
  return buildInitialStore();
};

const migrateV1 = (raw: string): PoolHubStore => {
  try {
    const parsed = JSON.parse(raw) as { version?: number; entries?: PoolHubEntry[] };
    if (parsed && parsed.version === 1 && Array.isArray(parsed.entries)) {
      return {
        version: 5,
        entries: parsed.entries,
        userRatings: {},
        comments: [],
        flaggedEntries: {},
      };
    }
  } catch {
    // ignore
  }
  return buildInitialStore();
};

const loadStore = (): PoolHubStore => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const v4 = window.localStorage.getItem('promptgen:pool_hub_store:v4');
      if (v4) {
        const migrated = migrateV4(v4);
        saveStore(migrated);
        return migrated;
      }
      const v3 = window.localStorage.getItem('promptgen:pool_hub_store:v3');
      if (v3) {
        const migrated = migrateV3(v3);
        saveStore(migrated);
        return migrated;
      }
      const v2 = window.localStorage.getItem('promptgen:pool_hub_store:v2');
      if (v2) {
        const migrated = migrateV2(v2);
        saveStore(migrated);
        return migrated;
      }
      const v1 = window.localStorage.getItem('promptgen:pool_hub_store:v1');
      if (v1) {
        const migrated = migrateV1(v1);
        saveStore(migrated);
        return migrated;
      }
      return buildInitialStore();
    }
    const parsed = JSON.parse(raw) as PoolHubStore;
    if (!parsed || parsed.version !== 5 || !Array.isArray(parsed.entries)) {
      return buildInitialStore();
    }
    return parsed;
  } catch {
    return buildInitialStore();
  }
};

const saveStore = (store: PoolHubStore) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore storage errors
  }
};

export const listHubEntries = (): PoolHubEntry[] => loadStore().entries;

export const addHubEntry = (entry: PoolHubEntry) => {
  const store = loadStore();
  store.entries = [entry, ...store.entries];
  saveStore(store);
  return store.entries;
};

export const replaceHubEntries = (entries: PoolHubEntry[]) => {
  const store = loadStore();
  store.entries = entries;
  saveStore(store);
  return store.entries;
};

export const removeHubEntry = (entryId: string) => {
  const store = loadStore();
  store.entries = store.entries.filter(entry => entry.id !== entryId);
  saveStore(store);
  return store.entries;
};

export const resetHubStore = () => {
  const store = buildInitialStore();
  saveStore(store);
  return store.entries;
};

export const exportHubStore = (): PoolHubStore => loadStore();

export const importHubStore = (payload: PoolHubStore) => {
  if (!payload || payload.version !== 5 || !Array.isArray(payload.entries)) {
    throw new Error('Invalid Hub store payload.');
  }
  saveStore(payload);
};

export const getUserRating = (entryId: string, userId: string): number | null => {
  const store = loadStore();
  const rating = store.userRatings[userId]?.[entryId];
  return typeof rating === 'number' ? rating : null;
};

export const setUserRating = (entryId: string, userId: string, rating: number) => {
  const store = loadStore();
  const entryIndex = store.entries.findIndex(entry => entry.id === entryId);
  if (entryIndex === -1) return store.entries;

  const entry = store.entries[entryIndex];
  const nextRating = Math.max(1, Math.min(5, Math.round(rating)));

  if (!store.userRatings[userId]) {
    store.userRatings[userId] = {};
  }
  store.userRatings[userId][entryId] = nextRating;

  const allRatings: number[] = [];
  Object.values(store.userRatings).forEach(map => {
    const value = map[entryId];
    if (typeof value === 'number') allRatings.push(value);
  });
  const ratingCount = allRatings.length;
  const ratingAvg = ratingCount === 0
    ? 0
    : allRatings.reduce((sum, value) => sum + value, 0) / ratingCount;

  store.entries[entryIndex] = {
    ...entry,
    ratingAvg: Number(ratingAvg.toFixed(2)),
    ratingCount,
  };

  saveStore(store);
  return store.entries;
};

export const listHubComments = (entryId: string): PoolHubComment[] => {
  const store = loadStore();
  return store.comments.filter(comment => comment.entryId === entryId && !comment.isDeleted);
};

export const addHubComment = (
  entryId: string,
  author: string,
  body: string,
  authorId?: string
) => {
  const store = loadStore();
  const comment: PoolHubComment = {
    id: `${entryId}_c_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    entryId,
    author: author.trim() || 'Anonymous',
    authorId,
    body: body.trim(),
    createdAt: Date.now(),
  };
  store.comments = [comment, ...store.comments];
  saveStore(store);
  return store.comments;
};

export const updateHubComment = (commentId: string, authorId: string, body: string) => {
  const store = loadStore();
  const idx = store.comments.findIndex(comment => comment.id === commentId);
  if (idx === -1) return store.comments;
  const comment = store.comments[idx];
  if (comment.authorId !== authorId) return store.comments;
  store.comments[idx] = {
    ...comment,
    body: body.trim(),
    updatedAt: Date.now(),
  };
  saveStore(store);
  return store.comments;
};

export const deleteHubComment = (commentId: string, authorId: string) => {
  const store = loadStore();
  const idx = store.comments.findIndex(comment => comment.id === commentId);
  if (idx === -1) return store.comments;
  const comment = store.comments[idx];
  if (comment.authorId !== authorId) return store.comments;
  store.comments[idx] = {
    ...comment,
    isDeleted: true,
    updatedAt: Date.now(),
  };
  saveStore(store);
  return store.comments;
};

export const flagHubEntry = (entryId: string, reason: string) => {
  const store = loadStore();
  const list = store.flaggedEntries[entryId] ?? [];
  store.flaggedEntries[entryId] = [...list, reason.trim()].filter(Boolean);
  saveStore(store);
};
