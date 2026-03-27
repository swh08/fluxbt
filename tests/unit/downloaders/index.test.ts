import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createServerConnection } from '../../helpers/fixtures';

const {
  createQbittorrentAdapterMock,
  createTransmissionAdapterMock,
} = vi.hoisted(() => ({
  createQbittorrentAdapterMock: vi.fn(),
  createTransmissionAdapterMock: vi.fn(),
}));

vi.mock('@/lib/downloaders/qbittorrent-adapter', () => ({
  createQbittorrentAdapter: createQbittorrentAdapterMock,
}));

vi.mock('@/lib/downloaders/transmission-adapter', () => ({
  createTransmissionAdapter: createTransmissionAdapterMock,
}));

import { getDownloaderClient } from '@/lib/downloaders';

function createDownloaderClientStub() {
  return {
    getLiveState: vi.fn(),
    getTorrentDetails: vi.fn(),
    pauseTorrents: vi.fn(),
    resumeTorrents: vi.fn(),
    deleteTorrents: vi.fn(),
    addTorrent: vi.fn(),
    verifyConnection: vi.fn(),
  };
}

describe('getDownloaderClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the qbittorrent adapter for qbittorrent servers', () => {
    const server = createServerConnection({ type: 'qbittorrent' });
    const qbittorrentClient = createDownloaderClientStub();

    createQbittorrentAdapterMock.mockReturnValue(qbittorrentClient);

    const client = getDownloaderClient(server);

    expect(client).toBe(qbittorrentClient);
    expect(createQbittorrentAdapterMock).toHaveBeenCalledWith(server);
    expect(createTransmissionAdapterMock).not.toHaveBeenCalled();
  });

  it('returns the transmission adapter for transmission servers', () => {
    const server = createServerConnection({ type: 'transmission' });
    const transmissionClient = createDownloaderClientStub();

    createTransmissionAdapterMock.mockReturnValue(transmissionClient);

    const client = getDownloaderClient(server);

    expect(client).toBe(transmissionClient);
    expect(createTransmissionAdapterMock).toHaveBeenCalledWith(server);
    expect(createQbittorrentAdapterMock).not.toHaveBeenCalled();
  });
});
