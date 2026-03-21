import { db } from '@/lib/db';
import { normalizeServerEndpoint } from '@/lib/servers/normalize';
import type { ServerConnectionInput, ServerConnectionUpdateInput } from '@/lib/servers/types';

export async function listServerConnections(userId: string) {
  return db.serverConnection.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });
}

export async function getServerConnectionById(userId: string, serverId: string) {
  return db.serverConnection.findFirst({
    where: {
      id: serverId,
      userId,
    },
  });
}

export async function createServerConnection(userId: string, input: ServerConnectionInput) {
  const endpoint = normalizeServerEndpoint(input.host, input.port);

  return db.serverConnection.create({
    data: {
      userId,
      name: input.name.trim(),
      type: input.type,
      protocol: endpoint.protocol,
      host: endpoint.host,
      port: endpoint.port,
      username: input.username.trim(),
      password: input.password,
    },
  });
}

export async function updateServerConnection(
  userId: string,
  serverId: string,
  input: ServerConnectionUpdateInput,
) {
  const endpoint = normalizeServerEndpoint(input.host, input.port);
  const existing = await getServerConnectionById(userId, serverId);

  if (!existing) {
    return null;
  }

  const result = await db.serverConnection.updateMany({
    where: {
      id: serverId,
      userId,
    },
    data: {
      name: input.name.trim(),
      type: input.type,
      protocol: endpoint.protocol,
      host: endpoint.host,
      port: endpoint.port,
      username: input.username.trim(),
      password: input.password?.trim() ? input.password : existing.password,
    },
  });

  if (result.count === 0) {
    return null;
  }

  return getServerConnectionById(userId, serverId);
}

export async function deleteServerConnection(userId: string, serverId: string) {
  return db.serverConnection.deleteMany({
    where: {
      id: serverId,
      userId,
    },
  });
}
