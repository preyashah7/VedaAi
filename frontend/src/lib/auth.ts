import type { AuthUser } from '@/types';

interface StoredUser extends AuthUser {
  password: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupPayload extends AuthCredentials {
  name: string;
  schoolName: string;
}

const USERS_STORAGE_KEY = 'vedaai.users';
const SESSION_STORAGE_KEY = 'vedaai.session';

const hasWindow = (): boolean => typeof window !== 'undefined';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const readJson = <T,>(key: string, fallback: T): T => {
  if (!hasWindow()) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown): void => {
  if (!hasWindow()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const getStoredUsers = (): StoredUser[] => readJson<StoredUser[]>(USERS_STORAGE_KEY, []);

const persistSession = (user: AuthUser | null): void => {
  if (!hasWindow()) {
    return;
  }

  if (user) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    return;
  }

  window.localStorage.removeItem(SESSION_STORAGE_KEY);
};

export const getStoredSessionUser = (): AuthUser | null => {
  return readJson<AuthUser | null>(SESSION_STORAGE_KEY, null);
};

export const setStoredSessionUser = (user: AuthUser | null): void => {
  persistSession(user);
};

export const clearStoredSessionUser = (): void => {
  persistSession(null);
};

export const registerUser = ({ name, schoolName, email, password }: SignupPayload): AuthUser => {
  const normalizedEmail = normalizeEmail(email);
  const users = getStoredUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const nextUser: StoredUser = {
    id: globalThis.crypto?.randomUUID?.() ?? `user-${Date.now()}`,
    name: name.trim(),
    schoolName: schoolName.trim(),
    email: normalizedEmail,
    password,
  };

  writeJson(USERS_STORAGE_KEY, [...users, nextUser]);

  const sessionUser: AuthUser = {
    id: nextUser.id,
    name: nextUser.name,
    schoolName: nextUser.schoolName,
    email: nextUser.email,
  };
  persistSession(sessionUser);
  return sessionUser;
};

export const authenticateUser = ({ email, password }: AuthCredentials): AuthUser => {
  const normalizedEmail = normalizeEmail(email);
  const user = getStoredUsers().find((entry) => entry.email === normalizedEmail);

  if (!user || user.password !== password) {
    throw new Error('Invalid email or password.');
  }

  const sessionUser: AuthUser = {
    id: user.id,
    name: user.name,
    schoolName: user.schoolName,
    email: user.email,
  };
  persistSession(sessionUser);
  return sessionUser;
};

export const signOutUser = (): void => {
  persistSession(null);
};