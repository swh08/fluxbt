import { NextRequest, NextResponse } from 'next/server';
import type { ServerConnection } from '@prisma/client';
import { getAppSession } from '@/lib/auth/session';
import {
  deleteServerConnection,
  getServerConnectionById,
  updateServerConnection,
} from '@/lib/servers/store';
import { normalizeServerEndpoint } from '@/lib/servers/normalize';
import { toServerConnectionDto } from '@/lib/servers/types';
import { verifyServerConnection } from '@/lib/app-state';

function createTemporaryServer(
  userId: string,
  serverId: string,
  payload: {
    name: string;
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
  },
): ServerConnection {
  const endpoint = normalizeServerEndpoint(payload.host, payload.port);
  const now = new Date();

  return {
    id: serverId,
    userId,
    name: payload.name,
    type: payload.type,
    protocol: endpoint.protocol,
    host: endpoint.host,
    port: endpoint.port,
    username: payload.username,
    password: payload.password,
    createdAt: now,
    updatedAt: now,
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await context.params;
  const server = await getServerConnectionById(session.user.id, id);

  if (!server) {
    return NextResponse.json({ message: 'SERVER_NOT_FOUND' }, { status: 404 });
  }

  return NextResponse.json(toServerConnectionDto(server));
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await context.params;
  const existing = await getServerConnectionById(session.user.id, id);

  if (!existing) {
    return NextResponse.json({ message: 'SERVER_NOT_FOUND' }, { status: 404 });
  }

  const payload = await request.json();
  const password = typeof payload.password === 'string' && payload.password.trim()
    ? payload.password
    : existing.password;

  try {
    await verifyServerConnection(createTemporaryServer(session.user.id, id, {
      ...payload,
      password,
    }));

    const updated = await updateServerConnection(session.user.id, id, {
      ...payload,
      password,
    });

    if (!updated) {
      return NextResponse.json({ message: 'SERVER_NOT_FOUND' }, { status: 404 });
    }

    return NextResponse.json(toServerConnectionDto(updated));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SERVER_UPDATE_FAILED';
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await context.params;
  await deleteServerConnection(session.user.id, id);
  return NextResponse.json({ success: true });
}
