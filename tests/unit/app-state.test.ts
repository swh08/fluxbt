import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createDashboardStats,
  createServerConnection,
  createServerStats,
  createTorrent,
} from '../helpers/fixtures';

const {
  downloaderClients,
  buildDashboardStatsMock,
  buildOfflineServerStatsMock,
  buildDailyUploadVisualsMock,
  listServerConnectionsMock,
  getUserTimezoneMock,
  getDownloaderClientMock,
} = vi.hoisted(() => {
  const clients = new Map<string, unknown>();

  return {
    downloaderClients: clients,
    buildDashboardStatsMock: vi.fn(),
    buildOfflineServerStatsMock: vi.fn(),
    buildDailyUploadVisualsMock: vi.fn(),
    listServerConnectionsMock: vi.fn(),
    getUserTimezoneMock: vi.fn(),
    getDownloaderClientMock: vi.fn((server: { id: string }) => {
      const client = clients.get(server.id);

      if (!client) {
        throw new Error(`Missing downloader client for ${server.id}`);
      }

      return client;
    }),
  };
});

vi.mock('@/lib/qbittorrent/mappers', () => ({
  buildDashboardStats: buildDashboardStatsMock,
  buildOfflineServerStats: buildOfflineServerStatsMock,
}));

vi.mock('@/lib/qbittorrent/daily-upload', () => ({
  buildDailyUploadVisuals: buildDailyUploadVisualsMock,
}));

vi.mock('@/lib/servers/store', () => ({
  listServerConnections: listServerConnectionsMock,
  getServerConnectionById: vi.fn(),
}));

vi.mock('@/lib/users/store', () => ({
  getUserTimezone: getUserTimezoneMock,
}));

vi.mock('@/lib/downloaders', () => ({
  getDownloaderClient: getDownloaderClientMock,
}));

import { getAppState } from '@/lib/app-state';

function createDownloaderClientStub({
  getLiveState,
}: {
  getLiveState?: ReturnType<typeof vi.fn>;
} = {}) {
  return {
    getLiveState: getLiveState ?? vi.fn().mockResolvedValue({
      stats: createServerStats(),
      torrents: [],
      categories: [],
      tags: [],
    }),
    getTorrentDetails: vi.fn(),
    pauseTorrents: vi.fn(),
    resumeTorrents: vi.fn(),
    deleteTorrents: vi.fn(),
    addTorrent: vi.fn(),
    verifyConnection: vi.fn(),
  };
}

describe('getAppState', () => {
  beforeEach(() => {
    downloaderClients.clear();
    vi.clearAllMocks();
    buildDashboardStatsMock.mockReturnValue(createDashboardStats());
    buildOfflineServerStatsMock.mockImplementation((server: {
      id: string;
      name: string;
      type: 'qbittorrent' | 'transmission';
      host: string;
      port: number;
      username: string;
    }) => createServerStats({
      id: server.id,
      name: server.name,
      type: server.type,
      host: server.host,
      port: server.port,
      username: server.username,
      status: 'offline',
    }));
    buildDailyUploadVisualsMock.mockResolvedValue({
      countryUploads: [],
      trackerShares: [],
      sampledAt: null,
    });
    getUserTimezoneMock.mockResolvedValue('Australia/Sydney');
  });

  it('returns an empty safe state when the user has no servers', async () => {
    const dashboard = createDashboardStats({ totalServers: 0 });

    listServerConnectionsMock.mockResolvedValue([]);
    buildDashboardStatsMock.mockReturnValue(dashboard);

    const state = await getAppState('user-1');

    expect(listServerConnectionsMock).toHaveBeenCalledWith('user-1');
    expect(buildDashboardStatsMock).toHaveBeenCalledWith([]);
    expect(state).toEqual({
      servers: [],
      dashboard,
      selectedServerId: null,
      userTimezone: 'Australia/Sydney',
      todayUploadSampledAt: null,
      categories: [],
      tags: [],
      torrents: [],
      trackerShares: [],
      countryUploads: [],
    });
    expect(buildDailyUploadVisualsMock).not.toHaveBeenCalled();
  });

  it('returns the requested server state and qbittorrent visuals', async () => {
    const transmissionServer = createServerConnection({
      id: 'server-1',
      type: 'transmission',
      name: 'Transmission',
    });
    const qbittorrentServer = createServerConnection({
      id: 'server-2',
      type: 'qbittorrent',
      name: 'qBittorrent',
    });
    const transmissionStats = createServerStats({
      id: 'server-1',
      type: 'transmission',
      name: 'Transmission',
      status: 'online',
      torrentsCount: 2,
    });
    const qbittorrentStats = createServerStats({
      id: 'server-2',
      type: 'qbittorrent',
      name: 'qBittorrent',
      status: 'online',
      torrentsCount: 5,
      downloadingCount: 2,
      seedingCount: 3,
    });
    const qbittorrentTorrents = [
      createTorrent({ id: 'torrent-2', serverId: 'server-2' }),
    ];
    const qbittorrentCategories = [{ id: 'linux', name: 'Linux', count: 1 }];
    const qbittorrentTags = [{ id: 'iso', name: 'iso', color: 'blue', count: 1 }];
    const dashboard = createDashboardStats({ totalServers: 2, onlineServers: 2, totalTorrents: 7 });
    const visuals = {
      countryUploads: [
        { id: 'au', countryCode: 'AU', countryName: 'Australia', uploadBytes: 512, percentage: 100 },
      ],
      trackerShares: [
        { id: 'tracker', name: 'tracker.example.com', uploadBytes: 512, percentage: 100 },
      ],
      sampledAt: '2026-01-01T01:00:00.000Z',
    };

    listServerConnectionsMock.mockResolvedValue([transmissionServer, qbittorrentServer]);
    buildDashboardStatsMock.mockReturnValue(dashboard);
    buildDailyUploadVisualsMock.mockResolvedValue(visuals);
    downloaderClients.set('server-1', createDownloaderClientStub({
      getLiveState: vi.fn().mockResolvedValue({
        stats: transmissionStats,
        torrents: [],
        categories: [],
        tags: [],
      }),
    }));
    downloaderClients.set('server-2', createDownloaderClientStub({
      getLiveState: vi.fn().mockResolvedValue({
        stats: qbittorrentStats,
        torrents: qbittorrentTorrents,
        categories: qbittorrentCategories,
        tags: qbittorrentTags,
      }),
    }));

    const state = await getAppState('user-1', 'server-2');

    expect(state.servers).toEqual([transmissionStats, qbittorrentStats]);
    expect(state.dashboard).toBe(dashboard);
    expect(state.selectedServerId).toBe('server-2');
    expect(state.categories).toEqual(qbittorrentCategories);
    expect(state.tags).toEqual(qbittorrentTags);
    expect(state.torrents).toEqual(qbittorrentTorrents);
    expect(state.trackerShares).toEqual(visuals.trackerShares);
    expect(state.countryUploads).toEqual(visuals.countryUploads);
    expect(state.todayUploadSampledAt).toBe(visuals.sampledAt);
    expect(buildDailyUploadVisualsMock).toHaveBeenCalledWith(
      qbittorrentServer,
      qbittorrentTorrents,
      'Australia/Sydney',
    );
  });

  it('falls back to offline stats when loading live state fails', async () => {
    const server = createServerConnection({ id: 'server-1', name: 'Offline Server' });
    const offlineStats = createServerStats({
      id: 'server-1',
      name: 'Offline Server',
      status: 'offline',
    });

    listServerConnectionsMock.mockResolvedValue([server]);
    buildOfflineServerStatsMock.mockReturnValue(offlineStats);
    downloaderClients.set('server-1', createDownloaderClientStub({
      getLiveState: vi.fn().mockRejectedValue(new Error('NETWORK_ERROR')),
    }));

    const state = await getAppState('user-1', 'server-1');

    expect(buildOfflineServerStatsMock).toHaveBeenCalledWith(server);
    expect(state.servers).toEqual([offlineStats]);
    expect(state.selectedServerId).toBe('server-1');
    expect(state.categories).toEqual([]);
    expect(state.tags).toEqual([]);
    expect(state.torrents).toEqual([]);
    expect(buildDailyUploadVisualsMock).not.toHaveBeenCalled();
  });
});
