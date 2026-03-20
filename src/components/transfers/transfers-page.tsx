'use client';

import { cn } from '@/lib/utils';
import { Topbar } from '@/components/layout/topbar';
import { TransferList } from '@/components/transfers/transfer-list';
import { DetailsPanel } from '@/components/transfers/details-panel';
import { MobileDetailsSheet } from '@/components/transfers/mobile-details-sheet';
import {
  mockTorrents,
  mockCategories,
  mockTags,
  filterByStatus,
  filterByServer,
  searchTorrents,
} from '@/lib/mock-data';
import { StatusFilter } from '@/lib/types';
import { useState, useMemo } from 'react';
import { useI18n } from '@/contexts/i18n-context';
import { AnimatePresence, motion } from 'framer-motion';
import type { SessionUserIdentity } from '@/lib/auth/session-user';

interface TransfersPageProps {
  selectedServerId: string;
  activeFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  isMobile?: boolean;
  isTablet?: boolean;
  currentUser?: SessionUserIdentity;
}

export function TransfersPage({ 
  selectedServerId, 
  activeFilter, 
  onFilterChange,
  isMobile = false,
  isTablet = false,
  currentUser,
}: TransfersPageProps) {
  const { t } = useI18n();
  
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedTorrentId, setSelectedTorrentId] = useState<string | null>(null);
  
  // Mobile details sheet state
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);

  // Filter torrents by server first
  const serverTorrents = useMemo(() => {
    return filterByServer(mockTorrents, selectedServerId);
  }, [selectedServerId]);

  // Filter torrents by status and other criteria
  const filteredTorrents = useMemo(() => {
    let result = serverTorrents;

    // Filter by status
    result = filterByStatus(result, activeFilter);

    // Filter by search query
    result = searchTorrents(result, searchQuery);

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Filter by tag
    if (selectedTag !== 'all') {
      result = result.filter((t) => t.tags.includes(selectedTag));
    }

    return result;
  }, [serverTorrents, activeFilter, searchQuery, selectedCategory, selectedTag]);

  // Get selected torrent - only return if explicitly selected
  const selectedTorrent = useMemo(() => {
    if (!selectedTorrentId) return null;
    return serverTorrents.find((t) => t.id === selectedTorrentId) || null;
  }, [selectedTorrentId, serverTorrents]);

  // Calculate total speeds for selected server
  const totalDownloadSpeed = useMemo(() => {
    return serverTorrents.reduce((sum, t) => sum + t.downloadSpeed, 0);
  }, [serverTorrents]);

  const totalUploadSpeed = useMemo(() => {
    return serverTorrents.reduce((sum, t) => sum + t.uploadSpeed, 0);
  }, [serverTorrents]);

  // Handle torrent selection - on mobile, open details sheet
  const handleSelect = (id: string) => {
    setSelectedTorrentId(id);
    if (isMobile) {
      setDetailsSheetOpen(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Top Bar - Hidden on mobile */}
      {!isMobile && (
        <Topbar
          title={t('transfers.title')}
          totalCount={filteredTorrents.length}
          downloadSpeed={totalDownloadSpeed}
          uploadSpeed={totalUploadSpeed}
          showFilters={true}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          categories={mockCategories}
          tags={mockTags}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          currentUser={currentUser}
        />
      )}

      {/* Content Area with Details Panel */}
      <div className="flex-1 flex min-h-0 relative" onClick={(e) => {
        // Deselect when clicking on empty area (not on torrent rows or details panel)
        const target = e.target as HTMLElement;
        const isClickOnTorrent = target.closest('[data-torrent-row]');
        const isClickOnDetails = target.closest('[data-details-panel]');
        if (!isClickOnTorrent && !isClickOnDetails && selectedTorrentId) {
          setSelectedTorrentId(null);
        }
      }}>
        {/* Transfer List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className="flex-1 min-w-0 bg-background"
          >
            <TransferList
              torrents={filteredTorrents}
              selectedId={selectedTorrentId}
              onSelect={handleSelect}
              isMobile={isMobile}
            />
          </motion.div>
        </AnimatePresence>

        {/* Details Panel - Hidden on mobile, only shown when torrent selected */}
        <AnimatePresence>
          {!isMobile && selectedTorrent && (
            <motion.div
              key="details-panel"
              data-details-panel
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className={cn(
                'absolute right-0 top-0 bottom-0 z-10',
                'border-l border-border bg-card',
                isTablet ? 'w-72' : 'w-80 lg:w-96'
              )}
            >
              <DetailsPanel 
                torrent={selectedTorrent} 
                isCompact={isTablet}
                onClose={() => setSelectedTorrentId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Details Sheet */}
      {isMobile && (
        <MobileDetailsSheet
          torrent={selectedTorrent}
          isOpen={detailsSheetOpen}
          onOpenChange={setDetailsSheetOpen}
        />
      )}
    </div>
  );
}
