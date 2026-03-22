import type { ServerConnection } from '@prisma/client';
import type { DownloaderClient } from '@/lib/downloaders/types';
import { TransmissionClient } from '@/lib/transmission/client';
import {
  buildTransmissionServerStats,
  mapTransmissionTorrent,
  mapTransmissionTorrentDetails,
} from '@/lib/transmission/mappers';

export function createTransmissionAdapter(server: ServerConnection): DownloaderClient {
  const client = new TransmissionClient(server);

  return {
    async getLiveState() {
      const [version, sessionStats, rawTorrents] = await Promise.all([
        client.getVersion(),
        client.getSessionStats(),
        client.getTorrents(),
      ]);
      const torrents = rawTorrents.map((torrent) => mapTransmissionTorrent(server.id, torrent));

      return {
        stats: buildTransmissionServerStats(server, version, sessionStats, torrents),
        torrents,
        categories: [],
        tags: [],
      };
    },

    async getTorrentDetails(hash) {
      const torrent = await client.getTorrent(hash);

      if (!torrent) {
        return null;
      }

      return mapTransmissionTorrentDetails(server.id, torrent);
    },

    async pauseTorrents(hashes) {
      await client.stopTorrents(hashes);
    },

    async resumeTorrents(hashes) {
      await client.startTorrents(hashes);
    },

    async deleteTorrents(hashes, deleteFiles) {
      await client.removeTorrents(hashes, deleteFiles);
    },

    async addTorrent(input) {
      await client.addTorrent(input);
    },

    async verifyConnection() {
      await client.getVersion();
    },
  };
}
