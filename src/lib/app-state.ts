import type { ServerConnection } from '@prisma/client';
import type { AppStateSnapshot, Torrent } from '@/lib/types';
import { QbittorrentClient } from '@/lib/qbittorrent/client';
import {
  buildCategories,
  buildDashboardStats,
  buildOfflineServerStats,
  buildServerStats,
  buildTags,
  mapTorrent,
  mapTorrentDetails,
} from '@/lib/qbittorrent/mappers';
import { buildDailyUploadVisuals } from '@/lib/qbittorrent/daily-upload';
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
  const client = new QbittorrentClient(server);
  const [version, mainData] = await Promise.all([
    client.getVersion(),
    client.getMainData(),
  ]);
  const torrents = Object.entries(mainData.torrents ?? {}).map(([hash, torrent]) =>
    mapTorrent(server.id, hash, torrent),
  );

  return {
    server,
    stats: buildServerStats(server, version, mainData),
    torrents,
    categories: buildCategories(mainData, torrents),
    tags: buildTags(mainData, torrents),
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
  const dailyUploadVisuals = selected && selected.stats.status === 'online'
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

  const client = new QbittorrentClient(server);
  const mainData = await client.getMainData();
  const torrent = mainData.torrents?.[hash];

  if (!torrent) {
    return null;
  }

  const [properties, files, peers, trackers] = await Promise.all([
    client.getTorrentProperties(hash),
    client.getTorrentFiles(hash),
    client.getTorrentPeers(hash),
    client.getTorrentTrackers(hash),
  ]);

  return mapTorrentDetails(serverId, hash, torrent, properties, files, peers, trackers);
}

export async function pauseTorrent(userId: string, serverId: string, hash: string) {
  const server = await getServerConnectionById(userId, serverId);

  if (!server) {
    return null;
  }

  const client = new QbittorrentClient(server);
  await client.pauseTorrents([hash]);
  return true;
}

export async function resumeTorrent(userId: string, serverId: string, hash: string) {
  const server = await getServerConnectionById(userId, serverId);

  if (!server) {
    return null;
  }

  const client = new QbittorrentClient(server);
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

  const client = new QbittorrentClient(server);
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

  const client = new QbittorrentClient(server);
  await client.addTorrent(input);
  return true;
}

export async function verifyServerConnection(server: ServerConnection) {
  const client = new QbittorrentClient(server);
  await client.getVersion();
}
