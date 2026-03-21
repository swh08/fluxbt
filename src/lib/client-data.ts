import type { AppStateSnapshot, Torrent } from '@/lib/types';

function hydrateTorrent(torrent: Torrent): Torrent {
  return {
    ...torrent,
    addedAt: new Date(torrent.addedAt),
  };
}

export function hydrateAppStateSnapshot(snapshot: AppStateSnapshot): AppStateSnapshot {
  return {
    ...snapshot,
    torrents: snapshot.torrents.map(hydrateTorrent),
  };
}

export function hydrateTorrentDetails(torrent: Torrent): Torrent {
  return hydrateTorrent(torrent);
}
