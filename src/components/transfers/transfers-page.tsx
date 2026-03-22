'use client';

import { cn } from '@/lib/utils';
import { Topbar } from '@/components/layout/topbar';
import { TransferList } from '@/components/transfers/transfer-list';
import { DetailsPanel } from '@/components/transfers/details-panel';
import { MobileDetailsSheet } from '@/components/transfers/mobile-details-sheet';
import type { AddTorrentSubmission } from '@/components/transfers/add-torrent-dialog';
import { StatusFilter, type Category, type Tag, type Torrent } from '@/lib/types';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useI18n } from '@/contexts/i18n-context';
import { useBackground } from '@/contexts/background-context';
import { AnimatePresence, motion } from 'framer-motion';
import type { SessionUserIdentity } from '@/lib/auth/session-user';
import { hydrateTorrentDetails } from '@/lib/client-data';
import { shouldResetSelectedTorrentDetails } from '@/components/transfers/selection-state';
import { mergeSelectedTorrent } from '@/components/transfers/selected-torrent';

interface TransfersPageProps {
  selectedServerId: string;
  selectedServerType: 'qbittorrent' | 'transmission' | null;
  activeFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  isMobile?: boolean;
  isTablet?: boolean;
  currentUser?: SessionUserIdentity;
  timezone: string;
  onTimezoneChange?: (timezone: string) => Promise<void>;
  torrents: Torrent[];
  categories: Category[];
  tags: Tag[];
  onRefresh: (preferredServerId?: string | null) => Promise<unknown>;
}

function matchesStatus(torrent: Torrent, filter: StatusFilter) {
  if (filter === 'all') {
    return true;
  }

  return torrent.status === filter;
}

function matchesSearch(torrent: Torrent, query: string) {
  if (!query.trim()) {
    return true;
  }

  const normalizedQuery = query.trim().toLowerCase();
  return (
    torrent.name.toLowerCase().includes(normalizedQuery)
    || torrent.trackers.some((tracker) => tracker.toLowerCase().includes(normalizedQuery))
    || torrent.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
  );
}

export function TransfersPage({
  selectedServerId,
  selectedServerType,
  activeFilter,
  onFilterChange,
  isMobile = false,
  isTablet = false,
  currentUser,
  timezone,
  onTimezoneChange,
  torrents,
  categories,
  tags,
  onRefresh,
}: TransfersPageProps) {
  const { t } = useI18n();
  const { backgroundImage } = useBackground();
  const supportsTorrentMetadata = selectedServerType !== 'transmission';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [selectedTorrentId, setSelectedTorrentId] = useState<string | null>(null);
  const [selectedTorrentDetails, setSelectedTorrentDetails] = useState<Torrent | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const selectedTorrentIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedTorrentIdRef.current = selectedTorrentId;
  }, [selectedTorrentId]);

  useEffect(() => {
    setSelectedTorrentId(null);
    setSelectedTorrentDetails(null);
    setDetailsSheetOpen(false);
  }, [selectedServerId]);

  const filteredTorrents = useMemo(() => {
    return torrents
      .filter((torrent) => matchesStatus(torrent, activeFilter))
      .filter((torrent) => matchesSearch(torrent, searchQuery))
      .filter((torrent) => (
        selectedCategory === 'all'
          ? true
          : selectedCategory === '__none__'
            ? !torrent.category
            : torrent.category === selectedCategory
      ))
      .filter((torrent) => (selectedTag === 'all' ? true : torrent.tags.includes(selectedTag)));
  }, [activeFilter, searchQuery, selectedCategory, selectedTag, torrents]);

  const baseSelectedTorrent = useMemo(() => {
    if (!selectedTorrentId) {
      return null;
    }

    return torrents.find((torrent) => torrent.id === selectedTorrentId) ?? null;
  }, [selectedTorrentId, torrents]);

  useEffect(() => {
    if (!selectedTorrentId || !selectedServerId) {
      setSelectedTorrentDetails(null);
      return;
    }

    let cancelled = false;

    const loadTorrentDetails = async () => {
      const response = await fetch(`/api/servers/${selectedServerId}/torrents/${selectedTorrentId}`, {
        cache: 'no-store',
      });

      if (!response.ok) {
        return;
      }

      const torrent = hydrateTorrentDetails((await response.json()) as Torrent);

      if (!cancelled) {
        setSelectedTorrentDetails(torrent);
      }
    };

    void loadTorrentDetails();
    const intervalId = window.setInterval(() => {
      void loadTorrentDetails();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [selectedServerId, selectedTorrentId]);

  const selectedTorrent = mergeSelectedTorrent(baseSelectedTorrent, selectedTorrentDetails);

  const handleSelect = useCallback((id: string) => {
    const shouldResetDetails = shouldResetSelectedTorrentDetails(selectedTorrentIdRef.current, id);

    setSelectedTorrentId(id);

    if (shouldResetDetails) {
      setSelectedTorrentDetails(null);
    }

    if (isMobile) {
      setDetailsSheetOpen(true);
    }
  }, [isMobile]);

  const handleTorrentAction = useCallback(async (torrent: Torrent, action: 'pause' | 'resume' | 'delete') => {
    if (!selectedServerId) {
      return;
    }

    const endpoint =
      action === 'delete'
        ? `/api/servers/${selectedServerId}/torrents/${torrent.id}/delete`
        : `/api/servers/${selectedServerId}/torrents/${torrent.id}/${action}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: action === 'delete'
        ? { 'Content-Type': 'application/json' }
        : undefined,
      body: action === 'delete' ? JSON.stringify({ deleteFiles: false }) : undefined,
    });

    if (!response.ok) {
      console.error('Failed to perform torrent action.');
      return;
    }

    if (action === 'delete' && selectedTorrentIdRef.current === torrent.id) {
      setSelectedTorrentId(null);
      setSelectedTorrentDetails(null);
    }

    await onRefresh(selectedServerId);
  }, [onRefresh, selectedServerId]);

  const handleAddTorrent = async (input: AddTorrentSubmission) => {
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

    await onRefresh(selectedServerId);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {!isMobile && (
        <Topbar
          title={t('transfers.title')}
          totalCount={filteredTorrents.length}
          downloadSpeed={torrents.reduce((sum, torrent) => sum + torrent.downloadSpeed, 0)}
          uploadSpeed={torrents.reduce((sum, torrent) => sum + torrent.uploadSpeed, 0)}
          showFilters={true}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
          categories={categories}
          tags={tags}
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          currentUser={currentUser}
          timezone={timezone}
          onTimezoneChange={onTimezoneChange}
          addTorrentCategories={categories.filter((category) => category.id !== '__none__')}
          addTorrentTags={tags}
          supportsTorrentMetadata={supportsTorrentMetadata}
          onAddTorrent={handleAddTorrent}
        />
      )}

      <div
        className="flex min-h-0 flex-1 overflow-hidden"
        onClick={(event) => {
          const target = event.target as HTMLElement;
          const isClickOnTorrent = target.closest('[data-torrent-row]');
          const isClickOnDetails = target.closest('[data-details-panel]');

          if (!isClickOnTorrent && !isClickOnDetails && selectedTorrentId) {
            setSelectedTorrentId(null);
            setSelectedTorrentDetails(null);
          }
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeInOut' }}
            className={cn(
              'min-h-0 min-w-0 flex-1 overflow-hidden',
              backgroundImage
                ? 'bg-background/65 backdrop-blur-xl supports-[backdrop-filter]:bg-background/45'
                : 'bg-background',
            )}
          >
            <TransferList
              torrents={filteredTorrents}
              selectedId={selectedTorrentId}
              onSelect={handleSelect}
              isMobile={isMobile}
              onAction={handleTorrentAction}
            />
          </motion.div>
        </AnimatePresence>

        {!isMobile && (
          <div
            data-details-panel
            className={cn(
              'min-h-0 flex-shrink-0 overflow-hidden',
              isTablet ? 'w-72' : 'w-80 lg:w-96',
            )}
          >
            <DetailsPanel
              torrent={selectedTorrent}
              isCompact={isTablet}
              onClose={() => {
                setSelectedTorrentId(null);
                setSelectedTorrentDetails(null);
              }}
            />
          </div>
        )}
      </div>

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
