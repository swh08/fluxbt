'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/contexts/i18n-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowDown,
  ArrowUp,
  Plus,
  Search,
  Menu,
  ChevronDown,
} from 'lucide-react';
import { formatSpeed } from '@/lib/mock-data';
import { SettingsMenu } from '@/components/settings/settings-menu';
import { StatusFilter } from '@/lib/types';
import { AddTorrentDialog } from '@/components/transfers/add-torrent-dialog';
import {
  getSessionUserDisplayName,
  getSessionUserInitial,
  type SessionUserIdentity,
} from '@/lib/auth/session-user';

// Mobile Topbar - Simplified
interface MobileTopbarProps {
  onMenuClick: () => void;
  title: string;
  downloadSpeed: number;
  uploadSpeed: number;
  showAddButton?: boolean;
  currentUser?: SessionUserIdentity;
}

export function MobileTopbar({
  onMenuClick,
  title,
  downloadSpeed,
  uploadSpeed,
  showAddButton = true,
  currentUser,
}: MobileTopbarProps) {
  const { t } = useI18n();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const userInitial = getSessionUserInitial(currentUser ?? {});

  return (
    <>
      <header className="h-12 px-3 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm">
        {/* Left - Menu */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="h-8 w-8"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Center - Speed Stats */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-500">
            <ArrowDown className="w-3 h-3" />
            <span className="text-xs font-medium font-mono">
              {formatSpeed(downloadSpeed)}
            </span>
          </div>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
            <ArrowUp className="w-3 h-3" />
            <span className="text-xs font-medium font-mono">
              {formatSpeed(uploadSpeed)}
            </span>
          </div>
        </div>

        {/* Right - Add & Settings */}
        <div className="flex items-center gap-1">
          {showAddButton && (
            <Button size="sm" className="h-8 w-8 p-0" onClick={() => setAddDialogOpen(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          )}
          <SettingsMenu user={currentUser}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full border border-border/70 bg-background/70 p-0 shadow-xs hover:bg-background/70"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                {userInitial}
              </span>
            </Button>
          </SettingsMenu>
        </div>
      </header>

      {/* Add Torrent Dialog */}
      <AddTorrentDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </>
  );
}

// Desktop/Tablet Topbar
interface TopbarProps {
  // Title
  title: string;
  totalCount?: number;
  
  // Stats
  downloadSpeed?: number;
  uploadSpeed?: number;
  showSpeeds?: boolean;
  
  // Filters (optional - for Transfers view)
  showFilters?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
  selectedTag?: string;
  onTagChange?: (tag: string) => void;
  categories?: { id: string; name: string }[];
  tags?: { id: string; name: string }[];
  
  // Status filter
  activeFilter?: StatusFilter;
  onFilterChange?: (filter: StatusFilter) => void;
  
  // Actions
  showAddButton?: boolean;
  currentUser?: SessionUserIdentity;
}

export function Topbar({
  title,
  totalCount,
  downloadSpeed = 0,
  uploadSpeed = 0,
  showSpeeds = true,
  showFilters = false,
  searchQuery = '',
  onSearchChange,
  selectedCategory = 'all',
  onCategoryChange,
  selectedTag = 'all',
  onTagChange,
  categories = [],
  tags = [],
  activeFilter,
  onFilterChange,
  showAddButton = true,
  currentUser,
}: TopbarProps) {
  const { t } = useI18n();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const userDisplayName = getSessionUserDisplayName(currentUser ?? {});
  const userInitial = getSessionUserInitial(currentUser ?? {});

  return (
    <>
    <header className="h-14 px-4 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm">
      {/* Left Section - Title */}
      <div className="flex items-center gap-3">
        <h2 className="text-base font-semibold text-foreground">
          {title}
        </h2>
        {totalCount !== undefined && (
          <Badge variant="secondary" className="h-5 px-2 text-xs font-normal hidden sm:inline-flex">
            {totalCount} {t('transfers.items')}
          </Badge>
        )}
      </div>

      {/* Center Section - Search & Filters (only for Transfers) */}
      {showFilters && (
        <div className="flex items-center gap-3 flex-1 max-w-2xl mx-4">
          {/* Search - Hidden on tablet */}
          <div className="relative flex-1 max-w-xs hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('transfers.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="h-8 pl-8 text-sm bg-background border-border"
            />
          </div>

          {/* Category Select - Hidden on small tablet */}
          <Select value={selectedCategory} onValueChange={(v) => onCategoryChange?.(v)}>
            <SelectTrigger className="h-8 w-28 lg:w-32 text-sm bg-background border-border hidden sm:flex">
              <SelectValue placeholder={t('transfers.category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('transfers.allCategories')}</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Tags Select - Hidden on tablet */}
          <Select value={selectedTag} onValueChange={(v) => onTagChange?.(v)}>
            <SelectTrigger className="h-8 w-24 lg:w-28 text-sm bg-background border-border hidden lg:flex">
              <SelectValue placeholder={t('transfers.tags')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('transfers.allTags')}</SelectItem>
              {tags.map((tag) => (
                <SelectItem key={tag.id} value={tag.id}>
                  {tag.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Right Section - Speed Stats & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Download Speed */}
        {showSpeeds && (
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-md bg-blue-500/10 text-blue-500">
            <ArrowDown className="w-3.5 h-3.5" />
            <span className="text-xs font-medium font-mono hidden sm:inline">
              {formatSpeed(downloadSpeed)}
            </span>
            <span className="text-xs font-medium font-mono sm:hidden">
              {formatSpeed(downloadSpeed).replace('/s', '')}
            </span>
          </div>
        )}

        {/* Upload Speed */}
        {showSpeeds && (
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-500">
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="text-xs font-medium font-mono hidden sm:inline">
              {formatSpeed(uploadSpeed)}
            </span>
            <span className="text-xs font-medium font-mono sm:hidden">
              {formatSpeed(uploadSpeed).replace('/s', '')}
            </span>
          </div>
        )}

        {/* Add Button */}
        {showAddButton && (
          <Button size="sm" className="h-8 gap-1.5 hidden sm:inline-flex" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            <span className="text-sm">{t('transfers.add')}</span>
          </Button>
        )}
        
        {/* Add Button - Mobile */}
        {showAddButton && (
          <Button size="sm" className="h-8 w-8 p-0 sm:hidden" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
          </Button>
        )}

        {/* Settings Menu */}
        <SettingsMenu user={currentUser}>
          <Button
            variant="ghost"
            className={cn(
              'h-9 max-w-[11rem] justify-between rounded-full border border-border/70 bg-background/70 px-2.5 shadow-xs',
              'hover:bg-background/70'
            )}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {userInitial}
              </span>
              <span className="max-w-[6.5rem] truncate text-sm text-foreground lg:max-w-[8.5rem]">
                {userDisplayName}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </SettingsMenu>
      </div>
    </header>

    {/* Add Torrent Dialog */}
    <AddTorrentDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </>
  );
}
