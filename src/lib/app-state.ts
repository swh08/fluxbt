import type { ServerConnection } from '@prisma/client';
import type { AppStateSnapshot, Torrent } from '@/lib/types';
import {
  buildDashboardStats,
  buildOfflineServerStats,
} from '@/lib/qbittorrent/mappers';
import { buildDailyUploadVisuals } from '@/lib/qbittorrent/daily-upload';
import { getDownloaderClient } from '@/lib/downloaders';
import { getServerConnectionById, listServerConnections } from '@/lib/servers/store';
import { getUserTimezone } from '@/lib/users/store';

interface LiveServerResult {
  server: ServerConnection;
  stats: AppStateSnapshot['servers'][number];
  torrents: Torrent[];
  categories: AppStateSnapshot['categories'];
  tags: AppStateSnapshot['tags'];
}

async function loadServerState(server: ServerConnection): Promise<LiveServerResult> {
  const liveState = await getDownloaderClient(server).getLiveState();

  return {
    server,
    stats: liveState.stats,
    torrents: liveState.torrents,
    categories: liveState.categories,
    tags: liveState.tags,
  };
}

async function loadServerStateSafely(server: ServerConnection): Promise<LiveServerResult> {
  try {
    return await loadServerState(server);
  } catch {
    return {
      server,
      stats: buildOfflineServerStats(server),
      torrents: [],
      categories: [],
      tags: [],
    };
  }
}

export async function getAppState(userId: string, requestedServerId?: string | null): Promise<AppStateSnapshot> {
  const [servers, userTimezone] = await Promise.all([
    listServerConnections(userId),
    getUserTimezone(userId),
  ]);
  const liveServers = await Promise.all(servers.map((server) => loadServerStateSafely(server)));
  const selected = liveServers.find((server) => server.server.id === requestedServerId)
    ?? liveServers[0]
    ?? null;
  const dailyUploadVisuals = selected
    && selected.stats.status === 'online'
    && selected.server.type === 'qbittorrent'
    ? await buildDailyUploadVisuals(selected.server, selected.torrents, userTimezone).catch(() => ({
      countryUploads: [],
      trackerShares: [],
      sampledAt: null,
    }))
    : {
      countryUploads: [],
      trackerShares: [],
      sampledAt: null,
    };

  return {
    servers: liveServers.map((server) => server.stats),
    dashboard: buildDashboardStats(liveServers.map((server) => server.stats)),
    selectedServerId: selected?.server.id ?? null,
    userTimezone,
    todayUploadSampledAt: dailyUploadVisuals.sampledAt,
    categories: selected?.categories ?? [],
    tags: selected?.tags ?? [],
    torrents: selected?.torrents ?? [],
    trackerShares: dailyUploadVisuals.trackerShares,
    countryUploads: dailyUploadVisuals.countryUploads,
  };
}

export async function getTorrentDetails(userId: string, serverId: string, hash: string) {
  const server = await getServerConnectionById(userId, serverId);

  if (!server) {
    return null;
  }

  return getDownloaderClient(server).getTorrentDetails(hash);
}

export async function pauseTorrent(userId: string, serverId: string, hash: string) {
  const server = await getServerConnectionById(userId, serverId);

  if (!server) {
    return null;
  }

  const client = getDownloaderClient(server);
  await client.pauseTorrents([hash]);
  return true;
}

export async function resumeTorrent(userId: string, serverId: string, hash: string) {
  const server = await getServerConnectionById(userId, serverId);

  if (!server) {
    return null;
  }

  const client = getDownloaderClient(server);
  await client.resumeTorrents([hash]);
  return true;
}

export async function deleteTorrent(
  userId: string,
  serverId: string,
  hash: string,
  deleteFiles = false,
) {
  const server = await getServerConnectionById(userId, serverId);

  if (!server) {
    return null;
  }

  const client = getDownloaderClient(server);
  await client.deleteTorrents([hash], deleteFiles);
  return true;
}

export async function addTorrentToServer(
  userId: string,
  serverId: string,
  input: {
    urls?: string;
    torrentFile?: File;
    savePath?: string;
    category?: string;
    tags?: string[];
    startImmediately?: boolean;
  },
) {
  const server = await getServerConnectionById(userId, serverId);

  if (!server) {
    return null;
  }

  const client = getDownloaderClient(server);
  await client.addTorrent(input);
  return true;
}

export async function verifyServerConnection(server: ServerConnection) {
  await getDownloaderClient(server).verifyConnection();
}
