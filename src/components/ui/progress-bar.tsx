'use client';

import { Progress } from '@/components/ui/progress';
import { TorrentStatus } from '@/lib/types';
import { getProgressColor } from '@/lib/torrent-status';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0-100
  status: TorrentStatus;
  className?: string;
  showLabel?: boolean;
  size?: 'default' | 'sm';
}

export function ProgressBar({
  progress,
  status,
  className,
  showLabel = false,
  size = 'default',
}: ProgressBarProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'relative flex-1 bg-secondary/50 rounded-full overflow-hidden',
        size === 'default' ? 'h-1.5' : 'h-1'
      )}>
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-300',
            getProgressColor(status, progress),
            status === 'downloading' && 'animate-progress-pulse'
          )}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn(
          'text-muted-foreground w-10 text-right',
          size === 'default' ? 'text-xs' : 'text-[10px]'
        )}>
          {progress}%
        </span>
      )}
    </div>
  );
}
