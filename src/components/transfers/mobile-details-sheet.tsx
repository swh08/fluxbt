'use client';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { DetailsPanel } from '@/components/transfers/details-panel';
import { Torrent } from '@/lib/types';

interface MobileDetailsSheetProps {
  torrent: Torrent | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDetailsSheet({ torrent, isOpen, onOpenChange }: MobileDetailsSheetProps) {
  if (!torrent) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] gap-0 overflow-hidden rounded-t-xl border-0 bg-transparent p-0 shadow-none"
      >
        <SheetTitle className="sr-only">{torrent.name}</SheetTitle>
        <div className="min-h-0 flex-1 overflow-hidden">
          <DetailsPanel torrent={torrent} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
