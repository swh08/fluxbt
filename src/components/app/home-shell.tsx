'use client';

import { useState, useMemo, useCallback, useSyncExternalStore, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { MobileSidebar, DesktopSidebar } from '@/components/layout/sidebar';
import { MobileTopbar } from '@/components/layout/topbar';
import { TransfersPage } from '@/components/transfers/transfers-page';
import type { AddTorrentSubmission } from '@/components/transfers/add-torrent-dialog';
import { StatusFilter, type AppStateSnapshot } from '@/lib/types';
import type { SessionUserIdentity } from '@/lib/auth/session-user';
import { useBackground } from '@/contexts/background-context';
import { cn } from '@/lib/utils';
import type { ServerConfig } from '@/components/servers/server-dialog';
import { hydrateAppStateSnapshot } from '@/lib/client-data';
import { DEFAULT_TIMEZONE } from '@/lib/timezones';

const emptySubscribe = () => () => {};

function useMediaQuery(query: string): boolean {
  const subscribe = useCallback((callback: () => void) => {
    const media = window.matchMedia(query);
    const listener = () => callback();
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

function useHydrated(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

interface HomeShellProps {
  currentUser?: SessionUserIdentity;
}

const EMPTY_APP_STATE: AppStateSnapshot = {
  servers: [],
  dashboard: {
    totalServers: 0,
    onlineServers: 0,
    totalTorrents: 0,
    totalDownloadSpeed: 0,
    totalUploadSpeed: 0,
    allTimeDownloaded: 0,
    allTimeUploaded: 0,
    downloadingCount: 0,
    seedingCount: 0,
    downloadSpeedHistory: [],
    uploadSpeedHistory: [],
  },
  selectedServerId: null,
  userTimezone: DEFAULT_TIMEZONE,
  todayUploadSampledAt: null,
  categories: [],
  tags: [],
  torrents: [],
  trackerShares: [],
  countryUploads: [],
};

export function HomeShell({ currentUser }: HomeShellProps) {
  const { backgroundImage } = useBackground();
  const isHydrated = useHydrated();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const [activeFilter, setActiveFilter] = useState<StatusFilter | null>(null);
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [appState, setAppState] = useState<AppStateSnapshot>(EMPTY_APP_STATE);

  const refreshState = useCallback(async (preferredServerId?: string | null) => {
    const query = preferredServerId
      ? `?serverId=${encodeURIComponent(preferredServerId)}`
      : '';
    const response = await fetch(`/api/app/state${query}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('APP_STATE_FETCH_FAILED');
    }

    const nextState = hydrateAppStateSnapshot((await response.json()) as AppStateSnapshot);
    setAppState(nextState);
    setSelectedServerId(nextState.selectedServerId);
    return nextState;
  }, []);

  useEffect(() => {
    void refreshState(selectedServerId).catch((error) => {
      console.error('Failed to refresh app state.', error);
    });
  }, [refreshState, selectedServerId]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      void refreshState(selectedServerId).catch((error) => {
        console.error('Failed to refresh app state.', error);
      });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [refreshState, selectedServerId]);

  const selectedServer = useMemo(() => {
    return appState.servers.find((server) => server.id === selectedServerId) ?? null;
  }, [appState.servers, selectedServerId]);
  const supportsTorrentMetadata = selectedServer?.type !== 'transmission';

  const handleFilterChange = useCallback((filter: StatusFilter) => {
    setActiveFilter(filter);
    setMobileSidebarOpen(false);
  }, []);

  const handleDashboardClick = useCallback(() => {
    setActiveFilter(null);
    setMobileSidebarOpen(false);
  }, []);

  const handleServerChange = useCallback((serverId: string) => {
    setSelectedServerId(serverId);
  }, []);

  const handleSaveServer = useCallback(async (server: ServerConfig) => {
    const isEditing = Boolean(server.id);
    const response = await fetch(isEditing ? `/api/servers/${server.id}` : '/api/servers', {
      method: isEditing ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(server),
    });

    if (!response.ok) {
      console.error('Failed to save server.');
      return;
    }

    await refreshState(isEditing ? server.id : undefined);
  }, [refreshState]);

  const handleDeleteServer = useCallback(async (serverId: string) => {
    const response = await fetch(`/api/servers/${serverId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      console.error('Failed to delete server.');
      return;
    }

    const nextSelectedId = serverId === selectedServerId ? null : selectedServerId;
    await refreshState(nextSelectedId);
  }, [refreshState, selectedServerId]);

  const handleAddTorrent = useCallback(async (input: AddTorrentSubmission) => {
    if (!selectedServerId) {
      return;
    }

    const formData = new FormData();

    if (input.magnetLink.trim()) {
      formData.append('urls', input.magnetLink.trim());
    }

    if (input.torrentFile) {
      formData.append('torrentFile', input.torrentFile, input.torrentFile.name);
    }

    formData.append('savePath', input.savePath);
    formData.append('category', input.category);
    formData.append('startImmediately', String(input.startImmediately));

    for (const tag of input.tags) {
      formData.append('tags', tag);
    }

    const response = await fetch(`/api/servers/${selectedServerId}/torrents/add`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      console.error('Failed to add torrent.');
      return;
    }

    await refreshState(selectedServerId);
  }, [refreshState, selectedServerId]);

  const handleTimezoneChange = useCallback(async (timezone: string) => {
    const response = await fetch('/api/user/timezone', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ timezone }),
    });

    if (!response.ok) {
      console.error('Failed to update timezone.');
      return;
    }

    const nextTimezone = ((await response.json()) as { timezone?: string }).timezone;

    if (nextTimezone) {
      setAppState((current) => ({
        ...current,
        userTimezone: nextTimezone,
      }));
    }

    await refreshState(selectedServerId);
  }, [refreshState, selectedServerId]);

  const sidebarProps = {
    servers: appState.servers,
    torrents: appState.torrents,
    activeFilter,
    onFilterChange: handleFilterChange,
    onDashboardClick: handleDashboardClick,
    isDashboard: activeFilter === null,
    selectedServerId: selectedServerId ?? undefined,
    onServerChange: handleServerChange,
    onSaveServer: handleSaveServer,
    onDeleteServer: handleDeleteServer,
  };

  if (!isHydrated) {
    return (
      <div
        className={cn(
          'flex h-screen w-full items-center justify-center',
          backgroundImage ? 'bg-transparent' : 'bg-background',
        )}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 overflow-hidden rounded-xl">
            <svg className="h-12 w-12 animate-pulse" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="loadingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="32" height="32" rx="6" fill="url(#loadingGrad)" />
              <path d="M7 5 L21 5 L21 8 L10 8 L10 12 L18 12 L18 15 L10 15 L10 23 L7 23 Z" fill="white" />
              <circle cx="26" cy="26" r="3" fill="#60A5FA" />
              <circle cx="26" cy="26" r="1.5" fill="white" />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '0ms' }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '150ms' }} />
            <div className="h-2 w-2 animate-bounce rounded-full bg-primary" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'flex h-screen overflow-hidden',
        backgroundImage ? 'bg-transparent' : 'bg-background',
      )}
    >
      {isMobile && (
        <MobileSidebar
          {...sidebarProps}
          isOpen={mobileSidebarOpen}
          onOpenChange={setMobileSidebarOpen}
        />
      )}

      {!isMobile && (
        <DesktopSidebar
          {...sidebarProps}
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {isMobile && (
          <MobileTopbar
            onMenuClick={() => setMobileSidebarOpen(true)}
            title={activeFilter === null ? 'Dashboard' : 'Transfers'}
            downloadSpeed={selectedServer?.downloadSpeed ?? 0}
            uploadSpeed={selectedServer?.uploadSpeed ?? 0}
            currentUser={currentUser}
            timezone={appState.userTimezone}
            onTimezoneChange={handleTimezoneChange}
            addTorrentCategories={appState.categories.filter((category) => category.id !== '__none__')}
            addTorrentTags={appState.tags}
            supportsTorrentMetadata={supportsTorrentMetadata}
            onAddTorrent={handleAddTorrent}
          />
        )}

        <AnimatePresence mode="wait">
          {activeFilter === null ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <DashboardPage
                selectedServerId={selectedServerId ?? ''}
                onServerChange={handleServerChange}
                isMobile={isMobile}
                isTablet={isTablet}
                currentUser={currentUser}
                timezone={appState.userTimezone}
                onTimezoneChange={handleTimezoneChange}
                dashboardStats={appState.dashboard}
                servers={appState.servers}
                trackerShares={appState.trackerShares}
                countryUploads={appState.countryUploads}
                todayUploadSampledAt={appState.todayUploadSampledAt}
              />
            </motion.div>
          ) : (
            <motion.div
              key="transfers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <TransfersPage
                selectedServerId={selectedServerId ?? ''}
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                isMobile={isMobile}
                isTablet={isTablet}
                currentUser={currentUser}
                timezone={appState.userTimezone}
                onTimezoneChange={handleTimezoneChange}
                torrents={appState.torrents}
                categories={appState.categories}
                tags={appState.tags}
                selectedServerType={selectedServer?.type ?? null}
                onRefresh={refreshState}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
