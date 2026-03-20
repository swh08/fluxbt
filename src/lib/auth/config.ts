import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authenticateUser } from '@/lib/auth/core';
import { prismaAuthStore } from '@/lib/auth/prisma-store';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await authenticateUser(prismaAuthStore, {
          username: credentials?.username ?? '',
          password: credentials?.password ?? '',
        });

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          name: user.name ?? user.username,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.username = user.username;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.username = typeof token.username === 'string' ? token.username : '';
        session.user.name = session.user.name ?? session.user.username;
      }

      return session;
    },
  },
};
