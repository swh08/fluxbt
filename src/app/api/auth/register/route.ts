import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { registerUser } from '@/lib/auth/core';
import { prismaAuthStore } from '@/lib/auth/prisma-store';
import { registerSchema } from '@/lib/auth/schema';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const input = registerSchema.parse(payload);
    const user = await registerUser(prismaAuthStore, input);

    return NextResponse.json(
      {
        id: user.id,
        username: user.username,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 });
    }

    if (error instanceof Error) {
      const status = error.message === 'USERNAME_TAKEN' ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }

    return NextResponse.json({ error: 'UNKNOWN_ERROR' }, { status: 500 });
  }
}
