'use client';

import { StatsCards, AllTimeStats } from '@/components/dashboard/stats-cards';
import { ServerCards } from '@/components/dashboard/server-cards';
import { UploadDistributionMap } from '@/components/dashboard/upload-distribution';
import { TrackerPieChart } from '@/components/dashboard/tracker-chart';
import { Topbar } from '@/components/layout/topbar';
import { useI18n } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';
import type { SessionUserIdentity } from '@/lib/auth/session-user';
import type { CountryUploadShare, DashboardStats, ServerStats, TrackerShare } from '@/lib/types';

interface DashboardPageProps {
  selectedServerId: string;
  onServerChange?: (serverId: string) => void;
  isMobile?: boolean;
  isTablet?: boolean;
  currentUser?: SessionUserIdentity;
  dashboardStats: DashboardStats;
  servers: ServerStats[];
  trackerShares: TrackerShare[];
  countryUploads: CountryUploadShare[];
}

export function DashboardPage({
  selectedServerId,
  onServerChange,
  isMobile = false,
  isTablet = false,
  currentUser,
  dashboardStats,
  servers,
  trackerShares,
  countryUploads,
}: DashboardPageProps) {
  const { t } = useI18n();

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top Bar - Hidden on mobile */}
      {!isMobile && (
        <Topbar
          title={t('dashboard.title')}
          showSpeeds={false}
          showAddButton={false}
          currentUser={currentUser}
        />
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Stats Cards - All servers aggregated */}
          <StatsCards stats={dashboardStats} isMobile={isMobile} />

          {/* All-time Stats - All servers aggregated */}
          <AllTimeStats stats={dashboardStats} isMobile={isMobile} />

          {/* Server Overview */}
          <ServerCards 
            servers={servers} 
            selectedServerId={selectedServerId}
            onServerChange={onServerChange}
            isMobile={isMobile}
            isTablet={isTablet}
          />

          {/* Today Upload Visuals - Selected server */}
          <div>
            <h2 className={cn(
              'font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2',
              isMobile ? 'text-xs' : 'text-sm'
            )}>
              {t('dashboard.todayUploadOverview')}
            </h2>
            <div className={cn(
              'grid gap-3 sm:gap-4',
              isMobile ? 'grid-cols-1' : 'grid-cols-2'
            )}>
              <UploadDistributionMap items={countryUploads} isMobile={isMobile} />
              <TrackerPieChart shares={trackerShares} isMobile={isMobile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
