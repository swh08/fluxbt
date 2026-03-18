'use client';

import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';
import { Torrent } from '@/lib/types';
import { formatBytes, formatSpeed, formatETA, formatDate } from '@/lib/mock-data';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  ArrowDown,
  ArrowUp,
  Clock,
  HardDrive,
  FolderOpen,
  Calendar,
  Users,
  Server,
  Activity,
  FileText,
} from 'lucide-react';

interface MobileDetailsSheetProps {
  torrent: Torrent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDetailsSheet({ torrent, isOpen, onOpenChange }: MobileDetailsSheetProps) {
  const { t } = useI18n();

  if (!torrent) return null;

  const statusColors: Record<string, string> = {
    downloading: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    seeding: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    paused: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    queued: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    error: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const progressColors: Record<string, string> = {
    downloading: 'bg-blue-500',
    seeding: 'bg-emerald-500',
    paused: 'bg-slate-500',
    queued: 'bg-sky-400',
    error: 'bg-red-500',
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl p-0 bg-card">
        <SheetHeader className="px-4 pt-4 pb-2 border-b border-border">
          <SheetTitle className="text-left text-sm font-semibold line-clamp-2">
            {torrent.name}
          </SheetTitle>
          <div className="flex items-center gap-1.5 flex-wrap mt-2">
            <Badge variant="outline" className={cn('text-xs', statusColors[torrent.status])}>
              {t(`status.${torrent.status}`)}
            </Badge>
            {torrent.trackers[0] && (
              <Badge variant="outline" className="text-xs font-mono">
                {torrent.trackers[0].replace(/^https?:\/\/|\/.*$/g, '').split('.')[0]}
              </Badge>
            )}
            {torrent.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            <Badge variant="secondary" className="text-xs">
              {torrent.type}
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 h-[calc(85vh-140px)]">
          <div className="p-4 space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('details.progress')}</span>
                <span className="font-medium">{torrent.progress}%</span>
              </div>
              <Progress 
                value={torrent.progress} 
                className="h-2"
              />
            </div>

            {/* Speed Stats */}
            {torrent.status !== 'paused' && torrent.status !== 'error' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/10">
                  <ArrowDown className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">DL</p>
                    <p className="text-sm font-semibold text-blue-500 font-mono">
                      {formatSpeed(torrent.downloadSpeed)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10">
                  <ArrowUp className="w-4 h-4 text-emerald-500" />
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">UL</p>
                    <p className="text-sm font-semibold text-emerald-500 font-mono">
                      {formatSpeed(torrent.uploadSpeed)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <HardDrive className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('details.size')}</span>
                </div>
                <p className="text-sm font-medium font-mono">{formatBytes(torrent.size)}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('details.eta')}</span>
                </div>
                <p className="text-sm font-medium font-mono">{formatETA(torrent.eta)}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('details.peers')}</span>
                </div>
                <p className="text-sm font-medium font-mono">{torrent.seeds} / {torrent.peers}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('details.ratio')}</span>
                </div>
                <p className="text-sm font-medium font-mono">{torrent.ratio.toFixed(2)}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('details.path')}</span>
                </div>
                <p className="text-xs font-mono truncate">{torrent.path}</p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{t('details.added')}</span>
                </div>
                <p className="text-xs font-mono">{formatDate(torrent.addedAt)}</p>
              </div>
            </div>

            {/* Transfer Stats */}
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-xs font-medium text-muted-foreground mb-2">{t('details.transfer')}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <ArrowDown className="w-3 h-3 text-blue-500" />
                  <span className="text-muted-foreground">DL:</span>
                  <span className="font-mono">{formatBytes(torrent.totalDownloaded)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ArrowUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-muted-foreground">UL:</span>
                  <span className="font-mono">{formatBytes(torrent.totalUploaded)}</span>
                </div>
              </div>
            </div>

            {/* Connected Peers Preview */}
            {torrent.connectedPeers.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {t('details.peers')} ({torrent.connectedPeers.length})
                </p>
                <div className="space-y-2">
                  {torrent.connectedPeers.slice(0, 5).map((peer) => (
                    <div key={peer.id} className="flex items-center justify-between text-xs p-2 rounded bg-muted/30">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono truncate">{peer.ip}:{peer.port}</p>
                        <p className="text-muted-foreground truncate">{peer.client}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {peer.downloadSpeed > 0 && (
                          <span className="text-blue-500 font-mono text-[10px]">
                            ↓{formatSpeed(peer.downloadSpeed)}
                          </span>
                        )}
                        {peer.uploadSpeed > 0 && (
                          <span className="text-emerald-500 font-mono text-[10px]">
                            ↑{formatSpeed(peer.uploadSpeed)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
