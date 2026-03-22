import type { ServerConnection } from '@prisma/client';
import type { DownloaderClient } from '@/lib/downloaders/types';
import { QbittorrentClient } from '@/lib/qbittorrent/client';
import {
  buildCategories,
  buildServerStats,
  buildTags,
  mapTorrent,
  mapTorrentDetails,
} from '@/lib/qbittorrent/mappers';

export function createQbittorrentAdapter(server: ServerConnection): DownloaderClient {
  const client = new QbittorrentClient(server);

  return {
    async getLiveState() {
      const [version, mainData] = await Promise.all([
        client.getVersion(),
        client.getMainData(),
      ]);
      const torrents = Object.entries(mainData.torrents ?? {}).map(([hash, torrent]) =>
        mapTorrent(server.id, hash, torrent),
      );

      return {
        stats: buildServerStats(server, version, mainData),
        torrents,
        categories: buildCategories(mainData, torrents),
        tags: buildTags(mainData, torrents),
      };
    },

    async getTorrentDetails(hash) {
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

      return mapTorrentDetails(server.id, hash, torrent, properties, files, peers, trackers);
    },

    async pauseTorrents(hashes) {
      await client.pauseTorrents(hashes);
    },

    async resumeTorrents(hashes) {
      await client.resumeTorrents(hashes);
    },

    async deleteTorrents(hashes, deleteFiles) {
      await client.deleteTorrents(hashes, deleteFiles);
    },

    async addTorrent(input) {
      await client.addTorrent(input);
    },

    async verifyConnection() {
      await client.getVersion();
    },
  };
}
