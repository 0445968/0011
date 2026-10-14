
'use client';

import {
  Fragment,
  useRef,
  type ReactNode,
} from 'react';

import Link from 'next/link';

import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Inbox,
  MoreHorizontal,
  Pin,
  Plus,
  RotateCcw,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type {
  WorkspaceBookmark,
  WorkspaceRecordKind,
  WorkspaceTab,
} from './useStaffWorkspaceTabs';

/* =========================================================
   TYPES
   ========================================================= */

interface WorkspaceTabBarProps {
  tabs: WorkspaceTab[];
  bookmarks: WorkspaceBookmark[];
  recentlyClosed: WorkspaceTab[];
  activeKey: string | null;

  openTab: (
    tab: WorkspaceTab | WorkspaceBookmark
  ) => void;

  closeTab: (key: string) => void;
  togglePin: (key: string) => void;
  toggleBookmark: (key: string) => void;

  reopenClosedTab: () => void;
  closeOtherTabs: () => void;
  closeUnpinnedTabs: () => void;
}

/* =========================================================
   RECORD TYPES
   ========================================================= */

const recordIcons: Record<
  WorkspaceRecordKind,
  LucideIcon
> = {
  project: FolderKanban,
  inquiry: Inbox,
  lead: Inbox,
  contact: Users,
};

const recordLabels: Record<
  WorkspaceRecordKind,
  string
> = {
  project: 'Project',
  inquiry: 'Inquiry',
  lead: 'Inquiry',
  contact: 'Contact',
};

/* =========================================================
   RECORD COLOR SYSTEM
   ========================================================= */

/*
 * Yellow — Projects
 * Blue   — Inquiries / Leads
 * Red    — Contacts
 *
 * Active tabs use stronger tinted surfaces.
 * Inactive tabs use subtle transparent tints.
 *
 * Separate dark-mode styling is included.
 */

const recordColors: Record<
  WorkspaceRecordKind,
  {
    active: string;
    inactive: string;
    accent: string;
    icon: string;
  }
> = {
  project: {
    active:
      'bg-yellow-100/85 dark:bg-yellow-950/45 border-yellow-300/70 dark:border-yellow-700/50',
    inactive:
      'bg-yellow-50/45 dark:bg-yellow-950/15 hover:bg-yellow-100/65 dark:hover:bg-yellow-950/35',
    accent:
      'bg-yellow-500 dark:bg-yellow-400',
    icon:
      'text-yellow-600 dark:text-yellow-400',
  },

  inquiry: {
    active:
      'bg-blue-100/85 dark:bg-blue-950/45 border-blue-300/70 dark:border-blue-700/50',
    inactive:
      'bg-blue-50/45 dark:bg-blue-950/15 hover:bg-blue-100/65 dark:hover:bg-blue-950/35',
    accent:
      'bg-blue-500 dark:bg-blue-400',
    icon:
      'text-blue-600 dark:text-blue-400',
  },

  lead: {
    active:
      'bg-blue-100/85 dark:bg-blue-950/45 border-blue-300/70 dark:border-blue-700/50',
    inactive:
      'bg-blue-50/45 dark:bg-blue-950/15 hover:bg-blue-100/65 dark:hover:bg-blue-950/35',
    accent:
      'bg-blue-500 dark:bg-blue-400',
    icon:
      'text-blue-600 dark:text-blue-400',
  },

  contact: {
    active:
      'bg-red-100/85 dark:bg-red-950/45 border-red-300/70 dark:border-red-700/50',
    inactive:
      'bg-red-50/45 dark:bg-red-950/15 hover:bg-red-100/65 dark:hover:bg-red-950/35',
    accent:
      'bg-red-500 dark:bg-red-400',
    icon:
      'text-red-600 dark:text-red-400',
  },
};

function getRecordLabel(
  tab: WorkspaceTab
): string {
  return (
    tab.recordType?.trim() ||
    recordLabels[tab.kind]
  );
}

/* =========================================================
   ACTION BUTTON
   ========================================================= */

function TabAction({
  label,
  selected = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`
        flex
        h-[23px]
        w-[21px]
        shrink-0
        items-center
        justify-center
        rounded-md
        transition-colors
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-ring

        ${
          selected
            ? 'text-foreground'
            : 'text-muted-foreground/65 hover:text-foreground'
        }

        hover:bg-black/5
        dark:hover:bg-white/10
        disabled:cursor-not-allowed
        disabled:opacity-25
      `}
    >
      {children}
    </button>
  );
}

/* =========================================================
   INDIVIDUAL COLORED TAB
   ========================================================= */

function WorkspaceTabItem({
  tab,
  active,
  bookmarked,
  onOpen,
  onClose,
  onPin,
  onBookmark,
}: {
  tab: WorkspaceTab;
  active: boolean;
  bookmarked: boolean;
  onOpen: () => void;
  onClose: () => void;
  onPin: () => void;
  onBookmark: () => void;
}) {
  const Icon = recordIcons[tab.kind];
  const colors = recordColors[tab.kind];
  const typeLabel = getRecordLabel(tab);

  return (
    <div
      className={`
        group
        relative
        flex
        h-[45px]
        min-w-[175px]
        max-w-[270px]
        shrink-0
        items-center
        overflow-hidden
        rounded-t-lg
        border
        border-b-0
        px-1.5
        transition-colors
        duration-150

        ${
          active
            ? `
              ${colors.active}
              text-foreground
            `
            : `
              border-transparent
              ${colors.inactive}
              text-muted-foreground
              hover:text-foreground
            `
        }
      `}
    >
      {/* COLOR ACCENT */}

      <span
        aria-hidden="true"
        className={`
          absolute
          inset-x-0
          top-0
          h-[3px]
          ${colors.accent}
          ${
            active
              ? 'opacity-100'
              : 'opacity-45 group-hover:opacity-80'
          }
          transition-opacity
        `}
      />

      {/* RECORD NAME AND TYPE */}

      <button
        type="button"
        onClick={onOpen}
        aria-current={
          active ? 'page' : undefined
        }
        title={`${tab.title} · ${typeLabel}`}
        className="
          flex
          h-full
          min-w-0
          flex-1
          items-center
          gap-2
          rounded-md
          px-1.5
          text-left
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-ring
        "
      >
        <Icon
          size={15}
          strokeWidth={1.8}
          className={`
            shrink-0
            ${colors.icon}
          `}
          aria-hidden="true"
        />

        <span
          className="
            flex
            min-w-0
            flex-1
            flex-col
            justify-center
            gap-0.5
          "
        >
          <span
            className={`
              block
              max-w-[135px]
              truncate
              text-[11px]
              leading-tight
              tracking-[-0.01em]

              ${
                active
                  ? 'font-bold text-foreground'
                  : 'font-semibold text-foreground/80'
              }
            `}
          >
            {tab.title}
          </span>

          <span
            className="
              block
              max-w-[135px]
              truncate
              text-[10px]
              font-normal
              leading-tight
              text-muted-foreground
            "
          >
            {typeLabel}
          </span>
        </span>
      </button>

      {/* TAB ACTIONS */}

      <div className="flex shrink-0 items-center gap-0">
        <TabAction
          label={
            bookmarked
              ? `Remove bookmark: ${tab.title}`
              : `Bookmark: ${tab.title}`
          }
          selected={bookmarked}
          onClick={onBookmark}
        >
          <Bookmark
            size={12}
            strokeWidth={1.7}
            fill={
              bookmarked
                ? 'currentColor'
                : 'none'
            }
          />
        </TabAction>

        <TabAction
          label={
            tab.pinned
              ? `Unpin: ${tab.title}`
              : `Pin: ${tab.title}`
          }
          selected={tab.pinned}
          onClick={onPin}
        >
          <Pin
            size={12}
            strokeWidth={1.7}
            fill={
              tab.pinned
                ? 'currentColor'
                : 'none'
            }
          />
        </TabAction>

        <TabAction
          label={
            tab.pinned
              ? 'Unpin this tab before closing'
              : `Close: ${tab.title}`
          }
          disabled={tab.pinned}
          onClick={onClose}
        >
          <X
            size={13}
            strokeWidth={1.8}
          />
        </TabAction>
      </div>
    </div>
  );
}

/* =========================================================
   SCROLL BUTTON
   ========================================================= */

function ScrollButton({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  const Icon =
    direction === 'left'
      ? ChevronLeft
      : ChevronRight;

  return (
    <button
      type="button"
      title={`Scroll tabs ${direction}`}
      aria-label={`Scroll tabs ${direction}`}
      onClick={onClick}
      className="
        mb-1.5
        flex
        h-8
        w-7
        shrink-0
        items-center
        justify-center
        rounded-md
        text-muted-foreground
        transition-colors
        hover:bg-muted
        hover:text-foreground
      "
    >
      <Icon size={15} />
    </button>
  );
}

/* =========================================================
   MAIN TAB BAR
   ========================================================= */

export function WorkspaceTabBar({
  tabs,
  bookmarks,
  recentlyClosed,
  activeKey,
  openTab,
  closeTab,
  togglePin,
  toggleBookmark,
  reopenClosedTab,
  closeOtherTabs,
  closeUnpinnedTabs,
}: WorkspaceTabBarProps) {
  const scrollRef =
    useRef<HTMLDivElement>(null);

  const bookmarkedKeys = new Set(
    bookmarks.map(
      (bookmark) => bookmark.key
    )
  );

  const activeTab =
    tabs.find(
      (tab) => tab.key === activeKey
    ) ?? null;

  function scrollTabs(
    direction: -1 | 1
  ) {
    scrollRef.current?.scrollBy({
      left: direction * 260,
      behavior: 'smooth',
    });
  }

  return (
    <div
      className="
        flex
        h-[53px]
        shrink-0
        items-end
        gap-1
        border-b
        border-border/60
        bg-background
        px-2
        pt-2
        sm:px-3
      "
    >
      {/* SCROLL LEFT */}

      {tabs.length > 4 && (
        <ScrollButton
          direction="left"
          onClick={() =>
            scrollTabs(-1)
          }
        />
      )}

      {/* OPEN TABS */}

      <nav
        ref={scrollRef}
        aria-label="Open workspace tabs"
        className="
          flex
          h-full
          min-w-0
          flex-1
          items-end
          overflow-x-auto
          overflow-y-hidden
          scrollbar-hide
        "
      >
        {tabs.length > 0 ? (
          tabs.map((tab, index) => {
            const active =
              tab.key === activeKey;

            const nextTab =
              tabs[index + 1];

            const showDivider =
              !active &&
              Boolean(nextTab) &&
              nextTab.key !== activeKey;

            return (
              <Fragment key={tab.key}>
                <WorkspaceTabItem
                  tab={tab}
                  active={active}
                  bookmarked={
                    bookmarkedKeys.has(
                      tab.key
                    )
                  }
                  onOpen={() =>
                    openTab(tab)
                  }
                  onClose={() =>
                    closeTab(tab.key)
                  }
                  onPin={() =>
                    togglePin(tab.key)
                  }
                  onBookmark={() =>
                    toggleBookmark(
                      tab.key
                    )
                  }
                />

                {nextTab && (
                  <span
                    aria-hidden="true"
                    className={`
                      mx-1
                      mb-[15px]
                      h-[16px]
                      w-px
                      shrink-0

                      ${
                        showDivider
                          ? 'bg-border'
                          : 'bg-transparent'
                      }
                    `}
                  />
                )}
              </Fragment>
            );
          })
        ) : (
          <span className="flex h-full items-center px-3 text-[11px] text-muted-foreground">
            Open a project or inquiry to create a tab.
          </span>
        )}
      </nav>

      {/* SCROLL RIGHT */}

      {tabs.length > 4 && (
        <ScrollButton
          direction="right"
          onClick={() =>
            scrollTabs(1)
          }
        />
      )}

      {/* OPEN RECORD */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Open a workspace record"
            aria-label="Open a workspace record"
            className="
              mb-1.5
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-md
              text-muted-foreground
              transition-colors
              hover:bg-muted
              hover:text-foreground
            "
          >
            <Plus size={17} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="
            bivi-staff-surface
            w-64
            rounded-xl
            border-border/60
            bg-popover
            p-1.5
            text-popover-foreground
            shadow-lg
          "
        >
          <DropdownMenuLabel className="px-2.5 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Open workspace
          </DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <Link
              href="/projects"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs"
            >
              <FolderKanban size={15} />
              Browse projects
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link
              href="/inquiries"
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs"
            >
              <Inbox size={15} />
              Browse inquiries
            </Link>
          </DropdownMenuItem>

          {bookmarks.length > 0 && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuLabel className="px-2.5 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Bookmarked records
              </DropdownMenuLabel>

              {bookmarks
                .slice(0, 10)
                .map((bookmark) => {
                  const Icon =
                    recordIcons[
                      bookmark.kind
                    ];

                  const colors =
                    recordColors[
                      bookmark.kind
                    ];

                  return (
                    <DropdownMenuItem
                      key={bookmark.key}
                      onSelect={() =>
                        openTab(bookmark)
                      }
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs"
                    >
                      <Icon
                        size={15}
                        className={`
                          shrink-0
                          ${colors.icon}
                        `}
                      />

                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="truncate font-medium">
                          {bookmark.title}
                        </span>

                        <span className="truncate text-[10px] text-muted-foreground">
                          {bookmark.recordType ||
                            recordLabels[
                              bookmark.kind
                            ]}
                        </span>
                      </span>
                    </DropdownMenuItem>
                  );
                })}
            </>
          )}

          {recentlyClosed.length > 0 && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={reopenClosedTab}
                className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-xs"
              >
                <RotateCcw size={15} />
                Reopen closed tab
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* TAB MANAGEMENT */}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            title="Tab management"
            aria-label="Tab management"
            className="
              mb-1.5
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-md
              text-muted-foreground
              transition-colors
              hover:bg-muted
              hover:text-foreground
            "
          >
            <MoreHorizontal size={17} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="
            bivi-staff-surface
            w-56
            rounded-xl
            border-border/60
            bg-popover
            p-1.5
            text-popover-foreground
            shadow-lg
          "
        >
          <DropdownMenuLabel className="px-2.5 py-2 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Window management
          </DropdownMenuLabel>

          <DropdownMenuItem
            disabled={!activeTab}
            onSelect={() => {
              if (activeKey) {
                togglePin(activeKey);
              }
            }}
            className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs"
          >
            <Pin size={14} />

            {activeTab?.pinned
              ? 'Unpin current tab'
              : 'Pin current tab'}
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={!activeTab}
            onSelect={() => {
              if (activeKey) {
                toggleBookmark(activeKey);
              }
            }}
            className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs"
          >
            <Bookmark size={14} />

            {activeKey &&
            bookmarkedKeys.has(
              activeKey
            )
              ? 'Remove bookmark'
              : 'Bookmark current tab'}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={tabs.length < 2}
            onSelect={closeOtherTabs}
            className="cursor-pointer rounded-lg px-3 py-2 text-xs"
          >
            Close other tabs
          </DropdownMenuItem>

          <DropdownMenuItem
            disabled={tabs.length < 2}
            onSelect={closeUnpinnedTabs}
            className="cursor-pointer rounded-lg px-3 py-2 text-xs"
          >
            Close unpinned tabs
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            disabled={
              recentlyClosed.length === 0
            }
            onSelect={reopenClosedTab}
            className="cursor-pointer gap-2 rounded-lg px-3 py-2 text-xs"
          >
            <RotateCcw size={14} />
            Reopen closed tab
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
