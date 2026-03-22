import type { ServerConnection } from '@prisma/client';
import type { DownloaderClient } from '@/lib/downloaders/types';
import { createQbittorrentAdapter } from '@/lib/downloaders/qbittorrent-adapter';
import { createTransmissionAdapter } from '@/lib/downloaders/transmission-adapter';

export type { DownloaderAddTorrentInput, DownloaderLiveState } from '@/lib/downloaders/types';

export function getDownloaderClient(server: ServerConnection): DownloaderClient {
  if (server.type === 'transmission') {
    return createTransmissionAdapter(server);
  }

  return createQbittorrentAdapter(server);
}
