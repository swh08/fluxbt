import type { TorrentStatus } from '@/lib/types';

export function mapTransmissionStatusToStatus(status: number, error = 0): TorrentStatus {
  if (error > 0) {
    return 'error';
  }

  switch (status) {
    case 0:
      return 'paused';
    case 1:
    case 2:
    case 3:
    case 5:
      return 'queued';
    case 4:
      return 'downloading';
    case 6:
      return 'seeding';
    default:
      return 'queued';
  }
}
