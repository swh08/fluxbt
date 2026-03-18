'use client';

import { StatsCards, AllTimeStats } from '@/components/dashboard/stats-cards';
import { ServerCards } from '@/components/dashboard/server-cards';
import { UploadDistributionMap } from '@/components/dashboard/upload-distribution';
import { TrackerPieChart } from '@/components/dashboard/tracker-chart';
import { Topbar } from '@/components/layout/topbar';
import { mockTorrents, mockServers, filterByServer, getDashboardStats } from '@/lib/mock-data';
import { useI18n } from '@/contexts/i18n-context';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface DashboardPageProps {
  selectedServerId: string;
  onServerChange?: (serverId: string) => void;
  isMobile?: boolean;
  isTablet?: boolean;
}

export function DashboardPage({ selectedServerId, onServerChange, isMobile = false, isTablet = false }: DashboardPageProps) {
  const { t } = useI18n();

  // Aggregate stats from ALL servers for top cards
  const allServersStats = useMemo(() => {
    return getDashboardStats();
  }, []);

  // Get selected server (for upload distribution)
  const selectedServer = useMemo(() => {
    return mockServers.find(s => s.id === selectedServerId) || mockServers[0];
  }, [selectedServerId]);

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top Bar - Hidden on mobile */}
      {!isMobile && (
        <Topbar
          title={t('dashboard.title')}
          showSpeeds={false}
          showAddButton={false}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Stats Cards - All servers aggregated */}
          <StatsCards stats={allServersStats} isMobile={isMobile} />

          {/* All-time Stats - All servers aggregated */}
          <AllTimeStats stats={allServersStats} isMobile={isMobile} />

          {/* Server Overview */}
          <ServerCards 
            servers={mockServers} 
            selectedServerId={selectedServerId}
            onServerChange={onServerChange}
            isMobile={isMobile}
            isTablet={isTablet}
          />

          {/* Upload Distribution - Selected server */}
          <div>
            <h2 className={cn(
              'font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2',
              isMobile ? 'text-xs' : 'text-sm'
            )}>
              {t('uploadDistribution.title')}
            </h2>
            <div className={cn(
              'grid gap-3 sm:gap-4',
              isMobile ? 'grid-cols-1' : 'grid-cols-2'
            )}>
              <UploadDistributionMap selectedServerId={selectedServerId} isMobile={isMobile} />
              <TrackerPieChart isMobile={isMobile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
