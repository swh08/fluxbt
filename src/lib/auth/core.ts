import { hashPassword, verifyPassword } from '@/lib/auth/password';
import type { AuthUserStore, StoredAuthUser } from '@/lib/auth/types';

interface RegisterUserInput {
  username: string;
  password: string;
  confirmPassword: string;
}

interface AuthenticateUserInput {
  username: string;
  password: string;
}

function normalizeUsername(username: string): string {
  return username.trim();
}

export async function registerUser(
  store: AuthUserStore,
  input: RegisterUserInput,
): Promise<StoredAuthUser> {
  const username = normalizeUsername(input.username);

  if (!username) {
    throw new Error('USERNAME_REQUIRED');
  }

  if (!input.password) {
    throw new Error('PASSWORD_REQUIRED');
  }

  if (input.password !== input.confirmPassword) {
    throw new Error('PASSWORD_MISMATCH');
  }

  const existingUser = await store.findByUsername(username);

  if (existingUser) {
    throw new Error('USERNAME_TAKEN');
  }

  const passwordHash = await hashPassword(input.password);

  return store.createUser({
    username,
    passwordHash,
    name: null,
  });
}

export async function authenticateUser(
  store: AuthUserStore,
  input: AuthenticateUserInput,
): Promise<StoredAuthUser | null> {
  const username = normalizeUsername(input.username);

  if (!username || !input.password) {
    return null;
  }

  const user = await store.findByUsername(username);

  if (!user) {
    return null;
  }

  const isPasswordValid = await verifyPassword(input.password, user.passwordHash);

  return isPasswordValid ? user : null;
}
