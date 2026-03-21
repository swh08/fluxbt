'use client';

import { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { MobileSidebar, DesktopSidebar } from '@/components/layout/sidebar';
import { MobileTopbar } from '@/components/layout/topbar';
import { TransfersPage } from '@/components/transfers/transfers-page';
import { mockTorrents, filterByServer } from '@/lib/mock-data';
import { StatusFilter } from '@/lib/types';
import type { SessionUserIdentity } from '@/lib/auth/session-user';
import { useBackground } from '@/contexts/background-context';
import { cn } from '@/lib/utils';

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

export function HomeShell({ currentUser }: HomeShellProps) {
  const { backgroundImage } = useBackground();
  const isHydrated = useHydrated();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const [activeFilter, setActiveFilter] = useState<StatusFilter | null>(null);
  const [selectedServerId, setSelectedServerId] = useState<string>('server-1');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const serverTorrents = useMemo(() => {
    return filterByServer(mockTorrents, selectedServerId);
  }, [selectedServerId]);

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

  const sidebarProps = {
    torrents: serverTorrents,
    activeFilter,
    onFilterChange: handleFilterChange,
    onDashboardClick: handleDashboardClick,
    isDashboard: activeFilter === null,
    selectedServerId,
    onServerChange: handleServerChange,
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
            downloadSpeed={serverTorrents.reduce((sum, torrent) => sum + torrent.downloadSpeed, 0)}
            uploadSpeed={serverTorrents.reduce((sum, torrent) => sum + torrent.uploadSpeed, 0)}
            currentUser={currentUser}
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
                selectedServerId={selectedServerId}
                onServerChange={handleServerChange}
                isMobile={isMobile}
                isTablet={isTablet}
                currentUser={currentUser}
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
                selectedServerId={selectedServerId}
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                isMobile={isMobile}
                isTablet={isTablet}
                currentUser={currentUser}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
