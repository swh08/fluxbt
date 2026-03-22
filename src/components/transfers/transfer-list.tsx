'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/contexts/i18n-context';
import { Torrent } from '@/lib/types';
import { TransferRow, MobileTransferRow } from './transfer-row';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TransferListProps {
  torrents: Torrent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isMobile?: boolean;
  onAction?: (torrent: Torrent, action: 'pause' | 'resume' | 'delete') => void;
}

export type SortField = 'name' | 'progress' | 'downloadSpeed' | 'uploadSpeed' | 'eta' | 'seeds' | 'peers' | 'size' | 'addedAt';
export type SortDirection = 'asc' | 'desc';

const DESKTOP_OVERSCAN = 8;
const DESKTOP_ROW_HEIGHT_ESTIMATE = 72;
const MOBILE_OVERSCAN = 6;
const MOBILE_ROW_HEIGHT_ESTIMATE = 132;

export function TransferList({
  torrents,
  selectedId,
  onSelect,
  isMobile = false,
  onAction,
}: TransferListProps) {
  const { t } = useI18n();
  const [sortField, setSortField] = useState<SortField>('addedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const mobileScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [mobileScrollTop, setMobileScrollTop] = useState(0);
  const [mobileViewportHeight, setMobileViewportHeight] = useState(0);
  const desktopScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [desktopScrollTop, setDesktopScrollTop] = useState(0);
  const [desktopViewportHeight, setDesktopViewportHeight] = useState(0);
  const [desktopRowHeight, setDesktopRowHeight] = useState(DESKTOP_ROW_HEIGHT_ESTIMATE);

  // Sort torrents
  const sortedTorrents = useMemo(() => {
    return [...torrents].sort((a, b) => {
      let aVal: string | number = '';
      let bVal: string | number = '';

      switch (sortField) {
        case 'name':
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
          break;
        case 'progress':
          aVal = a.progress;
          bVal = b.progress;
          break;
        case 'downloadSpeed':
          aVal = a.downloadSpeed;
          bVal = b.downloadSpeed;
          break;
        case 'uploadSpeed':
          aVal = a.uploadSpeed;
          bVal = b.uploadSpeed;
          break;
        case 'eta':
          aVal = a.eta;
          bVal = b.eta;
          break;
        case 'seeds':
          aVal = a.seeds;
          bVal = b.seeds;
          break;
        case 'peers':
          aVal = a.peers;
          bVal = b.peers;
          break;
        case 'size':
          aVal = a.size;
          bVal = b.size;
          break;
        case 'addedAt':
          aVal = a.addedAt.getTime();
          bVal = b.addedAt.getTime();
          break;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortDirection === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
  }, [torrents, sortField, sortDirection]);

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    const scrollAreaRoot = mobileScrollAreaRef.current;

    if (!scrollAreaRoot) {
      return;
    }

    const viewport = scrollAreaRoot.querySelector<HTMLDivElement>('[data-slot="scroll-area-viewport"]');

    if (!viewport) {
      return;
    }

    const updateViewportHeight = () => {
      setMobileViewportHeight(viewport.clientHeight);
    };

    const updateScrollTop = () => {
      setMobileScrollTop(viewport.scrollTop);
    };

    updateViewportHeight();
    updateScrollTop();

    const resizeObserver = new ResizeObserver(() => {
      updateViewportHeight();
    });

    resizeObserver.observe(viewport);
    viewport.addEventListener('scroll', updateScrollTop, { passive: true });

    return () => {
      resizeObserver.disconnect();
      viewport.removeEventListener('scroll', updateScrollTop);
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      return;
    }

    const scrollAreaRoot = desktopScrollAreaRef.current;

    if (!scrollAreaRoot) {
      return;
    }

    const viewport = scrollAreaRoot.querySelector<HTMLDivElement>('[data-slot="scroll-area-viewport"]');

    if (!viewport) {
      return;
    }

    const updateViewportHeight = () => {
      setDesktopViewportHeight(viewport.clientHeight);
    };

    const updateScrollTop = () => {
      setDesktopScrollTop(viewport.scrollTop);
    };

    updateViewportHeight();
    updateScrollTop();

    const resizeObserver = new ResizeObserver(() => {
      updateViewportHeight();
    });

    resizeObserver.observe(viewport);
    viewport.addEventListener('scroll', updateScrollTop, { passive: true });

    return () => {
      resizeObserver.disconnect();
      viewport.removeEventListener('scroll', updateScrollTop);
    };
  }, [isMobile]);

  const measureDesktopRow = useCallback((node: HTMLDivElement | null) => {
    if (!node) {
      return;
    }

    const measuredHeight = Math.ceil(node.getBoundingClientRect().height);

    if (measuredHeight > 0) {
      setDesktopRowHeight((previousHeight) => (
        previousHeight === measuredHeight ? previousHeight : measuredHeight
      ));
    }
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp className="w-3 h-3 text-primary" />
      : <ArrowDown className="w-3 h-3 text-primary" />;
  };

  if (torrents.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-8">
        <div className={cn(
          'rounded-full bg-muted flex items-center justify-center mb-4',
          isMobile ? 'w-12 h-12' : 'w-14 h-14'
        )}>
          <Search className={cn('text-muted-foreground', isMobile ? 'w-6 h-6' : 'w-7 h-7')} />
        </div>
        <h3 className={cn(
          'font-medium text-foreground mb-2',
          isMobile ? 'text-xs' : 'text-sm'
        )}>
          {t('empty.noResults')}
        </h3>
        <p className={cn(
          'text-muted-foreground max-w-xs',
          isMobile ? 'text-[10px]' : 'text-xs'
        )}>
          {t('empty.tryDifferent')}
        </p>
      </div>
    );
  }

  const mobileMaxScrollTop = Math.max(sortedTorrents.length * MOBILE_ROW_HEIGHT_ESTIMATE - mobileViewportHeight, 0);
  const mobileEffectiveScrollTop = Math.min(mobileScrollTop, mobileMaxScrollTop);
  const mobileVisibleCount = mobileViewportHeight > 0
    ? Math.ceil(mobileViewportHeight / MOBILE_ROW_HEIGHT_ESTIMATE)
    : 0;
  const mobileStartIndex = Math.max(0, Math.floor(mobileEffectiveScrollTop / MOBILE_ROW_HEIGHT_ESTIMATE) - MOBILE_OVERSCAN);
  const mobileEndIndex = mobileVisibleCount > 0
    ? Math.min(sortedTorrents.length, mobileStartIndex + mobileVisibleCount + MOBILE_OVERSCAN * 2)
    : Math.min(sortedTorrents.length, MOBILE_OVERSCAN * 2);
  const mobileVisibleTorrents = sortedTorrents.slice(mobileStartIndex, mobileEndIndex);
  const mobileOffsetTop = mobileStartIndex * MOBILE_ROW_HEIGHT_ESTIMATE + 8;
  const mobileTotalHeight = sortedTorrents.length * MOBILE_ROW_HEIGHT_ESTIMATE + 8;

  const desktopMaxScrollTop = Math.max(sortedTorrents.length * desktopRowHeight - desktopViewportHeight, 0);
  const desktopEffectiveScrollTop = Math.min(desktopScrollTop, desktopMaxScrollTop);
  const desktopVisibleCount = desktopViewportHeight > 0
    ? Math.ceil(desktopViewportHeight / desktopRowHeight)
    : 0;
  const desktopStartIndex = Math.max(0, Math.floor(desktopEffectiveScrollTop / desktopRowHeight) - DESKTOP_OVERSCAN);
  const desktopEndIndex = desktopVisibleCount > 0
    ? Math.min(sortedTorrents.length, desktopStartIndex + desktopVisibleCount + DESKTOP_OVERSCAN * 2)
    : Math.min(sortedTorrents.length, DESKTOP_OVERSCAN * 2);
  const desktopVisibleTorrents = sortedTorrents.slice(desktopStartIndex, desktopEndIndex);
  const desktopOffsetTop = desktopStartIndex * desktopRowHeight;
  const desktopTotalHeight = sortedTorrents.length * desktopRowHeight;

  // Mobile layout - card list
  if (isMobile) {
    return (
      <div className="flex h-full min-h-0 flex-col">
        {/* Mobile sort header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
          <span className="text-xs text-muted-foreground">
            {torrents.length} {t('transfers.items')}
          </span>
          <div className="flex items-center gap-1">
            {['progress', 'downloadSpeed', 'addedAt'].map((field) => (
              <button
                key={field}
                onClick={() => handleSort(field as SortField)}
                className={cn(
                  'px-2 py-1 rounded text-[10px] font-medium transition-colors',
                  sortField === field
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t(`columns.${field === 'downloadSpeed' ? 'dl' : field}`)}
                {sortField === field && (
                  <span className="ml-0.5">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Card List */}
        <div ref={mobileScrollAreaRef} className="min-h-0 flex-1">
          <ScrollArea className="h-full">
            <div className="relative" style={{ height: mobileTotalHeight }}>
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  transform: `translateY(${mobileOffsetTop}px)`,
                }}
              >
                {mobileVisibleTorrents.map((torrent, index) => (
                  <div
                    key={torrent.id}
                    className="px-2 pb-2"
                  >
                    <MobileTransferRow
                      torrent={torrent}
                      isSelected={selectedId === torrent.id}
                      onSelect={onSelect}
                    />
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  }

  // Desktop/Tablet layout - table
  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Table Header */}
      <div className="hidden sm:flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {/* Status indicator - w-1 */}
        <div className="w-1 flex-shrink-0" />
        
        {/* Name - flex-1 min-w-[200px] */}
        <button
          onClick={() => handleSort('name')}
          className="flex-1 min-w-[200px] lg:min-w-[300px] flex items-center gap-1 justify-start cursor-pointer hover:text-foreground transition-colors"
        >
          <span>{t('columns.name')}</span>
          {renderSortIcon('name')}
        </button>

        {/* Size - w-20 */}
        <button
          onClick={() => handleSort('size')}
          className="w-20 flex-shrink-0 flex items-center gap-1 justify-start cursor-pointer hover:text-foreground transition-colors"
        >
          <span>{t('details.size')}</span>
          {renderSortIcon('size')}
        </button>

        {/* Progress - w-28 lg:w-32 */}
        <button
          onClick={() => handleSort('progress')}
          className="w-28 lg:w-32 flex-shrink-0 flex items-center gap-1 justify-start cursor-pointer hover:text-foreground transition-colors"
        >
          <span>{t('columns.progress')}</span>
          {renderSortIcon('progress')}
        </button>

        {/* Status - w-20 lg:w-24 */}
        <div className="w-20 lg:w-24 flex-shrink-0">
          <span>{t('navigation.status')}</span>
        </div>

        {/* Download Speed - w-20 lg:w-24 */}
        <button
          onClick={() => handleSort('downloadSpeed')}
          className="w-20 lg:w-24 flex-shrink-0 flex items-center gap-1 justify-start cursor-pointer hover:text-foreground transition-colors"
        >
          <span className="hidden lg:inline">{t('columns.dl')}</span>
          <span className="lg:hidden">↓</span>
          {renderSortIcon('downloadSpeed')}
        </button>

        {/* Upload Speed - w-20 lg:w-24 */}
        <button
          onClick={() => handleSort('uploadSpeed')}
          className="w-20 lg:w-24 flex-shrink-0 flex items-center gap-1 justify-start cursor-pointer hover:text-foreground transition-colors"
        >
          <span className="hidden lg:inline">{t('columns.ul')}</span>
          <span className="lg:hidden">↑</span>
          {renderSortIcon('uploadSpeed')}
        </button>

        {/* Ratio - w-16 */}
        <div className="w-16 flex-shrink-0">
          <span>{t('details.ratio')}</span>
        </div>

        {/* ETA - w-16 lg:w-20 - hidden on tablet */}
        <button
          onClick={() => handleSort('eta')}
          className="w-16 lg:w-20 flex-shrink-0 items-center gap-1 justify-start cursor-pointer hover:text-foreground transition-colors hidden lg:flex"
        >
          <span>{t('columns.eta')}</span>
          {renderSortIcon('eta')}
        </button>

        {/* Seeds/Peers - w-24 - hidden on tablet */}
        <button
          onClick={() => handleSort('seeds')}
          className="w-24 flex-shrink-0 items-center gap-1 justify-start cursor-pointer hover:text-foreground transition-colors hidden lg:flex"
        >
          <span>{t('columns.seeds')}/{t('columns.peers')}</span>
          {renderSortIcon('seeds')}
        </button>

        {/* Actions - w-12 lg:w-20 */}
        <div className="w-12 lg:w-20 flex-shrink-0" />
      </div>

      {/* Table Body */}
      <div ref={desktopScrollAreaRef} className="min-h-0 flex-1">
        <ScrollArea className="h-full">
          <div className="relative" style={{ height: desktopTotalHeight }}>
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                transform: `translateY(${desktopOffsetTop}px)`,
              }}
            >
              {desktopVisibleTorrents.map((torrent, index) => (
                <div
                  key={torrent.id}
                  ref={index === 0 ? measureDesktopRow : undefined}
                >
                  <TransferRow
                    torrent={torrent}
                    isSelected={selectedId === torrent.id}
                    onSelect={onSelect}
                    onAction={onAction}
                  />
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
