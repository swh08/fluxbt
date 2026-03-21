'use client';

import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';
import { Torrent } from '@/lib/types';
import {
  formatBytes,
  formatSpeed,
  formatETA,
  formatDate,
} from '@/lib/formatters';
import { StatusBadge } from '@/components/ui/status-badge';
import { ProgressBar } from '@/components/ui/progress-bar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useBackground } from '@/contexts/background-context';
import {
  X,
  FileText,
  Users,
  ArrowDown,
  ArrowUp,
  Clock,
  HardDrive,
  Ratio,
  FolderOpen,
  Globe,
} from 'lucide-react';

interface DetailsPanelProps {
  torrent: Torrent | null;
  onClose?: () => void;
  isCompact?: boolean;
}

interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
  isCompact?: boolean;
}

function DetailRow({ label, value, icon: Icon, isCompact }: DetailRowProps) {
  return (
    <div className={cn(
      'flex items-start justify-between',
      isCompact ? 'py-1.5' : 'py-2'
    )}>
      <div className={cn(
        'flex items-center gap-1.5 text-muted-foreground',
        isCompact ? 'text-xs' : 'text-sm'
      )}>
        {Icon && <Icon className={cn(isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />}
        <span>{label}</span>
      </div>
      <div className={cn(
        'font-medium text-foreground text-right max-w-[60%]',
        isCompact ? 'text-xs' : 'text-sm'
      )}>
        {value}
      </div>
    </div>
  );
}

export function DetailsPanel({ torrent, onClose, isCompact = false }: DetailsPanelProps) {
  const { t } = useI18n();
  const { backgroundImage } = useBackground();
  const panelBorderClass = backgroundImage ? 'border-white/15' : 'border-border';
  const dividerBorderClass = backgroundImage ? 'border-white/10' : 'border-border';
  const panelSurfaceClass = backgroundImage
    ? 'bg-card/75 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60'
    : 'bg-card';

  if (!torrent) {
    return (
      <div className={cn('h-full border rounded-lg flex flex-col', panelBorderClass, panelSurfaceClass)}>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-6">
          <div className={cn(
            'rounded-full bg-muted flex items-center justify-center mb-3',
            isCompact ? 'w-10 h-10' : 'w-14 h-14'
          )}>
            <FileText className={cn('text-muted-foreground', isCompact ? 'w-5 h-5' : 'w-7 h-7')} />
          </div>
          <h3 className={cn(
            'font-medium text-foreground mb-1',
            isCompact ? 'text-xs' : 'text-sm'
          )}>
            {t('details.noSelection')}
          </h3>
          <p className={cn(
            'text-muted-foreground',
            isCompact ? 'text-[10px]' : 'text-xs'
          )}>
            {t('details.selectTorrent')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('h-full border rounded-lg flex flex-col', panelBorderClass, panelSurfaceClass)}>
      {/* Header */}
      <div className={cn(
        'flex items-center justify-between border-b',
        dividerBorderClass,
        isCompact ? 'px-3 py-2' : 'px-4 py-3'
      )}>
        <h3 className={cn(
          'font-semibold text-foreground',
          isCompact ? 'text-xs' : 'text-sm'
        )}>
          {t('details.title')}
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className={cn('space-y-3', isCompact ? 'p-3' : 'p-4 space-y-4')}>
          {/* Name Section */}
          <div>
            <h4 className={cn(
              'font-medium text-foreground mb-1.5 truncate',
              isCompact ? 'text-xs' : 'text-sm'
            )} title={torrent.name}>
              {torrent.name}
            </h4>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              <StatusBadge status={torrent.status} size={isCompact ? 'sm' : 'default'} />
              {torrent.trackers[0] && (
                <Badge variant="outline" className={cn('font-mono', isCompact ? 'text-[10px] px-1' : 'text-xs')}>
                  {torrent.trackers[0].replace(/^https?:\/\/|\/.*$/g, '').split('.')[0]}
                </Badge>
              )}
              {torrent.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={cn('font-normal', isCompact ? 'text-[10px]' : 'text-xs')}
                >
                  {tag}
                </Badge>
              ))}
              <Badge variant="outline" className={cn(isCompact ? 'text-[10px] px-1' : 'text-xs')}>
                {torrent.type}
              </Badge>
            </div>
            <ProgressBar
              progress={torrent.progress}
              status={torrent.status}
              showLabel
              className="w-full"
              size={isCompact ? 'sm' : 'default'}
            />
          </div>

          <Separator />

          {/* Stats Section */}
          <div className="space-y-0">
            <DetailRow
              label={t('details.download')}
              value={
                <div className="flex items-center gap-1 text-blue-500">
                  <ArrowDown className={cn(isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
                  <span className="font-mono">
                    {formatSpeed(torrent.downloadSpeed)}
                  </span>
                </div>
              }
              isCompact={isCompact}
            />
            <DetailRow
              label={t('details.upload')}
              value={
                <div className="flex items-center gap-1 text-emerald-500">
                  <ArrowUp className={cn(isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
                  <span className="font-mono">
                    {formatSpeed(torrent.uploadSpeed)}
                  </span>
                </div>
              }
              isCompact={isCompact}
            />
            <DetailRow
              label={t('details.size')}
              value={<span className="font-mono">{formatBytes(torrent.size)}</span>}
              icon={HardDrive}
              isCompact={isCompact}
            />
            <DetailRow
              label={t('details.ratio')}
              value={<span className="font-mono">{torrent.ratio.toFixed(2)}</span>}
              icon={Ratio}
              isCompact={isCompact}
            />
            <DetailRow
              label={t('details.added')}
              value={<span>{formatDate(torrent.addedAt)}</span>}
              icon={Clock}
              isCompact={isCompact}
            />
            <DetailRow
              label={t('details.eta')}
              value={
                <span className="font-mono">
                  {torrent.progress === 100
                    ? t('time.completed')
                    : formatETA(torrent.eta)}
                </span>
              }
              isCompact={isCompact}
            />
            {!isCompact && (
              <>
                <DetailRow
                  label={t('details.path')}
                  value={
                    <span className="font-mono text-xs truncate block" title={torrent.path}>
                      {torrent.path}
                    </span>
                  }
                  icon={FolderOpen}
                />
                <DetailRow
                  label={t('details.tracker')}
                  value={
                    <span className="text-xs truncate" title={torrent.trackers[0]}>
                      {torrent.trackers[0]}
                    </span>
                  }
                  icon={Globe}
                />
              </>
            )}
            <DetailRow
              label={t('details.seeds')}
              value={<span className="font-mono">{torrent.seeds}</span>}
              isCompact={isCompact}
            />
            <DetailRow
              label={t('details.peers')}
              value={<span className="font-mono">{torrent.peers}</span>}
              isCompact={isCompact}
            />
          </div>

          <Separator />

          {/* Files Section - Hidden in compact mode */}
          {!isCompact && (
            <>
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                  <FileText className="w-4 h-4" />
                  <span>{t('details.files')}</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs ml-auto">
                    {torrent.files.length}
                  </Badge>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin">
                  {torrent.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded bg-secondary/50 text-xs"
                    >
                      <span className="truncate flex-1 text-muted-foreground" title={file.name}>
                        {file.name}
                      </span>
                      <span className="font-mono text-muted-foreground ml-2">
                        {formatBytes(file.size)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Connected Peers Section */}
          <div>
            <div className={cn(
              'flex items-center gap-1.5 font-medium text-foreground mb-1.5',
              isCompact ? 'text-xs' : 'text-sm'
            )}>
              <Users className={cn(isCompact ? 'w-3 h-3' : 'w-4 h-4')} />
              <span>{t('details.connectedPeers')}</span>
              <Badge variant="secondary" className={cn('ml-auto', isCompact ? 'h-4 px-1 text-[10px]' : 'h-5 px-1.5 text-xs')}>
                {torrent.connectedPeers.length}
              </Badge>
            </div>
            {torrent.connectedPeers.length > 0 ? (
              <div className={cn('overflow-y-auto scrollbar-thin', isCompact ? 'max-h-24 space-y-0.5' : 'max-h-40 space-y-1')}>
                {torrent.connectedPeers.map((peer) => (
                  <div
                    key={peer.id}
                    className={cn(
                      'flex items-center justify-between rounded bg-secondary/50',
                      isCompact ? 'py-1 px-1.5 text-[10px]' : 'py-1.5 px-2 text-xs'
                    )}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-foreground truncate">
                        {peer.ip}:{peer.port}
                      </span>
                      <span className="text-muted-foreground truncate">
                        {peer.client}
                      </span>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      {peer.uploadSpeed > 0 && (
                        <span className="font-mono text-emerald-500 flex items-center gap-0.5">
                          <ArrowUp className={cn(isCompact ? 'w-2 h-2' : 'w-2.5 h-2.5')} />
                          {formatSpeed(peer.uploadSpeed)}
                        </span>
                      )}
                      {peer.downloadSpeed > 0 && (
                        <span className="font-mono text-blue-500 flex items-center gap-0.5">
                          <ArrowDown className={cn(isCompact ? 'w-2 h-2' : 'w-2.5 h-2.5')} />
                          {formatSpeed(peer.downloadSpeed)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={cn(
                'text-muted-foreground text-center',
                isCompact ? 'text-[10px] py-2' : 'text-xs py-4'
              )}>
                —
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
