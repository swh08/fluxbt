'use client';

import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';
import { useBackground } from '@/contexts/background-context';
import { ServerStats } from '@/lib/types';
import { formatBytes, formatServerVersion, formatSpeed } from '@/lib/formatters';
import { ArrowDown, ArrowUp, Server } from 'lucide-react';
import { Sparkline } from '@/components/ui/sparkline';

interface ServerCardsProps {
  servers: ServerStats[];
  selectedServerId?: string;
  onServerChange?: (serverId: string) => void;
  isMobile?: boolean;
  isTablet?: boolean;
}

interface ServerCardProps {
  server: ServerStats;
  isSelected?: boolean;
  onClick?: () => void;
  isMobile?: boolean;
  hasBackground?: boolean;
}

function ServerCard({ server, isSelected, onClick, isMobile, hasBackground = false }: ServerCardProps) {
  const { t } = useI18n();
  const isOnline = server.status === 'online';
  const cardBorderClass = hasBackground ? 'border-white/15' : 'border-border';
  const dividerBorderClass = hasBackground ? 'border-white/10' : 'border-border';

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-lg border',
        isMobile ? 'p-3' : 'p-4',
        cardBorderClass,
        hasBackground
          ? 'bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/55'
          : 'bg-card',
        'transition-all duration-200',
        isOnline && onClick && 'cursor-pointer hover:border-primary/30',
        !isOnline && 'opacity-75',
        isSelected && 'ring-2 ring-primary border-primary'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2 sm:mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn(
            'rounded-lg flex-shrink-0',
            isMobile ? 'p-1.5' : 'p-2',
            isOnline ? 'bg-emerald-500/10' : 'bg-red-500/10'
          )}>
            <Server className={cn(
              isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4',
              isOnline ? 'text-emerald-500' : 'text-red-500'
            )} />
          </div>
          <div className="min-w-0">
            <h3 className={cn(
              'font-semibold text-foreground truncate',
              isMobile ? 'text-xs' : 'text-sm'
            )}>
              {server.name}
            </h3>
            <p className={cn(
              'text-muted-foreground font-mono truncate',
              isMobile ? 'text-[10px]' : 'text-xs'
            )}>
              {server.host}:{server.port}
            </p>
          </div>
        </div>
        <span className={cn(
          'text-muted-foreground font-mono flex-shrink-0',
          isMobile ? 'text-[10px]' : 'text-xs'
        )}>
          {formatServerVersion(server.version)}
        </span>
      </div>

      {/* Speed */}
      {isOnline ? (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-4">
          <div className={cn(
            'flex items-center gap-1.5 sm:gap-2 rounded-lg',
            isMobile ? 'p-1.5' : 'p-2',
            'bg-blue-500/10'
          )}>
            <div className="p-1 rounded bg-blue-500/20 flex-shrink-0">
              <ArrowDown className="w-3 h-3 text-blue-500" />
            </div>
            <span className={cn(
              'font-semibold text-blue-500 font-mono whitespace-nowrap',
              isMobile ? 'text-xs' : 'text-sm'
            )}>
              {formatSpeed(server.downloadSpeed)}
            </span>
            <div className="flex-1 min-w-0 self-end pb-0.5">
              <Sparkline
                data={server.downloadSpeedHistory}
                color="#3b82f6"
                height={isMobile ? 16 : 20}
              />
            </div>
          </div>
          <div className={cn(
            'flex items-center gap-1.5 sm:gap-2 rounded-lg',
            isMobile ? 'p-1.5' : 'p-2',
            'bg-emerald-500/10'
          )}>
            <div className="p-1 rounded bg-emerald-500/20 flex-shrink-0">
              <ArrowUp className="w-3 h-3 text-emerald-500" />
            </div>
            <span className={cn(
              'font-semibold text-emerald-500 font-mono whitespace-nowrap',
              isMobile ? 'text-xs' : 'text-sm'
            )}>
              {formatSpeed(server.uploadSpeed)}
            </span>
            <div className="flex-1 min-w-0 self-end pb-0.5">
              <Sparkline
                data={server.uploadSpeedHistory}
                color="#10b981"
                height={isMobile ? 16 : 20}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-2 sm:mb-4">
          <div className={cn(
            'flex items-center justify-center rounded-lg',
            isMobile ? 'p-1.5' : 'p-2',
            'bg-red-500/10 border border-red-500/20 col-span-2'
          )}>
            <span className={cn(
              'font-medium text-red-500',
              isMobile ? 'text-xs' : 'text-sm'
            )}>
              {t('server.offline')}
            </span>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className={cn(
        'gap-2 text-xs',
        isMobile ? 'hidden' : 'grid grid-cols-2'
      )}>
        <div className="flex flex-col">
          <span className="text-muted-foreground">{t('dashboard.downloaded')}</span>
          <span className="font-mono text-foreground">{formatBytes(server.totalDownloaded)}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">{t('dashboard.uploaded')}</span>
          <span className="font-mono text-foreground">{formatBytes(server.totalUploaded)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className={cn(
        'items-center justify-between',
        isMobile ? 'hidden' : 'flex mt-4 pt-3 border-t',
        dividerBorderClass,
      )}>
        <span className="text-xs text-muted-foreground">
          {server.torrentsCount} {t('dashboard.torrentsCount')}
        </span>
        {isOnline && (
          <span className="text-xs text-muted-foreground">
            <span className="text-blue-500">{server.downloadingCount}↓</span>
            {' '}
            <span className="text-emerald-500">{server.seedingCount}↑</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function ServerCards({ servers, selectedServerId, onServerChange, isMobile = false, isTablet = false }: ServerCardsProps) {
  const { t } = useI18n();
  const { backgroundImage } = useBackground();

  return (
    <div>
      <h2 className={cn(
        'font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2',
        isMobile ? 'text-xs' : 'text-sm'
      )}>
        {t('dashboard.serverOverview')}
      </h2>
      <div className={cn(
        'gap-3 sm:gap-4',
        isMobile 
          ? 'grid grid-cols-1 gap-2' 
          : isTablet 
            ? 'grid grid-cols-2' 
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      )}>
        {servers.map((server) => (
          <ServerCard 
            key={server.id} 
            server={server} 
            isSelected={server.id === selectedServerId}
            onClick={onServerChange ? () => onServerChange(server.id) : undefined}
            isMobile={isMobile}
            hasBackground={Boolean(backgroundImage)}
          />
        ))}
      </div>
    </div>
  );
}
