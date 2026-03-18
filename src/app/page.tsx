'use client';

import { useState, useMemo, useCallback, useSyncExternalStore } from 'react';
import { MobileSidebar, DesktopSidebar } from '@/components/layout/sidebar';
import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { TransfersPage } from '@/components/transfers/transfers-page';
import { MobileTopbar } from '@/components/layout/topbar';
import { mockTorrents, filterByServer, getDashboardStats } from '@/lib/mock-data';
import { StatusFilter } from '@/lib/types';
import { AnimatePresence, motion } from 'framer-motion';

const emptySubscribe = () => () => {};

// Custom hook for responsive breakpoints
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

export default function Home() {
  // Track if component is hydrated to avoid flash of content
  const isHydrated = useHydrated();
  
  // Responsive hooks
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  
  // View state: null = Dashboard, StatusFilter = Transfers with filter
  const [activeFilter, setActiveFilter] = useState<StatusFilter | null>(null);
  
  // Server selection state
  const [selectedServerId, setSelectedServerId] = useState<string>('server-1');

  // Mobile sidebar state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Tablet sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filter torrents by selected server
  const serverTorrents = useMemo(() => {
    return filterByServer(mockTorrents, selectedServerId);
  }, [selectedServerId]);

  // Handle filter change (switches to Transfers view)
  const handleFilterChange = useCallback((filter: StatusFilter) => {
    setActiveFilter(filter);
    setMobileSidebarOpen(false);
  }, []);

  // Handle dashboard click (back to Dashboard)
  const handleDashboardClick = useCallback(() => {
    setActiveFilter(null);
    setMobileSidebarOpen(false);
  }, []);

  // Handle server change
  const handleServerChange = useCallback((serverId: string) => {
    setSelectedServerId(serverId);
  }, []);

  // Sidebar props
  const sidebarProps = {
    torrents: serverTorrents,
    activeFilter,
    onFilterChange: handleFilterChange,
    onDashboardClick: handleDashboardClick,
    isDashboard: activeFilter === null,
    selectedServerId,
    onServerChange: handleServerChange,
  };

  // Show loading screen during hydration
  if (!isHydrated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          {/* Logo */}
          <div className="w-12 h-12 rounded-xl overflow-hidden">
            <svg
              className="w-12 h-12 animate-pulse"
              viewBox="0 0 32 32"
              fill="none"
            >
              <defs>
                <linearGradient id="loadingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6"/>
                  <stop offset="100%" stopColor="#1D4ED8"/>
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="32" height="32" rx="6" fill="url(#loadingGrad)"/>
              <path d="M7 5 L21 5 L21 8 L10 8 L10 12 L18 12 L18 15 L10 15 L10 23 L7 23 Z" fill="white"/>
              <circle cx="26" cy="26" r="3" fill="#60A5FA"/>
              <circle cx="26" cy="26" r="1.5" fill="white"/>
            </svg>
          </div>
          {/* Loading spinner */}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
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
      className="h-screen flex overflow-hidden bg-background"
    >
      {/* Mobile: Sheet Sidebar */}
      {isMobile && (
        <MobileSidebar
          {...sidebarProps}
          isOpen={mobileSidebarOpen}
          onOpenChange={setMobileSidebarOpen}
        />
      )}

      {/* Tablet & Desktop: Collapsible Sidebar */}
      {!isMobile && (
        <DesktopSidebar
          {...sidebarProps}
          isCollapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Topbar */}
        {isMobile && (
          <MobileTopbar
            onMenuClick={() => setMobileSidebarOpen(true)}
            title={activeFilter === null ? 'Dashboard' : 'Transfers'}
            downloadSpeed={serverTorrents.reduce((sum, t) => sum + t.downloadSpeed, 0)}
            uploadSpeed={serverTorrents.reduce((sum, t) => sum + t.uploadSpeed, 0)}
          />
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeFilter === null ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="flex-1 flex flex-col min-h-0"
            >
              <DashboardPage 
                selectedServerId={selectedServerId}
                onServerChange={handleServerChange}
                isMobile={isMobile}
                isTablet={isTablet}
              />
            </motion.div>
          ) : (
            <motion.div
              key="transfers"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="flex-1 flex flex-col min-h-0"
            >
              <TransfersPage 
                selectedServerId={selectedServerId}
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                isMobile={isMobile}
                isTablet={isTablet}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
