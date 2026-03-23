export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const base = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    sizes.length - 1,
  );

  return `${parseFloat((bytes / Math.pow(base, index)).toFixed(2))} ${sizes[index]}`;
}

export function formatSpeed(bytesPerSecond: number): string {
  return `${formatBytes(bytesPerSecond)}/s`;
}

export function formatSpeedShort(bytesPerSecond: number): string {
  if (bytesPerSecond === 0) return '0';

  const base = 1024;
  const sizes = ['B', 'K', 'M', 'G', 'T'];
  const index = Math.min(
    Math.floor(Math.log(bytesPerSecond) / Math.log(base)),
    sizes.length - 1,
  );

  return `${parseFloat((bytesPerSecond / Math.pow(base, index)).toFixed(1))}${sizes[index]}`;
}

export function formatETA(seconds: number): string {
  if (seconds < 0) return '--';
  if (seconds === 0) return '0s';

  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts: string[] = [];

  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (remainingSeconds > 0 && parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(' ') || '0s';
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatServerVersion(version: string): string {
  const normalized = version.trim();

  if (!normalized || normalized === '--') {
    return normalized || '--';
  }

  return normalized.startsWith('v') ? normalized : `v${normalized}`;
}
