'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';
import { useBackground } from '@/contexts/background-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Server,
  LayoutDashboard,
  Download,
  Upload,
  Pause,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  List,
  Menu,
  X,
  Plus,
  Pencil,
} from 'lucide-react';
import { StatusFilter, TorrentStatus, Torrent, ServerStats } from '@/lib/types';
import { useState } from 'react';
import { ServerDialog, ServerConfig } from '@/components/servers/server-dialog';
import { AnimatePresence, motion } from 'framer-motion';

interface SidebarProps {
  servers: ServerStats[];
  torrents: Torrent[];
  activeFilter: StatusFilter | null;
  onFilterChange: (filter: StatusFilter) => void;
  onDashboardClick: () => void;
  isDashboard: boolean;
  selectedServerId?: string;
  onServerChange?: (serverId: string) => void;
  onSaveServer?: (server: ServerConfig) => Promise<void> | void;
  onDeleteServer?: (serverId: string) => Promise<void> | void;
  // Mobile sheet state
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Tablet collapse state
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const statusIcons: Record<TorrentStatus, React.ElementType> = {
  downloading: Download,
  seeding: Upload,
  paused: Pause,
  error: AlertCircle,
};

const statusColors: Record<TorrentStatus, string> = {
  downloading: 'text-blue-500',
  seeding: 'text-emerald-500',
  paused: 'text-slate-500',
  error: 'text-red-500',
};

function SidebarContent({
  servers,
  torrents,
  activeFilter,
  onFilterChange,
  onDashboardClick,
  isDashboard,
  selectedServerId,
  onServerChange,
  onSaveServer,
  onDeleteServer,
  isCollapsed = false,
  onCollapsedChange,
  onOpenChange,
}: SidebarProps & {
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onOpenChange?: (open: boolean) => void;
}) {
  const { t } = useI18n();
  const { backgroundImage } = useBackground();
  const [serverDropdownOpen, setServerDropdownOpen] = useState(false);
  const [serverDialogOpen, setServerDialogOpen] = useState(false);
  const [editingServer, setEditingServer] = useState<ServerConfig | null>(null);
  const sidebarBorderClass = backgroundImage ? 'border-white/10' : 'border-sidebar-border';
  const panelBorderClass = backgroundImage ? 'border-white/15' : 'border-border';

  const statuses: TorrentStatus[] = ['downloading', 'seeding', 'paused', 'error'];

  const getCount = (status: TorrentStatus | 'all'): number => {
    if (status === 'all') return torrents.length;
    return torrents.filter((t) => t.status === status).length;
  };

  const selectedServer = servers.find((server) => server.id === selectedServerId)
    ?? servers.find((server) => server.status === 'online')
    ?? servers[0]
    ?? null;

  const handleServerSelect = (serverId: string) => {
    onServerChange?.(serverId);
    setServerDropdownOpen(false);
  };

  const handleAddServer = () => {
    setEditingServer(null);
    setServerDialogOpen(true);
    setServerDropdownOpen(false);
  };

  const handleEditServer = (server: ServerStats) => {
    setEditingServer({
      id: server.id,
      name: server.name,
      type: server.type,
      host: server.host,
      port: server.port,
      username: server.username,
      password: '',
    });
    setServerDialogOpen(true);
    setServerDropdownOpen(false);
  };

  const handleSaveServer = async (server: ServerConfig) => {
    await onSaveServer?.(server);
    setServerDialogOpen(false);
    setEditingServer(null);
  };

  const handleDeleteServer = async (serverId: string) => {
    await onDeleteServer?.(serverId);
    setServerDialogOpen(false);
    setEditingServer(null);
  };

  const handleNavClick = (callback: () => void) => {
    callback();
    // Close mobile sheet after navigation
    onOpenChange?.(false);
  };

  // Single unified sidebar with transitions
  return (
    <>
      <aside 
        className={cn(
          'flex-shrink-0 border-r flex flex-col h-full',
          sidebarBorderClass,
          backgroundImage
            ? 'bg-sidebar/70 backdrop-blur-xl supports-[backdrop-filter]:bg-sidebar/55'
            : 'bg-sidebar',
          'transition-all duration-200 ease-in-out',
          isCollapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Brand Section */}
        <div className={cn(
          'h-14 border-b flex items-center px-3',
          sidebarBorderClass,
          isCollapsed ? 'justify-center' : ''
        )}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src="/logo.svg"
                alt="FluxBT logo"
                width={32}
                height={32}
                priority
                className="h-8 w-8"
              />
            </div>
            {/* App name - hidden when collapsed */}
            <div className={cn(
              'transition-opacity duration-200',
              isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
            )}>
              <h1 className="text-sm font-semibold text-sidebar-foreground whitespace-nowrap">
                {t('app.name')}
              </h1>
              <p className="text-xs text-muted-foreground whitespace-nowrap">{t('app.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Server Selector - only show when expanded */}
        <div className={cn(
          'mx-2 mt-3 transition-opacity duration-200',
          isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
        )}>
          {selectedServer ? (
            <button
              onClick={() => setServerDropdownOpen(!serverDropdownOpen)}
              className={cn(
                'w-full px-3 py-2 rounded-lg border-2 text-left',
                'transition-colors',
                backgroundImage
                  ? 'bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/55'
                  : 'bg-card',
                selectedServer.status === 'online' ? 'border-emerald-500/50' : 'border-red-500/50',
                'hover:border-primary/50'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Server className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-card-foreground truncate">
                  {selectedServer.name}
                </span>
                <ChevronDown className={cn(
                  'w-4 h-4 text-muted-foreground ml-auto transition-transform flex-shrink-0',
                  serverDropdownOpen && 'rotate-180'
                )} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono truncate">
                  {selectedServer.host}:{selectedServer.port}
                </span>
              </div>
            </button>
          ) : (
            <button
              onClick={handleAddServer}
              className={cn(
                'w-full px-3 py-3 rounded-lg border-2 text-left text-sm font-medium text-card-foreground',
                backgroundImage
                  ? 'bg-card/70 backdrop-blur-xl supports-[backdrop-filter]:bg-card/55'
                  : 'bg-card',
                'border-dashed border-primary/40 hover:border-primary/60 transition-colors',
              )}
            >
              {t('serverDialog.addServer')}
            </button>
          )}

          {/* Server Dropdown */}
          <AnimatePresence>
            {serverDropdownOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div
                  className={cn(
                    'mt-2 border rounded-lg',
                    panelBorderClass,
                    backgroundImage
                      ? 'bg-card/75 backdrop-blur-xl supports-[backdrop-filter]:bg-card/60'
                      : 'bg-card',
                  )}
                >
                  {servers.map((server) => (
                    <div
                      key={server.id}
                      className={cn(
                        'flex items-center text-xs hover:bg-accent transition-colors',
                        server.id === selectedServer?.id && 'bg-accent/50'
                      )}
                    >
                      <button
                        onClick={() => handleServerSelect(server.id)}
                        className="flex-1 p-2 flex items-center gap-2 text-left"
                      >
                        <span
                          className={cn(
                            'w-2 h-2 rounded-full flex-shrink-0',
                            server.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'
                          )}
                        />
                        <span className="flex-1 truncate">{server.name}</span>
                      </button>
                      <button
                        onClick={() => handleEditServer(server)}
                        className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* Add Server Button */}
                  <button
                    onClick={handleAddServer}
                    className={cn(
                      'w-full p-2 text-left text-xs hover:bg-accent transition-colors',
                      'flex items-center gap-2 border-t text-primary',
                      panelBorderClass,
                    )}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{t('serverDialog.addServer')}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Server indicator when collapsed */}
        {isCollapsed && selectedServer && (
          <div className="p-2 flex justify-center">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              selectedServer.status === 'online' ? 'bg-emerald-500/20' : 'bg-red-500/20'
            )}>
              <Server className={cn(
                'w-4 h-4',
                selectedServer.status === 'online' ? 'text-emerald-500' : 'text-red-500'
              )} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              onClick={() => handleNavClick(onDashboardClick)}
              className={cn(
                isCollapsed ? 'w-full justify-center' : 'w-full justify-start gap-2',
                'h-9 text-sm',
                isDashboard
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
              {!isCollapsed && <span>{t('navigation.dashboard')}</span>}
            </Button>
          </div>

          <Separator className="my-2" />

          {/* Status Section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-2">
                {t('navigation.status')}
              </p>
            )}

            {/* All */}
            <Button
              variant="ghost"
              onClick={() => handleNavClick(() => onFilterChange('all'))}
              className={cn(
                isCollapsed ? 'w-full justify-center' : 'w-full justify-between',
                'h-9 text-sm',
                activeFilter === 'all'
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <div className={cn('flex items-center', isCollapsed ? '' : 'gap-2')}>
                <List className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                {!isCollapsed && <span>{t('status.all')}</span>}
              </div>
              {!isCollapsed && (
                <Badge variant="secondary" className="h-5 px-1.5 text-xs flex-shrink-0">
                  {getCount('all')}
                </Badge>
              )}
            </Button>

            {/* Status Filters */}
            {statuses.map((status) => {
              const Icon = statusIcons[status];
              const count = getCount(status);

              return (
                <Button
                  key={status}
                  variant="ghost"
                  onClick={() => handleNavClick(() => onFilterChange(status))}
                  className={cn(
                    isCollapsed ? 'w-full justify-center' : 'w-full justify-between',
                    'h-9 text-sm',
                    activeFilter === status
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  )}
                >
                  <div className={cn('flex items-center', isCollapsed ? '' : 'gap-2')}>
                    <Icon className={cn('w-4 h-4 flex-shrink-0', statusColors[status])} />
                    {!isCollapsed && <span>{t(`status.${status}`)}</span>}
                  </div>
                  {!isCollapsed && (
                    <Badge variant="secondary" className="h-5 px-1.5 text-xs flex-shrink-0">
                      {count}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className={cn('p-3 border-t', sidebarBorderClass)}>
          {!isCollapsed ? (
            <p className="text-xs text-muted-foreground text-center">
              {selectedServer ? `v${selectedServer.version}` : t('server.connecting')}
            </p>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapsedChange?.(false)}
              className="w-full h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </aside>

      {/* Server Dialog */}
      <ServerDialog
        open={serverDialogOpen}
        onOpenChange={setServerDialogOpen}
        server={editingServer}
        onSave={handleSaveServer}
        onDelete={handleDeleteServer}
      />
    </>
  );
}

// Mobile Sidebar (Sheet)
export function MobileSidebar({ 
  isOpen, 
  onOpenChange, 
  ...props 
}: SidebarProps) {
  const { backgroundImage } = useBackground();
  const sidebarBorderClass = backgroundImage ? 'border-white/10' : 'border-sidebar-border';

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className={cn(
          'p-0 w-56',
          sidebarBorderClass,
          backgroundImage
            ? 'bg-sidebar/70 backdrop-blur-xl supports-[backdrop-filter]:bg-sidebar/55'
            : 'bg-sidebar',
        )}
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <SidebarContent
          {...props}
          onOpenChange={onOpenChange}
        />
      </SheetContent>
    </Sheet>
  );
}

// Desktop Sidebar (with collapse)
export function DesktopSidebar({ 
  isCollapsed, 
  ...props 
}: SidebarProps & {
  isCollapsed: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  return (
    <SidebarContent
      {...props}
      isCollapsed={isCollapsed}
    />
  );
}

// Main Sidebar export with responsive behavior
export function Sidebar({
  servers,
  torrents,
  activeFilter,
  onFilterChange,
  onDashboardClick,
  isDashboard,
  selectedServerId,
  onServerChange,
  isOpen,
  onOpenChange,
  isCollapsed,
  onCollapsedChange,
}: SidebarProps & {
  isCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}) {
  return (
    <SidebarContent
      servers={servers}
      torrents={torrents}
      activeFilter={activeFilter}
      onFilterChange={onFilterChange}
      onDashboardClick={onDashboardClick}
      isDashboard={isDashboard}
      selectedServerId={selectedServerId}
      onServerChange={onServerChange}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isCollapsed={isCollapsed}
      onCollapsedChange={onCollapsedChange}
    />
  );
}
