import type { Torrent } from '@/lib/types';

export function mergeSelectedTorrent(base: Torrent | null, details: Torrent | null) {
  if (!base) {
    return details;
  }

  if (!details || details.id !== base.id) {
    return base;
  }

  return {
    ...base,
    path: details.path || base.path,
    trackers: details.trackers.length > 0 ? details.trackers : base.trackers,
    addedAt: details.addedAt,
    files: details.files,
    connectedPeers: details.connectedPeers,
  };
}
