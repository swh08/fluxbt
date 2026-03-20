# FluxBT Login Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add self-service username/password authentication to FluxBT so unauthenticated users are redirected to login, new users can register locally, and authenticated users can use the existing dashboard.

**Architecture:** Keep the existing dashboard UI as a client component, move auth checks to the server layer, and use `next-auth` Credentials auth with JWT sessions. Authentication rules live in small testable server utilities so registration, password hashing, and credential verification can be covered with fast unit tests before wiring them into Prisma routes and pages.

**Tech Stack:** Next.js App Router, TypeScript, Prisma, next-auth v4, zod, bcryptjs, Vitest

---

### Task 1: Add Minimal Test Tooling

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`

**Step 1: Add the test script and dev dependency declarations**

Update `package.json` so it includes:

```json
{
  "scripts": {
    "test": "vitest"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3"
  },
  "devDependencies": {
    "vitest": "^3.2.4"
  }
}
```

**Step 2: Add a basic Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 3: Install dependencies**

Run: `npm install`

Expected: install completes and lockfile updates cleanly

**Step 4: Verify the runner starts**

Run: `npm run test -- --run`

Expected: Vitest starts successfully and reports no tests found or exits because no test files exist yet

**Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts
git commit -m "test: add vitest for auth features"
```

### Task 2: Write the Failing Auth Core Tests

**Files:**
- Create: `src/lib/auth/core.test.ts`
- Reference: `prisma/schema.prisma`

**Step 1: Write the failing tests for registration and credential checks**

Create `src/lib/auth/core.test.ts` with focused tests around a repository interface:

```ts
import { describe, expect, it } from "vitest";
import { authenticateUser, registerUser } from "@/lib/auth/core";

it("registers a new user when the username is unique", async () => {
  const store = createMemoryStore();
  const user = await registerUser(store, {
    username: "miku",
    password: "123456",
    confirmPassword: "123456",
  });

  expect(user.username).toBe("miku");
});

it("rejects duplicate usernames", async () => {
  const store = createMemoryStore([{ username: "miku", passwordHash: "hash" }]);

  await expect(
    registerUser(store, {
      username: "miku",
      password: "123456",
      confirmPassword: "123456",
    }),
  ).rejects.toThrow("USERNAME_TAKEN");
});

it("authenticates valid credentials", async () => {
  const store = createMemoryStore();
  await registerUser(store, {
    username: "miku",
    password: "123456",
    confirmPassword: "123456",
  });

  const user = await authenticateUser(store, {
    username: "miku",
    password: "123456",
  });

  expect(user?.username).toBe("miku");
});

it("returns null for a wrong password", async () => {
  const store = createMemoryStore();
  await registerUser(store, {
    username: "miku",
    password: "123456",
    confirmPassword: "123456",
  });

  const user = await authenticateUser(store, {
    username: "miku",
    password: "wrong",
  });

  expect(user).toBeNull();
});
```

**Step 2: Run the test to verify it fails**

Run: `npm run test -- --run src/lib/auth/core.test.ts`

Expected: FAIL because `@/lib/auth/core` does not exist yet

**Step 3: Confirm the failure is the expected missing-module failure**

Expected: the output points at the missing auth module, not at Vitest config problems

**Step 4: Commit**

```bash
git add src/lib/auth/core.test.ts
git commit -m "test: define auth core behavior"
```

### Task 3: Implement Password Hashing and Auth Core

**Files:**
- Create: `src/lib/auth/password.ts`
- Create: `src/lib/auth/types.ts`
- Create: `src/lib/auth/core.ts`
- Test: `src/lib/auth/core.test.ts`

**Step 1: Write minimal password helpers**

Create `src/lib/auth/password.ts`:

```ts
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}
```

**Step 2: Define the auth store contract**

Create `src/lib/auth/types.ts`:

```ts
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
```

**Step 3: Implement the minimal auth core**

Create `src/lib/auth/core.ts`:

```ts
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import type { AuthUserStore } from "@/lib/auth/types";

export async function registerUser(
  store: AuthUserStore,
  input: { username: string; password: string; confirmPassword: string },
) {
  const username = input.username.trim();

  if (!username) throw new Error("USERNAME_REQUIRED");
  if (!input.password) throw new Error("PASSWORD_REQUIRED");
  if (input.password !== input.confirmPassword) {
    throw new Error("PASSWORD_MISMATCH");
  }

  const existingUser = await store.findByUsername(username);
  if (existingUser) throw new Error("USERNAME_TAKEN");

  const passwordHash = await hashPassword(input.password);
  return store.createUser({ username, passwordHash, name: null });
}

export async function authenticateUser(
  store: AuthUserStore,
  input: { username: string; password: string },
) {
  const username = input.username.trim();
  if (!username || !input.password) return null;

  const user = await store.findByUsername(username);
  if (!user) return null;

  const isValid = await verifyPassword(input.password, user.passwordHash);
  return isValid ? user : null;
}
```

**Step 4: Run the test to verify it passes**

Run: `npm run test -- --run src/lib/auth/core.test.ts`

Expected: PASS for all auth core tests

**Step 5: Refactor only if duplication remains**

Keep the public behavior unchanged and keep all tests green

**Step 6: Commit**

```bash
git add src/lib/auth/core.ts src/lib/auth/password.ts src/lib/auth/types.ts src/lib/auth/core.test.ts
git commit -m "feat: implement core username auth logic"
```

### Task 4: Update Prisma for Local Users

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Write the failing expectation in code comments or test notes**

Target schema:

```prisma
model User {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  name         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**Step 2: Update the Prisma schema**

Remove the required `email` field and add `username` plus `passwordHash`

**Step 3: Regenerate Prisma client**

Run: `npm run db:generate`

Expected: Prisma Client generated successfully

**Step 4: Push the schema to the local database**

Run: `npm run db:push`

Expected: local SQLite schema updates without data-access errors

**Step 5: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: update user schema for local auth"
```

### Task 5: Add Prisma-backed Auth Adapters and NextAuth Config

**Files:**
- Create: `src/lib/auth/prisma-store.ts`
- Create: `src/lib/auth/config.ts`
- Create: `src/types/next-auth.d.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

**Step 1: Add a Prisma store wrapper**

Create `src/lib/auth/prisma-store.ts`:

```ts
import { db } from "@/lib/db";
import type { AuthUserStore } from "@/lib/auth/types";

export const prismaAuthStore: AuthUserStore = {
  findByUsername(username) {
    return db.user.findUnique({ where: { username } });
  },
  createUser(data) {
    return db.user.create({ data });
  },
};
```

**Step 2: Create a shared NextAuth config**

Create `src/lib/auth/config.ts` with `CredentialsProvider`:

```ts
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { authenticateUser } from "@/lib/auth/core";
import { prismaAuthStore } from "@/lib/auth/prisma-store";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const user = await authenticateUser(prismaAuthStore, {
          username: credentials?.username ?? "",
          password: credentials?.password ?? "",
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
        token.username = (user as { username: string }).username;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.username = typeof token.username === "string" ? token.username : "";
      }

      return session;
    },
  },
};
```

**Step 3: Add NextAuth type augmentation**

Create `src/types/next-auth.d.ts`:

```ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      name?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username?: string;
  }
}
```

**Step 4: Add the App Router auth route**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth/config";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

**Step 5: Run focused verification**

Run: `npm run test -- --run src/lib/auth/core.test.ts`

Expected: PASS and no new type errors in the auth core files

**Step 6: Commit**

```bash
git add src/lib/auth/prisma-store.ts src/lib/auth/config.ts src/types/next-auth.d.ts src/app/api/auth/[...nextauth]/route.ts
git commit -m "feat: wire next-auth credentials config"
```

### Task 6: Add the Registration API

**Files:**
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/lib/auth/schema.ts`
- Modify: `src/lib/auth/core.ts`

**Step 1: Write the registration payload schema**

Create `src/lib/auth/schema.ts`:

```ts
import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(1, "USERNAME_REQUIRED"),
  password: z.string().min(1, "PASSWORD_REQUIRED"),
  confirmPassword: z.string().min(1, "PASSWORD_REQUIRED"),
});
```

**Step 2: Reuse the schema in the register route**

Create `src/app/api/auth/register/route.ts`:

```ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { registerUser } from "@/lib/auth/core";
import { prismaAuthStore } from "@/lib/auth/prisma-store";
import { registerSchema } from "@/lib/auth/schema";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const input = registerSchema.parse(json);
    const user = await registerUser(prismaAuthStore, input);

    return NextResponse.json(
      { id: user.id, username: user.username },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    if (error instanceof Error) {
      const status = error.message === "USERNAME_TAKEN" ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: "UNKNOWN_ERROR" }, { status: 500 });
  }
}
```

**Step 3: Run the test suite**

Run: `npm run test -- --run src/lib/auth/core.test.ts`

Expected: PASS

**Step 4: Commit**

```bash
git add src/lib/auth/schema.ts src/app/api/auth/register/route.ts src/lib/auth/core.ts
git commit -m "feat: add local registration endpoint"
```

### Task 7: Protect Routes and Split the Home Page

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/components/app/home-shell.tsx`
- Create: `src/lib/auth/session.ts`
- Create: `middleware.ts`

**Step 1: Move the existing client UI into a client-only shell**

Create `src/components/app/home-shell.tsx` by moving the current interactive code from `src/app/page.tsx` into this file unchanged except for the exported name.

**Step 2: Add a server-side session helper**

Create `src/lib/auth/session.ts`:

```ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/config";

export function getAppSession() {
  return getServerSession(authOptions);
}
```

**Step 3: Replace `src/app/page.tsx` with a protected server page**

```tsx
import { redirect } from "next/navigation";
import { HomeShell } from "@/components/app/home-shell";
import { getAppSession } from "@/lib/auth/session";

export default async function HomePage() {
  const session = await getAppSession();

  if (!session) {
    redirect("/login");
  }

  return <HomeShell />;
}
```

**Step 4: Add middleware protection**

Create `middleware.ts`:

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = new Set(["/login", "/register"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    publicPaths.has(pathname) ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.includes(".");

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && publicPaths.has(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
```

**Step 5: Run lint**

Run: `npm run lint`

Expected: no new lint errors from the split page and middleware files

**Step 6: Commit**

```bash
git add src/app/page.tsx src/components/app/home-shell.tsx src/lib/auth/session.ts middleware.ts
git commit -m "feat: protect app routes with auth"
```

### Task 8: Add Login and Register Pages

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/register/page.tsx`
- Create: `src/components/auth/login-form.tsx`
- Create: `src/components/auth/register-form.tsx`
- Modify: `src/messages/en.json`
- Modify: `src/messages/zh.json`

**Step 1: Build the login form**

Create a client component that:

- captures `username` and `password`
- calls `signIn("credentials", { redirect: false, username, password })`
- redirects to `/` on success
- shows a concise error on failure

Expected skeleton:

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  // local state, submit handler, error rendering
}
```

**Step 2: Build the register form**

Create a client component that:

- collects `username`, `password`, and `confirmPassword`
- posts to `/api/auth/register`
- auto-signs in on success
- redirects to `/`

**Step 3: Add page wrappers**

Create `/login` and `/register` pages that render the forms inside a lightweight auth card layout and redirect authenticated users back to `/`.

**Step 4: Add translation keys**

Add auth strings to both locale files, for example:

```json
"auth": {
  "login": "Login",
  "register": "Register",
  "username": "Username",
  "password": "Password",
  "confirmPassword": "Confirm Password",
  "usernameTaken": "Username already exists",
  "invalidCredentials": "Invalid username or password",
  "goToRegister": "Create account",
  "goToLogin": "Back to login"
}
```

**Step 5: Run lint**

Run: `npm run lint`

Expected: PASS with the new auth UI files

**Step 6: Commit**

```bash
git add src/app/login/page.tsx src/app/register/page.tsx src/components/auth/login-form.tsx src/components/auth/register-form.tsx src/messages/en.json src/messages/zh.json
git commit -m "feat: add login and registration pages"
```

### Task 9: Add Sign-out and Session-aware UI Touches

**Files:**
- Modify: `src/components/settings/settings-menu.tsx`
- Modify: `src/messages/en.json`
- Modify: `src/messages/zh.json`

**Step 1: Add a logout menu item**

Use `signOut({ callbackUrl: "/login" })` from `next-auth/react` inside the existing settings menu:

```tsx
import { signOut } from "next-auth/react";

<DropdownMenuItem onClick={() => signOut({ callbackUrl: "/login" })}>
  {t("auth.logout")}
</DropdownMenuItem>
```

**Step 2: Add any missing i18n labels**

Examples:

- `auth.logout`
- `auth.registerSuccess`

**Step 3: Run lint**

Run: `npm run lint`

Expected: PASS

**Step 4: Commit**

```bash
git add src/components/settings/settings-menu.tsx src/messages/en.json src/messages/zh.json
git commit -m "feat: add sign out action"
```

### Task 10: Final Verification

**Files:**
- Verify: `package.json`
- Verify: `prisma/schema.prisma`
- Verify: `src/app/login/page.tsx`
- Verify: `src/app/register/page.tsx`
- Verify: `src/app/page.tsx`
- Verify: `middleware.ts`

**Step 1: Run unit tests**

Run: `npm run test -- --run`

Expected: PASS

**Step 2: Run lint**

Run: `npm run lint`

Expected: PASS

**Step 3: Run Prisma client generation if needed**

Run: `npm run db:generate`

Expected: PASS

**Step 4: Manually verify the flow**

Run: `npm run dev`

Manual checklist:

- `/` redirects to `/login` when logged out
- `/register` creates a new user
- successful registration lands on `/`
- logout returns to `/login`
- login with the same username/password succeeds

**Step 5: Commit**

```bash
git add .
git commit -m "feat: add local login and registration flow"
```
