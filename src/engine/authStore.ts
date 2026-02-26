const STORAGE_KEY = 'promptgen:auth_store:v1';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type StoredUser = AuthUser & { password: string };

type AuthStore = {
  version: 1;
  users: StoredUser[];
  currentUserId: string | null;
};

const blankStore = (): AuthStore => ({
  version: 1,
  users: [],
  currentUserId: null,
});

const loadStore = (): AuthStore => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankStore();
    const parsed = JSON.parse(raw) as AuthStore;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.users)) {
      return blankStore();
    }
    return parsed;
  } catch {
    return blankStore();
  }
};

const saveStore = (store: AuthStore) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
};

const makeId = () => `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const stripPassword = (user: StoredUser): AuthUser => {
  const { password: _pw, ...rest } = user;
  return rest;
};

export const getCurrentUser = (): AuthUser | null => {
  const store = loadStore();
  if (!store.currentUserId) return null;
  const match = store.users.find(user => user.id === store.currentUserId);
  if (!match) return null;
  return stripPassword(match);
};

export const registerUser = (name: string, email: string, password: string): AuthUser => {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();
  if (!trimmedName) throw new Error('Name is required.');
  if (!trimmedEmail) throw new Error('Email is required.');
  if (trimmedPassword.length < 6) throw new Error('Password must be at least 6 characters.');

  const store = loadStore();
  if (store.users.some(user => user.email === trimmedEmail)) {
    throw new Error('Email is already registered.');
  }

  const next: StoredUser = {
    id: makeId(),
    name: trimmedName,
    email: trimmedEmail,
    password: trimmedPassword,
  };

  store.users = [next, ...store.users];
  store.currentUserId = next.id;
  saveStore(store);

  return stripPassword(next);
};

export const loginUser = (email: string, password: string): AuthUser => {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();
  const store = loadStore();
  const match = store.users.find(
    user => user.email === trimmedEmail && user.password === trimmedPassword
  );
  if (!match) throw new Error('Invalid email or password.');
  store.currentUserId = match.id;
  saveStore(store);
  return stripPassword(match);
};

export const logoutUser = (): void => {
  const store = loadStore();
  store.currentUserId = null;
  saveStore(store);
};

export const updateUserName = (name: string): AuthUser => {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Name is required.');
  const store = loadStore();
  if (!store.currentUserId) throw new Error('No active session.');
  const idx = store.users.findIndex(user => user.id === store.currentUserId);
  if (idx === -1) throw new Error('User not found.');
  store.users[idx] = { ...store.users[idx], name: trimmed };
  saveStore(store);
  return stripPassword(store.users[idx]);
};

export const changeUserPassword = (currentPassword: string, nextPassword: string): void => {
  const current = currentPassword.trim();
  const next = nextPassword.trim();
  if (next.length < 6) throw new Error('Password must be at least 6 characters.');
  const store = loadStore();
  if (!store.currentUserId) throw new Error('No active session.');
  const idx = store.users.findIndex(user => user.id === store.currentUserId);
  if (idx === -1) throw new Error('User not found.');
  if (store.users[idx].password !== current) {
    throw new Error('Current password is incorrect.');
  }
  store.users[idx] = { ...store.users[idx], password: next };
  saveStore(store);
};

export const deleteCurrentUser = (currentPassword: string): void => {
  const current = currentPassword.trim();
  const store = loadStore();
  if (!store.currentUserId) throw new Error('No active session.');
  const idx = store.users.findIndex(user => user.id === store.currentUserId);
  if (idx === -1) throw new Error('User not found.');
  if (store.users[idx].password !== current) {
    throw new Error('Current password is incorrect.');
  }
  store.users.splice(idx, 1);
  store.currentUserId = null;
  saveStore(store);
};
