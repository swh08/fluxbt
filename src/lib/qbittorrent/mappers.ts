import type { ServerConnection } from '@prisma/client';
import type {
  Category,
  DashboardStats,
  DistributionItem,
  ServerStats,
  Tag,
  Torrent,
  TorrentFile,
  TorrentType,
  TrackerShare,
  ConnectedPeer,
} from '@/lib/types';
import {
  type QbittorrentMainData,
  type QbittorrentTorrentFile,
  type QbittorrentTorrentInfo,
  type QbittorrentTorrentPeersResponse,
  type QbittorrentTorrentProperties,
  type QbittorrentTracker,
} from '@/lib/qbittorrent/client';
import { combineHistorySeries, getSpeedHistory, recordSpeedSample } from '@/lib/qbittorrent/history';
import { getTrackerHostLabel } from '@/lib/trackers';
import { mapQbittorrentStateToStatus } from '@/lib/torrent-status';

const TAG_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#14B8A6'];

function clampProgress(progress: number) {
  return Math.max(0, Math.min(100, Math.round(progress * 100)));
}

function getStringColor(input: string) {
  const total = Array.from(input).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return TAG_COLORS[total % TAG_COLORS.length];
}

function inferTorrentType(name: string): TorrentType {
  const lowerName = name.toLowerCase();

  if (lowerName.endsWith('.iso')) return 'ISO';
  if (/\.(mp4|mkv|avi|webm|mov)$/.test(lowerName)) return 'Video';
  if (/\.(mp3|flac|wav|aac|m4a)$/.test(lowerName)) return 'Audio';
  if (/\.(pdf|epub|mobi|doc|docx|txt)$/.test(lowerName)) return 'Document';
  if (/\.(zip|rar|7z|tar|gz|xz)$/.test(lowerName)) return 'Archive';
  if (/\.(exe|msi|dmg|pkg|appimage|deb|rpm)$/.test(lowerName)) return 'Software';

  return 'Other';
}

function splitTags(tags: string) {
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function mapTorrent(serverId: string, hash: string, torrent: QbittorrentTorrentInfo): Torrent {
  return {
    id: hash,
    name: torrent.name,
    type: inferTorrentType(torrent.name),
    size: torrent.size || torrent.completed || 0,
    path: torrent.save_path,
    trackers: torrent.tracker ? [torrent.tracker] : [],
    status: mapQbittorrentStateToStatus(torrent.state),
    progress: clampProgress(torrent.progress),
    downloadSpeed: torrent.dlspeed ?? 0,
    uploadSpeed: torrent.upspeed ?? 0,
    eta: torrent.eta ?? -1,
    seeds: torrent.num_seeds ?? 0,
    peers: torrent.num_leechs ?? 0,
    ratio: torrent.ratio ?? 0,
    addedAt: new Date((torrent.added_on ?? 0) * 1000),
    category: torrent.category || '',
    tags: splitTags(torrent.tags),
    serverId,
    files: [],
    connectedPeers: [],
    totalDownloaded: torrent.downloaded ?? torrent.completed ?? 0,
    totalUploaded: torrent.uploaded ?? 0,
  };
}

export function mapTorrentFiles(files: QbittorrentTorrentFile[]): TorrentFile[] {
  return files.map((file) => ({
    id: String(file.index),
    name: file.name,
    size: file.size,
    progress: clampProgress(file.progress),
  }));
}

export function mapTorrentPeers(peersResponse: QbittorrentTorrentPeersResponse): ConnectedPeer[] {
  return Object.entries(peersResponse.peers ?? {}).map(([peerId, peer]) => {
    const [ip, portString] = peerId.split(':');

    return {
      id: peerId,
      ip,
      port: Number(portString || peer.port || 0),
      client: peer.client,
      progress: clampProgress(peer.progress),
      downloadSpeed: peer.dl_speed ?? 0,
      uploadSpeed: peer.up_speed ?? 0,
      flags: peer.flags ?? '',
    };
  });
}

export function mapTorrentDetails(
  serverId: string,
  hash: string,
  torrent: QbittorrentTorrentInfo,
  properties: QbittorrentTorrentProperties,
  files: QbittorrentTorrentFile[],
  peers: QbittorrentTorrentPeersResponse,
  trackers: QbittorrentTracker[],
): Torrent {
  const base = mapTorrent(serverId, hash, torrent);

  return {
    ...base,
    path: properties.save_path || base.path,
    trackers: trackers
      .map((tracker) => tracker.url)
      .filter(Boolean),
    eta: properties.eta ?? base.eta,
    seeds: properties.seeds ?? base.seeds,
    peers: properties.peers ?? base.peers,
    ratio: properties.share_ratio ?? base.ratio,
    addedAt: new Date((properties.addition_date ?? torrent.added_on ?? 0) * 1000),
    files: mapTorrentFiles(files),
    connectedPeers: mapTorrentPeers(peers),
    totalDownloaded: properties.total_downloaded ?? base.totalDownloaded,
    totalUploaded: properties.total_uploaded ?? base.totalUploaded,
  };
}

export function buildServerStats(
  server: ServerConnection,
  version: string,
  mainData: QbittorrentMainData,
): ServerStats {
  const torrents = Object.entries(mainData.torrents ?? {}).map(([hash, torrent]) =>
    mapTorrent(server.id, hash, torrent),
  );
  const serverState = mainData.server_state;
  const history = recordSpeedSample(
    server.id,
    serverState?.dl_info_speed ?? 0,
    serverState?.up_info_speed ?? 0,
  );

  return {
    id: server.id,
    name: server.name,
    type: server.type as ServerStats['type'],
    host: server.host,
    port: server.port,
    username: server.username,
    status: 'online',
    version,
    downloadSpeed: serverState?.dl_info_speed ?? 0,
    uploadSpeed: serverState?.up_info_speed ?? 0,
    totalDownloaded: serverState?.alltime_dl ?? torrents.reduce((sum, torrent) => sum + torrent.totalDownloaded, 0),
    totalUploaded: serverState?.alltime_ul ?? torrents.reduce((sum, torrent) => sum + torrent.totalUploaded, 0),
    torrentsCount: torrents.length,
    downloadingCount: torrents.filter((torrent) => torrent.status === 'downloading').length,
    seedingCount: torrents.filter((torrent) => torrent.status === 'seeding').length,
    downloadSpeedHistory: history.download,
    uploadSpeedHistory: history.upload,
  };
}

export function buildOfflineServerStats(server: ServerConnection): ServerStats {
  const history = recordSpeedSample(server.id, 0, 0);

  return {
    id: server.id,
    name: server.name,
    type: server.type as ServerStats['type'],
    host: server.host,
    port: server.port,
    username: server.username,
    status: 'offline',
    version: '--',
    downloadSpeed: 0,
    uploadSpeed: 0,
    totalDownloaded: 0,
    totalUploaded: 0,
    torrentsCount: 0,
    downloadingCount: 0,
    seedingCount: 0,
    downloadSpeedHistory: history.download,
    uploadSpeedHistory: history.upload,
  };
}

export function buildDashboardStats(servers: ServerStats[]): DashboardStats {
  const histories = combineHistorySeries(servers);

  return {
    totalServers: servers.length,
    onlineServers: servers.filter((server) => server.status === 'online').length,
    totalTorrents: servers.reduce((sum, server) => sum + server.torrentsCount, 0),
    totalDownloadSpeed: servers.reduce((sum, server) => sum + server.downloadSpeed, 0),
    totalUploadSpeed: servers.reduce((sum, server) => sum + server.uploadSpeed, 0),
    allTimeDownloaded: servers.reduce((sum, server) => sum + server.totalDownloaded, 0),
    allTimeUploaded: servers.reduce((sum, server) => sum + server.totalUploaded, 0),
    downloadingCount: servers.reduce((sum, server) => sum + server.downloadingCount, 0),
    seedingCount: servers.reduce((sum, server) => sum + server.seedingCount, 0),
    downloadSpeedHistory: histories.downloadSpeedHistory,
    uploadSpeedHistory: histories.uploadSpeedHistory,
  };
}

export function buildCategories(
  mainData: QbittorrentMainData,
  torrents: Torrent[],
): Category[] {
  const counts = new Map<string, number>();

  for (const torrent of torrents) {
    const key = torrent.category || '';
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const categoryNames = new Set<string>([
    ...Object.keys(mainData.categories ?? {}),
    ...counts.keys(),
  ]);

  return Array.from(categoryNames)
    .map((name) => ({
      id: name || '__none__',
      name: name || 'Uncategorized',
      count: counts.get(name) ?? 0,
    }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function buildTags(mainData: QbittorrentMainData, torrents: Torrent[]): Tag[] {
  const counts = new Map<string, number>();

  for (const torrent of torrents) {
    for (const tag of torrent.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  const tagNames = new Set<string>([...(mainData.tags ?? []), ...counts.keys()]);

  return Array.from(tagNames)
    .filter(Boolean)
    .map((name) => ({
      id: name,
      name,
      color: getStringColor(name),
      count: counts.get(name) ?? 0,
    }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function buildTrackerShares(torrents: Torrent[]): TrackerShare[] {
  const grouped = new Map<string, number>();
  const totalUploaded = torrents.reduce((sum, torrent) => sum + torrent.totalUploaded, 0);

  for (const torrent of torrents) {
    const trackerName = getTrackerHostLabel(torrent.trackers[0] ?? 'Unknown');
    grouped.set(trackerName, (grouped.get(trackerName) ?? 0) + torrent.totalUploaded);
  }

  return Array.from(grouped.entries())
    .map(([name, uploadBytes]) => ({
      id: name,
      name,
      uploadBytes,
      percentage: totalUploaded > 0 ? uploadBytes / totalUploaded : 0,
    }))
    .sort((left, right) => right.uploadBytes - left.uploadBytes)
    .slice(0, 6);
}

export function buildSavePathDistribution(torrents: Torrent[]): DistributionItem[] {
  const grouped = new Map<string, DistributionItem>();

  for (const torrent of torrents) {
    const label = torrent.path || 'Unknown path';
    const existing = grouped.get(label);

    if (existing) {
      existing.size += torrent.size;
      existing.count += 1;
      continue;
    }

    grouped.set(label, {
      id: label,
      label,
      size: torrent.size,
      count: 1,
    });
  }

  return Array.from(grouped.values())
    .sort((left, right) => right.size - left.size)
    .slice(0, 8);
}

export function getStoredServerHistory(serverId: string) {
  return getSpeedHistory(serverId);
}
