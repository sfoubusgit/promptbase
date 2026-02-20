import type { SavedPrompt, SavedPromptStore } from '../types';

const STORAGE_KEY = 'promptgen:saved_prompts';

const blankStore = (): SavedPromptStore => ({ version: 1, prompts: [] });

const normalizeText = (value: string): string =>
  value.replace(/\s+/g, ' ').trim();

const makeId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

const loadStore = (): SavedPromptStore => {
  if (typeof window === 'undefined') return blankStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankStore();
    const parsed = JSON.parse(raw) as SavedPromptStore;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.prompts)) {
      return blankStore();
    }
    return parsed;
  } catch {
    return blankStore();
  }
};

const saveStore = (store: SavedPromptStore) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
};

export const listPrompts = (): SavedPrompt[] => {
  return loadStore().prompts;
};

export const createPrompt = (input: {
  name: string;
  positive: string;
  negative?: string;
  tags?: string[];
  note?: string;
}): SavedPrompt => {
  const name = normalizeText(input.name);
  const positive = normalizeText(input.positive);
  if (!name) {
    throw new Error('Prompt name cannot be empty.');
  }
  if (!positive) {
    throw new Error('Prompt text cannot be empty.');
  }
  const now = Date.now();
  const prompt: SavedPrompt = {
    id: makeId('prompt'),
    name,
    positive,
    negative: input.negative ? normalizeText(input.negative) : undefined,
    tags: input.tags?.map(normalizeText).filter(Boolean) || undefined,
    note: input.note ? normalizeText(input.note) : undefined,
    createdAt: now,
    updatedAt: now,
  };
  const store = loadStore();
  store.prompts.unshift(prompt);
  saveStore(store);
  return prompt;
};

export const deletePrompt = (promptId: string): SavedPrompt[] => {
  const store = loadStore();
  store.prompts = store.prompts.filter(prompt => prompt.id !== promptId);
  saveStore(store);
  return store.prompts;
};

export const exportPromptsPayload = (): SavedPromptStore => {
  return loadStore();
};

export const importPromptsPayload = (payload: SavedPromptStore): SavedPromptStore => {
  if (!payload || payload.version !== 1 || !Array.isArray(payload.prompts)) {
    throw new Error('Invalid prompts payload.');
  }
  const store = loadStore();
  const existingNames = new Set(store.prompts.map(prompt => prompt.name));
  const sanitized = payload.prompts
    .filter(prompt => prompt && prompt.name && prompt.positive)
    .map(prompt => ({
      ...prompt,
      id: makeId('prompt'),
      name: normalizeText(prompt.name),
      positive: normalizeText(prompt.positive),
      negative: prompt.negative ? normalizeText(prompt.negative) : undefined,
      tags: prompt.tags?.map(normalizeText).filter(Boolean),
      note: prompt.note ? normalizeText(prompt.note) : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }))
    .filter(prompt => !existingNames.has(prompt.name));

  const merged = [...sanitized, ...store.prompts];
  saveStore({ version: 1, prompts: merged });
  return { version: 1, prompts: merged };
};
