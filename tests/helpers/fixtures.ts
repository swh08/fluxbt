import type { ServerConnection } from '@prisma/client';
import type { ServerProtocol, ServerType } from '@/lib/servers/types';
import type { DashboardStats, ServerStats, Torrent } from '@/lib/types';

export function createServerConnection(overrides: Partial<ServerConnection> = {}): ServerConnection {
  return {
    id: 'server-1',
    userId: 'user-1',
    name: 'Primary Server',
    type: 'qbittorrent',
    protocol: 'http',
    host: 'localhost',
    port: 8080,
    username: 'admin',
    password: 'secret',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

export function createServerStats(overrides: Partial<ServerStats> = {}): ServerStats {
  return {
    id: 'server-1',
    name: 'Primary Server',
    type: 'qbittorrent',
    host: 'localhost',
    port: 8080,
    username: 'admin',
    status: 'online',
    version: '1.0.0',
    downloadSpeed: 0,
    uploadSpeed: 0,
    totalDownloaded: 0,
    totalUploaded: 0,
    torrentsCount: 0,
    downloadingCount: 0,
    seedingCount: 0,
    downloadSpeedHistory: [],
    uploadSpeedHistory: [],
    ...overrides,
  };
}

export function createDashboardStats(overrides: Partial<DashboardStats> = {}): DashboardStats {
  return {
    totalServers: 0,
    onlineServers: 0,
    totalTorrents: 0,
    totalDownloadSpeed: 0,
    totalUploadSpeed: 0,
    allTimeDownloaded: 0,
    allTimeUploaded: 0,
    downloadingCount: 0,
    seedingCount: 0,
    downloadSpeedHistory: [],
    uploadSpeedHistory: [],
    ...overrides,
  };
}

export function createTorrent(overrides: Partial<Torrent> = {}): Torrent {
  return {
    id: 'torrent-1',
    name: 'Ubuntu ISO',
    type: 'ISO',
    size: 1024,
    path: '/downloads/ubuntu.iso',
    trackers: ['udp://tracker.example.com:80/announce'],
    status: 'downloading',
    progress: 50,
    downloadSpeed: 128,
    uploadSpeed: 64,
    eta: 3600,
    seeds: 10,
    peers: 5,
    ratio: 0.5,
    addedAt: new Date('2026-01-01T00:00:00.000Z'),
    category: 'linux',
    tags: ['iso'],
    serverId: 'server-1',
    files: [],
    connectedPeers: [],
    totalDownloaded: 512,
    totalUploaded: 256,
    ...overrides,
  };
}

export function createServerPayload(
  overrides: Partial<{
    name: string;
    type: ServerType;
    protocol: ServerProtocol;
    host: string;
    port: number;
    username: string;
    password: string;
  }> = {},
) {
  return {
    name: 'Primary Server',
    type: 'qbittorrent' as const,
    protocol: 'http' as const,
    host: 'localhost',
    port: 8080,
    username: 'admin',
    password: 'secret',
    ...overrides,
  };
}
