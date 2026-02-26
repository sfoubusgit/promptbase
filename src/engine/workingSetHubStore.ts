import type { WorkingSetHubEntry } from '../types';
import { workingSetHubMock } from '../data/workingSetHubMock';

const STORAGE_KEY = 'promptgen:working_set_hub_store:v1';

type WorkingSetHubComment = {
  id: string;
  entryId: string;
  author: string;
  authorId?: string;
  body: string;
  createdAt: number;
  updatedAt?: number;
  isDeleted?: boolean;
};

type WorkingSetHubStore = {
  version: 1;
  entries: WorkingSetHubEntry[];
  userRatings: Record<string, Record<string, number>>;
  comments: WorkingSetHubComment[];
  flaggedEntries: Record<string, string[]>;
};

const buildInitialStore = (): WorkingSetHubStore => ({
  version: 1,
  entries: workingSetHubMock,
  userRatings: {},
  comments: [],
  flaggedEntries: {},
});

const loadStore = (): WorkingSetHubStore => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialStore();
    const parsed = JSON.parse(raw) as WorkingSetHubStore;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.entries)) {
      return buildInitialStore();
    }
    return parsed;
  } catch {
    return buildInitialStore();
  }
};

const saveStore = (store: WorkingSetHubStore) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
};

export const listWorkingSetHubEntries = (): WorkingSetHubEntry[] => loadStore().entries;

export const addWorkingSetHubEntry = (entry: WorkingSetHubEntry) => {
  const store = loadStore();
  store.entries = [entry, ...store.entries];
  saveStore(store);
  return store.entries;
};

export const replaceWorkingSetHubEntries = (entries: WorkingSetHubEntry[]) => {
  const store = loadStore();
  store.entries = entries;
  saveStore(store);
  return store.entries;
};

export const removeWorkingSetHubEntry = (entryId: string) => {
  const store = loadStore();
  store.entries = store.entries.filter(entry => entry.id !== entryId);
  saveStore(store);
  return store.entries;
};

export const resetWorkingSetHubStore = () => {
  const store = buildInitialStore();
  saveStore(store);
  return store.entries;
};

export const exportWorkingSetHubStore = (): WorkingSetHubStore => loadStore();

export const importWorkingSetHubStore = (payload: WorkingSetHubStore) => {
  if (!payload || payload.version !== 1 || !Array.isArray(payload.entries)) {
    throw new Error('Invalid Working Set Hub payload.');
  }
  saveStore(payload);
};

export const getWorkingSetUserRating = (entryId: string, userId: string): number | null => {
  const store = loadStore();
  const rating = store.userRatings[userId]?.[entryId];
  return typeof rating === 'number' ? rating : null;
};

export const setWorkingSetUserRating = (entryId: string, userId: string, rating: number) => {
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

export const listWorkingSetHubComments = (entryId: string): WorkingSetHubComment[] => {
  const store = loadStore();
  return store.comments.filter(comment => comment.entryId === entryId && !comment.isDeleted);
};

export const addWorkingSetHubComment = (
  entryId: string,
  author: string,
  body: string,
  authorId?: string
) => {
  const store = loadStore();
  const comment: WorkingSetHubComment = {
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

export const updateWorkingSetHubComment = (commentId: string, authorId: string, body: string) => {
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

export const deleteWorkingSetHubComment = (commentId: string, authorId: string) => {
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

export const flagWorkingSetHubEntry = (entryId: string, reason: string) => {
  const store = loadStore();
  const list = store.flaggedEntries[entryId] ?? [];
  store.flaggedEntries[entryId] = [...list, reason.trim()].filter(Boolean);
  saveStore(store);
};
