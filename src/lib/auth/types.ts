export interface StoredAuthUser {
  id: string;
  username: string;
  passwordHash: string;
  name: string | null;
}

export interface AuthUserStore {
  findByUsername(username: string): Promise<StoredAuthUser | null>;
  createUser(data: {
    username: string;
    passwordHash: string;
    name?: string | null;
  }): Promise<StoredAuthUser>;
}
