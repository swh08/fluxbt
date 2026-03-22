'use client';

import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';
import { Torrent } from '@/lib/types';
import { formatBytes, formatSpeedShort, formatETA } from '@/lib/formatters';
import { getTrackerHostLabel } from '@/lib/trackers';
import { getCategoryBadgeLabel } from '@/components/transfers/category-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Button } from '@/components/ui/button';
import {
  Play,
  Pause,
  Trash2,
  ArrowDown,
  ArrowUp,
  ChevronRight,
} from 'lucide-react';

interface TransferRowProps {
  torrent: Torrent;
  isSelected: boolean;
  onClick: () => void;
  onAction?: (torrent: Torrent, action: 'pause' | 'resume' | 'delete') => void;
}

// Mobile Card Row
export function MobileTransferRow({ torrent, isSelected, onClick }: TransferRowProps) {
  const { t } = useI18n();
  const categoryBadgeLabel = getCategoryBadgeLabel(torrent.category);

  return (
    <div
      data-torrent-row
      onClick={onClick}
      className={cn(
        'p-3 rounded-lg border cursor-pointer transition-all duration-150',
        'bg-card border-border',
        'active:scale-[0.98]',
        isSelected && 'ring-2 ring-primary border-primary'
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <div
          className={cn(
            'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
            torrent.status === 'downloading' && 'bg-blue-500',
            torrent.status === 'seeding' && 'bg-emerald-500',
            torrent.status === 'paused' && 'bg-slate-500',
            torrent.status === 'queued' && 'bg-sky-400',
            torrent.status === 'error' && 'bg-red-500'
          )}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3 className="text-xs font-medium text-foreground line-clamp-2 leading-tight flex-1">
              {torrent.name}
            </h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          </div>
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1 flex-wrap">
              <StatusBadge status={torrent.status} size="sm" />
              {torrent.trackers[0] && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20 font-mono">
                  {getTrackerHostLabel(torrent.trackers[0])}
                </span>
              )}
              {torrent.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {tag}
                </span>
              ))}
              {categoryBadgeLabel && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">
                  {categoryBadgeLabel}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {formatBytes(torrent.size)}
            </span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-2 ml-3.5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground">{t('columns.progress')}</span>
          <span className="text-[10px] font-mono">{torrent.progress}%</span>
        </div>
        <ProgressBar progress={torrent.progress} status={torrent.status} size="sm" />
      </div>

      {/* Speed Stats */}
      <div className="flex items-center gap-3 ml-3.5">
        <div className="flex items-center gap-1">
          <ArrowDown className={cn(
            'w-3 h-3',
            torrent.downloadSpeed > 0 ? 'text-blue-500' : 'text-muted-foreground'
          )} />
          <span className={cn(
            'text-[10px] font-mono',
            torrent.downloadSpeed > 0 ? 'text-blue-500' : 'text-muted-foreground'
          )}>
            {formatSpeedShort(torrent.downloadSpeed)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <ArrowUp className={cn(
            'w-3 h-3',
            torrent.uploadSpeed > 0 ? 'text-emerald-500' : 'text-muted-foreground'
          )} />
          <span className={cn(
            'text-[10px] font-mono',
            torrent.uploadSpeed > 0 ? 'text-emerald-500' : 'text-muted-foreground'
          )}>
            {formatSpeedShort(torrent.uploadSpeed)}
          </span>
        </div>
        {torrent.eta > 0 && torrent.progress < 100 && (
          <span className="text-[10px] text-muted-foreground ml-auto">
            {formatETA(torrent.eta)}
          </span>
        )}
        {torrent.progress === 100 && (
          <span className="text-[10px] text-emerald-500 ml-auto">
            {t('time.completed')}
          </span>
        )}
      </div>
    </div>
  );
}

// Desktop/Tablet Row
export function TransferRow({ torrent, isSelected, onClick, onAction }: TransferRowProps) {
  const { t } = useI18n();
  const categoryBadgeLabel = getCategoryBadgeLabel(torrent.category);

  const handleActionClick = (e: React.MouseEvent, action: 'pause' | 'resume' | 'delete') => {
    e.stopPropagation();
    onAction?.(torrent, action);
  };

  return (
    <div
      data-torrent-row
      onClick={onClick}
      className={cn(
        'group flex items-center gap-2 px-4 py-3 cursor-pointer',
        'border-b border-border/50 transition-colors duration-150',
        'hover:bg-accent/30',
        isSelected && 'bg-accent/50'
      )}
    >
      {/* Status Indicator - w-1 */}
      <div className="w-1 flex-shrink-0">
        <div
          className={cn(
            'w-1 h-10 rounded-full',
            torrent.status === 'downloading' && 'bg-blue-500',
            torrent.status === 'seeding' && 'bg-emerald-500',
            torrent.status === 'paused' && 'bg-slate-500',
            torrent.status === 'queued' && 'bg-sky-400',
            torrent.status === 'error' && 'bg-red-500'
          )}
        />
      </div>

      {/* Name Column - flex-1 */}
      <div className="flex-1 min-w-[200px] lg:min-w-[300px]">
        <h3 className="text-sm font-medium text-foreground truncate max-w-[350px] lg:max-w-[450px] mb-1" title={torrent.name}>
          {torrent.name}
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground">
          {torrent.trackers[0] && (
            <span className="px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-mono">
              {getTrackerHostLabel(torrent.trackers[0])}
            </span>
          )}
          {torrent.tags.map((tag) => (
            <span key={tag} className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
              {tag}
            </span>
          ))}
          {categoryBadgeLabel && (
            <span className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-[10px]">
              {categoryBadgeLabel}
            </span>
          )}
        </div>
      </div>

      {/* Size Column - w-20 */}
      <div className="w-20 flex-shrink-0">
        <span className="text-xs font-mono text-muted-foreground">
          {formatBytes(torrent.size)}
        </span>
      </div>

      {/* Progress Column - w-28 lg:w-32 */}
      <div className="w-28 lg:w-32 flex-shrink-0 flex flex-col gap-1">
        <span className="text-xs text-muted-foreground font-mono">
          {torrent.progress}%
        </span>
        <ProgressBar progress={torrent.progress} status={torrent.status} />
      </div>

      {/* Status Column - w-20 lg:w-24 */}
      <div className="w-20 lg:w-24 flex-shrink-0">
        <StatusBadge status={torrent.status} size="sm" />
      </div>

      {/* Download Speed Column - w-20 lg:w-24 */}
      <div className="w-20 lg:w-24 flex-shrink-0">
        {torrent.downloadSpeed > 0 ? (
          <div className="flex items-center gap-1 text-xs text-blue-500 font-mono">
            <ArrowDown className="w-3 h-3 flex-shrink-0" />
            <span>{formatSpeedShort(torrent.downloadSpeed)}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Upload Speed Column - w-20 lg:w-24 */}
      <div className="w-20 lg:w-24 flex-shrink-0">
        {torrent.uploadSpeed > 0 ? (
          <div className="flex items-center gap-1 text-xs text-emerald-500 font-mono">
            <ArrowUp className="w-3 h-3 flex-shrink-0" />
            <span>{formatSpeedShort(torrent.uploadSpeed)}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Ratio Column - w-16 */}
      <div className="w-16 flex-shrink-0">
        <span className={cn(
          "text-xs font-mono",
          torrent.ratio >= 1 ? "text-emerald-500" : "text-muted-foreground"
        )}>
          {torrent.ratio.toFixed(2)}
        </span>
      </div>

      {/* ETA Column - w-16 lg:w-20 - hidden on tablet */}
      <div className="w-16 lg:w-20 flex-shrink-0 hidden lg:block">
        <span className="text-xs font-mono text-muted-foreground">
          {torrent.progress === 100
            ? t('time.completed')
            : formatETA(torrent.eta)}
        </span>
      </div>

      {/* Seeds/Peers Column - w-24 - hidden on tablet */}
      <div className="w-24 flex-shrink-0 hidden lg:block">
        <span className="text-xs font-mono text-muted-foreground">
          {torrent.seeds}/{torrent.peers}
        </span>
      </div>

      {/* Actions Column - w-12 lg:w-20 */}
      <div className="w-12 lg:w-20 flex-shrink-0 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {torrent.status === 'paused' || torrent.status === 'queued' ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => handleActionClick(e, 'resume')}
            title={t('actions.resumeTooltip')}
          >
            <Play className="w-3.5 h-3.5" />
          </Button>
        ) : torrent.status !== 'error' && torrent.status !== 'seeding' ? (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => handleActionClick(e, 'pause')}
            title={t('actions.pauseTooltip')}
          >
            <Pause className="w-3.5 h-3.5" />
          </Button>
        ) : null}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive hidden lg:inline-flex"
          onClick={(e) => handleActionClick(e, 'delete')}
          title={t('actions.deleteTooltip')}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
