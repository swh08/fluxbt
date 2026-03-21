'use client';

import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';
import { useBackground } from '@/contexts/background-context';
import { formatBytes, formatSpeed } from '@/lib/mock-data';
import { DashboardStats } from '@/lib/mock-data';
import { Server, HardDrive, ArrowDown, ArrowUp } from 'lucide-react';
import { Sparkline } from '@/components/ui/sparkline';

interface StatsCardsProps {
  stats: DashboardStats;
  isMobile?: boolean;
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subValue?: string;
  iconBgColor: string;
  iconColor: string;
  valueColor?: string;
  isMobile?: boolean;
  sparklineData?: number[];
  sparklineColor?: string;
  hasBackground?: boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  iconBgColor,
  iconColor,
  valueColor,
  isMobile,
  sparklineData,
  sparklineColor,
  hasBackground = false,
}: StatCardProps) {
  const cardBorderClass = hasBackground ? 'border-white/15' : 'border-border';

  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg border',
      isMobile ? 'p-3' : 'p-4',
      cardBorderClass,
      hasBackground
        ? 'bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/55'
        : 'bg-card',
      'transition-all duration-200 hover:border-primary/30',
      'group'
    )}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={cn(
          'rounded-lg flex-shrink-0',
          isMobile ? 'p-1.5' : 'p-2',
          iconBgColor
        )}>
          <Icon className={cn(isMobile ? 'w-4 h-4' : 'w-5 h-5', iconColor)} />
        </div>
        <div className="flex-shrink-0">
          <p className={cn(
            'font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap',
            isMobile ? 'text-[10px]' : 'text-xs'
          )}>
            {label}
          </p>
          <p className={cn(
            'font-bold tracking-tight whitespace-nowrap mt-0.5 sm:mt-1',
            isMobile ? 'text-base' : 'text-2xl',
            valueColor || 'text-foreground'
          )}>
            {value}
          </p>
          {subValue && !isMobile && (
            <p className="text-xs text-muted-foreground mt-1 whitespace-nowrap">
              {subValue}
            </p>
          )}
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="flex-1 min-w-0 self-end pb-1">
            <Sparkline
              data={sparklineData}
              color={sparklineColor || 'currentColor'}
              height={isMobile ? 24 : 32}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function StatsCards({ stats, isMobile = false }: StatsCardsProps) {
  const { t } = useI18n();
  const { backgroundImage } = useBackground();

  const cards = [
    {
      icon: Server,
      label: t('dashboard.servers'),
      value: `${stats.onlineServers}/${stats.totalServers}`,
      subValue: '',
      iconBgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      valueColor: 'text-foreground',
    },
    {
      icon: HardDrive,
      label: t('dashboard.torrents'),
      value: stats.totalTorrents,
      subValue: '',
      iconBgColor: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
      valueColor: 'text-foreground',
    },
    {
      icon: ArrowDown,
      label: t('dashboard.totalDownloadSpeed'),
      value: formatSpeed(stats.totalDownloadSpeed),
      subValue: '',
      iconBgColor: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      valueColor: 'text-blue-500',
      sparklineData: stats.downloadSpeedHistory,
      sparklineColor: '#3b82f6',
    },
    {
      icon: ArrowUp,
      label: t('dashboard.totalUploadSpeed'),
      value: formatSpeed(stats.totalUploadSpeed),
      subValue: '',
      iconBgColor: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      valueColor: 'text-emerald-500',
      sparklineData: stats.uploadSpeedHistory,
      sparklineColor: '#10b981',
    },
  ];

  return (
    <div className={cn(
      'grid gap-3 sm:gap-4',
      isMobile 
        ? 'grid-cols-2' 
        : 'grid-cols-2 sm:grid-cols-4'
      )}>
      {cards.map((card, index) => (
        <StatCard key={index} {...card} isMobile={isMobile} hasBackground={Boolean(backgroundImage)} />
      ))}
    </div>
  );
}

interface AllTimeStatsProps {
  stats: DashboardStats;
  isMobile?: boolean;
}

export function AllTimeStats({ stats, isMobile = false }: AllTimeStatsProps) {
  const { t } = useI18n();
  const { backgroundImage } = useBackground();
  const cardBorderClass = backgroundImage ? 'border-white/15' : 'border-border';

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <div className={cn(
        'relative overflow-hidden rounded-lg border',
        isMobile ? 'p-3' : 'p-4',
        cardBorderClass,
        backgroundImage
          ? 'bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/55'
          : 'bg-card',
      )}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn(
            'rounded-lg bg-blue-500/10 flex-shrink-0',
            isMobile ? 'p-1.5' : 'p-2'
          )}>
            <ArrowDown className={cn('text-blue-500', isMobile ? 'w-4 h-4' : 'w-5 h-5')} />
          </div>
          <div className="min-w-0">
            <p className={cn(
              'font-medium text-muted-foreground uppercase tracking-wider truncate',
              isMobile ? 'text-[10px]' : 'text-xs'
            )}>
              {t('dashboard.allTimeDownloaded')}
            </p>
            <p className={cn(
              'font-bold text-blue-500 mt-0.5 sm:mt-1 truncate',
              isMobile ? 'text-base' : 'text-2xl'
            )}>
              {formatBytes(stats.allTimeDownloaded)}
            </p>
          </div>
        </div>
      </div>
      <div className={cn(
        'relative overflow-hidden rounded-lg border',
        isMobile ? 'p-3' : 'p-4',
        cardBorderClass,
        backgroundImage
          ? 'bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/55'
          : 'bg-card',
      )}>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn(
            'rounded-lg bg-emerald-500/10 flex-shrink-0',
            isMobile ? 'p-1.5' : 'p-2'
          )}>
            <ArrowUp className={cn('text-emerald-500', isMobile ? 'w-4 h-4' : 'w-5 h-5')} />
          </div>
          <div className="min-w-0">
            <p className={cn(
              'font-medium text-muted-foreground uppercase tracking-wider truncate',
              isMobile ? 'text-[10px]' : 'text-xs'
            )}>
              {t('dashboard.allTimeUploaded')}
            </p>
            <p className={cn(
              'font-bold text-emerald-500 mt-0.5 sm:mt-1 truncate',
              isMobile ? 'text-base' : 'text-2xl'
            )}>
              {formatBytes(stats.allTimeUploaded)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
