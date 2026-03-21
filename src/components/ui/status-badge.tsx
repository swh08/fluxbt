'use client';

import { Badge } from '@/components/ui/badge';
import { TorrentStatus } from '@/lib/types';
import { getStatusBgColor } from '@/lib/torrent-status';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TorrentStatus;
  className?: string;
  size?: 'default' | 'sm';
}

export function StatusBadge({ status, className, size = 'default' }: StatusBadgeProps) {
  const { t } = useI18n();

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-medium border',
        size === 'default' ? 'text-xs px-2 py-0.5' : 'text-[10px] px-1.5 py-0',
        getStatusBgColor(status),
        className
      )}
    >
      {t(`status.${status}`)}
    </Badge>
  );
}
