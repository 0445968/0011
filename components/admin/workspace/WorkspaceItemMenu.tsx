'use client';
import type { ReactNode } from 'react';
import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from '@/components/ui/context-menu';

/** Radix supports native right-click, keyboard context menus and touch long press. */
export function WorkspaceItemMenu({ children, href, pinned, bookmarked, onOpen, onPin, onBookmark, onClose }: {
  children: ReactNode; href: string; pinned?: boolean; bookmarked?: boolean;
  onOpen?: () => void; onPin?: () => void; onBookmark?: () => void; onClose?: () => void;
}) {
  return <ContextMenu>
    <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
    <ContextMenuContent className="bivi-staff-surface min-w-[210px]">
      {onOpen && <ContextMenuItem onSelect={onOpen}>Open</ContextMenuItem>}
      <ContextMenuItem onSelect={() => window.open(href, '_blank', 'noopener,noreferrer')}>Open in new tab</ContextMenuItem>
      <ContextMenuItem onSelect={() => { void navigator.clipboard?.writeText(new URL(href, window.location.origin).href).catch(() => {}); }}>Copy link</ContextMenuItem>
      {(onPin || onBookmark) && <ContextMenuSeparator />}
      {onPin && <ContextMenuItem onSelect={onPin}>{pinned ? 'Unpin tab' : 'Pin tab'}</ContextMenuItem>}
      {onBookmark && <ContextMenuItem onSelect={onBookmark}>{bookmarked ? 'Remove bookmark' : 'Bookmark record'}</ContextMenuItem>}
      {onClose && <><ContextMenuSeparator /><ContextMenuItem disabled={pinned} onSelect={onClose}>{pinned ? 'Unpin before closing' : 'Close tab'}</ContextMenuItem></>}
    </ContextMenuContent>
  </ContextMenu>;
}
