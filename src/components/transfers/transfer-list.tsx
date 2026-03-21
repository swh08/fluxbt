'use client';

import { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useI18n } from '@/contexts/i18n-context';
import { Torrent } from '@/lib/types';
import { TransferRow, MobileTransferRow } from './transfer-row';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface TransferListProps {
  torrents: Torrent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isMobile?: boolean;
  onAction?: (torrent: Torrent, action: 'pause' | 'resume' | 'delete') => void;
}

export type SortField = 'name' | 'progress' | 'downloadSpeed' | 'uploadSpeed' | 'eta' | 'seeds' | 'peers' | 'size' | 'addedAt';
export type SortDirection = 'asc' | 'desc';

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
        <ScrollArea className="min-h-0 flex-1">
          <div className="p-2 space-y-2">
            {sortedTorrents.map((torrent, index) => (
              <motion.div
                key={torrent.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.2, 
                  delay: Math.min(index * 0.03, 0.3),
                  ease: 'easeOut'
                }}
              >
                <MobileTransferRow
                  torrent={torrent}
                  isSelected={selectedId === torrent.id}
                  onClick={() => onSelect(torrent.id)}
                />
              </motion.div>
            ))}
          </div>
        </ScrollArea>
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

        {/* Seeds/Peers - w-16 - hidden on tablet */}
        <button
          onClick={() => handleSort('seeds')}
          className="w-16 flex-shrink-0 items-center gap-1 justify-start cursor-pointer hover:text-foreground transition-colors hidden lg:flex"
        >
          <span>S/P</span>
          {renderSortIcon('seeds')}
        </button>

        {/* Actions - w-12 lg:w-20 */}
        <div className="w-12 lg:w-20 flex-shrink-0" />
      </div>

      {/* Table Body */}
      <ScrollArea className="min-h-0 flex-1">
        <div>
          {sortedTorrents.map((torrent, index) => (
            <motion.div
              key={torrent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.2, 
                delay: Math.min(index * 0.02, 0.4),
                ease: 'easeOut'
              }}
            >
              <TransferRow
                torrent={torrent}
                isSelected={selectedId === torrent.id}
                onClick={() => onSelect(torrent.id)}
                onAction={onAction}
              />
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
