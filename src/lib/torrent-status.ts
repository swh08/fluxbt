import type { TorrentStatus } from '@/lib/types';

export function mapQbittorrentStateToStatus(state: string): TorrentStatus {
  if (state.startsWith('paused')) {
    return 'paused';
  }

  if (state.startsWith('queued')) {
    return 'queued';
  }

  if (
    state === 'uploading' ||
    state === 'stalledUP' ||
    state === 'forcedUP' ||
    state === 'checkingUP'
  ) {
    return 'seeding';
  }

  if (
    state === 'downloading' ||
    state === 'metaDL' ||
    state === 'forcedDL' ||
    state === 'stalledDL' ||
    state === 'checkingDL' ||
    state === 'allocating' ||
    state === 'moving' ||
    state === 'checkingResumeData'
  ) {
    return 'downloading';
  }

  if (state === 'missingFiles' || state === 'error' || state === 'unknown') {
    return 'error';
  }

  return 'queued';
}

export function getStatusBgColor(status: TorrentStatus): string {
  switch (status) {
    case 'downloading':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'seeding':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'paused':
      return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    case 'queued':
      return 'bg-sky-400/10 text-sky-400 border-sky-400/20';
    case 'error':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
}

export function getProgressColor(status: TorrentStatus, progress: number): string {
  if (progress >= 100) {
    return 'bg-emerald-500';
  }

  switch (status) {
    case 'downloading':
      return 'bg-blue-500';
    case 'seeding':
      return 'bg-emerald-500';
    case 'paused':
      return 'bg-slate-500';
    case 'queued':
      return 'bg-sky-400';
    case 'error':
      return 'bg-red-500';
    default:
      return 'bg-primary';
  }
}
