import type { TorrentStatus } from '@/lib/types';

export function mapTransmissionStatusToStatus(status: number, isFinished = false, error = 0): TorrentStatus {
  if (error > 0) {
    return 'error';
  }

  switch (status) {
    case 0:
    case 1:
      return 'paused';
    case 2:
    case 3:
    case 4:
      return 'downloading';
    case 5:
    case 6:
      return 'seeding';
    default:
      return isFinished ? 'seeding' : 'paused';
  }
}
