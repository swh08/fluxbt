import type { AuthUserStore } from '@/lib/auth/types';
import { db } from '@/lib/db';

export const prismaAuthStore: AuthUserStore = {
  findByUsername(username) {
    return db.user.findUnique({
      where: { username },
    });
  },
  createUser(data) {
    return db.user.create({
      data,
    });
  },
};
