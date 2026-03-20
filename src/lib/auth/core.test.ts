import { describe, expect, it } from 'vitest';
import { authenticateUser, registerUser } from '@/lib/auth/core';
import type { AuthUserStore, StoredAuthUser } from '@/lib/auth/types';

function createMemoryStore(seed: StoredAuthUser[] = []): AuthUserStore {
  const users = [...seed];

  return {
    async findByUsername(username) {
      return users.find((user) => user.username === username) ?? null;
    },
    async createUser(data) {
      const user: StoredAuthUser = {
        id: `user-${users.length + 1}`,
        username: data.username,
        passwordHash: data.passwordHash,
        name: data.name ?? null,
      };

      users.push(user);
      return user;
    },
  };
}

describe('registerUser', () => {
  it('registers a new user when the username is unique', async () => {
    const user = await registerUser(createMemoryStore(), {
      username: 'miku',
      password: '123456',
      confirmPassword: '123456',
    });

    expect(user.username).toBe('miku');
  });

  it('rejects duplicate usernames', async () => {
    const store = createMemoryStore([
      {
        id: 'user-1',
        username: 'miku',
        passwordHash: 'hash',
        name: null,
      },
    ]);

    await expect(
      registerUser(store, {
        username: 'miku',
        password: '123456',
        confirmPassword: '123456',
      }),
    ).rejects.toThrow('USERNAME_TAKEN');
  });
});

describe('authenticateUser', () => {
  it('returns the user for valid credentials', async () => {
    const store = createMemoryStore();
    await registerUser(store, {
      username: 'miku',
      password: '123456',
      confirmPassword: '123456',
    });

    const user = await authenticateUser(store, {
      username: 'miku',
      password: '123456',
    });

    expect(user?.username).toBe('miku');
  });

  it('returns null for the wrong password', async () => {
    const store = createMemoryStore();
    await registerUser(store, {
      username: 'miku',
      password: '123456',
      confirmPassword: '123456',
    });

    const user = await authenticateUser(store, {
      username: 'miku',
      password: 'wrong',
    });

    expect(user).toBeNull();
  });
});
