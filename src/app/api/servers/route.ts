import { NextRequest, NextResponse } from 'next/server';
import type { ServerConnection } from '@prisma/client';
import { getAppSession } from '@/lib/auth/session';
import { createServerConnection, listServerConnections } from '@/lib/servers/store';
import { normalizeServerEndpoint } from '@/lib/servers/normalize';
import { toServerConnectionDto } from '@/lib/servers/types';
import { verifyServerConnection } from '@/lib/app-state';

function createTemporaryServer(
  userId: string,
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
    id: 'temp-server',
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

export async function GET() {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const servers = await listServerConnections(session.user.id);
  return NextResponse.json(servers.map(toServerConnectionDto));
}

export async function POST(request: NextRequest) {
  const session = await getAppSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'UNAUTHORIZED' }, { status: 401 });
  }

  const payload = await request.json();

  try {
    await verifyServerConnection(createTemporaryServer(session.user.id, payload));
    const createdServer = await createServerConnection(session.user.id, payload);
    return NextResponse.json(toServerConnectionDto(createdServer), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'SERVER_CREATE_FAILED';
    return NextResponse.json({ message }, { status: 400 });
  }
}
