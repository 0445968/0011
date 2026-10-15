
'use client';
import { guardWorkspaceNavigation } from './WorkspaceNavigationGuard';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  getWorkspaceRecordHref,
  normalizeStaffPath,
  type WorkspaceBookmark,
  type WorkspaceTab,
} from './useStaffWorkspaceTabs';

/* =========================================================
   TYPES
   ========================================================= */

export interface WorkspaceMenuResource {
  id: string;
  title: string;
  href?: string;
  updatedAt?: string;
  recordKey?: string;
}

export type WorkspaceMenuCommand =
  | 'new-project'
  | 'new-inquiry'
  | 'new-contact'
  | 'new-task'
  | 'new-milestone'
  | 'new-document'
  | 'upload-file'
  | 'export-record'
  | 'save-record'
  | 'edit-details'
  | 'find-in-record'
  | 'new-discussion'
  | 'new-proposal'
  | 'new-template'
  | 'new-form'
  | 'manage-templates'
  | 'manage-forms'
  | 'manage-bookmarks'
  | 'split-view';

export type WorkspaceEditCommand =
  | 'undo'
  | 'redo'
  | 'cut'
  | 'copy'
  | 'paste'
  | 'select-all';

export type WorkspaceResourceType =
  | 'file'
  | 'template'
  | 'form';

export type WorkspaceDensity =
  | 'comfortable'
  | 'compact';

interface WorkspaceMenuBarProps {
  activeTab: WorkspaceTab | null;

  tabs: WorkspaceTab[];
  bookmarks: WorkspaceBookmark[];
  recentlyClosed: WorkspaceTab[];

  openTab: (
    tab: WorkspaceTab | WorkspaceBookmark
  ) => void;

  closeTab: (key: string) => void;
  togglePin: (key: string) => void;
  toggleBookmark: (key: string) => void;

  reopenClosedTab: () => void;
  closeOtherTabs: () => void;
  closeUnpinnedTabs: () => void;

  recentFiles?: WorkspaceMenuResource[];
  relatedRecords?: (
    | WorkspaceTab
    | WorkspaceBookmark
  )[];
  templates?: WorkspaceMenuResource[];
  forms?: WorkspaceMenuResource[];

  onAction?: (
    command: WorkspaceMenuCommand,
    tab: WorkspaceTab | null
  ) => void;

  onEditAction?: (
    command: WorkspaceEditCommand
  ) => void;

  onResourceOpen?: (
    type: WorkspaceResourceType,
    resource: WorkspaceMenuResource
  ) => void;

  density?: WorkspaceDensity;

  onDensityChange?: (
    density: WorkspaceDensity
  ) => void;

  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

/* =========================================================
   CONFIGURATION
   ========================================================= */

const MENU_LABELS = [
  'File',
  'Edit',
  'View',
  'Window',
  'Onboarding',
  'Bookmarks',
  'Discussion',
  'Publishing',
  'Client access',
] as const;

type MenuName =
  (typeof MENU_LABELS)[number];

const PROJECT_SECTIONS = [
  { label: 'Overview', value: 'overview' },
  { label: 'Tasks & Milestones', value: 'plan' },
  { label: 'Lifecycle', value: 'lifecycle' },
  { label: 'Brief', value: 'brief' },
  { label: 'Delivery', value: 'delivery' },
] as const;

const MAX_RECENT_FILES = 10;

const itemClass = `
  flex
  min-h-8
  cursor-pointer
  items-center
  gap-3
  rounded-md
  px-2.5
  py-2
  text-[11px]
  font-medium
  outline-none
  focus:bg-muted
  focus:text-foreground
  data-[disabled]:cursor-not-allowed
  data-[disabled]:opacity-40
`;

const contentClass = `
  bivi-staff-surface
  z-[100]
  max-h-[min(75vh,560px)]
  w-60
  overflow-y-auto
  rounded-xl
  border
  border-border/60
  bg-popover
  p-1.5
  text-popover-foreground
  shadow-xl
  scrollbar-transparent
  sm:w-64
`;

const subContentClass = `
  bivi-staff-surface
  z-[110]
  max-h-[min(75vh,520px)]
  w-60
  overflow-y-auto
  rounded-xl
  border
  border-border/60
  bg-popover
  p-1.5
  text-popover-foreground
  shadow-xl
  scrollbar-transparent
  sm:w-72
`;

/* =========================================================
   MENU PRIMITIVES
   ========================================================= */

function MenuItem({
  children,
  onSelect,
  disabled = false,
  shortcut,
}: {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  shortcut?: string;
}) {
  return (
    <DropdownMenuItem
      disabled={disabled}
      onSelect={onSelect}
      className={itemClass}
    >
      <span className="min-w-0 flex-1 truncate">
        {children}
      </span>

      {shortcut && (
        <kbd className="shrink-0 font-mono text-[10px] font-normal text-muted-foreground">
          {shortcut}
        </kbd>
      )}
    </DropdownMenuItem>
  );
}

function MenuSubmenu({
  label,
  children,
  disabled = false,
}: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        disabled={disabled}
        className={itemClass}
      >
        <span className="truncate">
          {label}
        </span>
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent
        sideOffset={4}
        className={subContentClass}
      >
        {children}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

function MenuHeading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <DropdownMenuLabel className="px-2.5 pb-1 pt-2 font-mono text-[9px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
      {children}
    </DropdownMenuLabel>
  );
}

function MenuDivider() {
  return (
    <DropdownMenuSeparator className="my-1.5 bg-border/60" />
  );
}

function EmptyMenuItem({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <MenuItem disabled>
      {children}
    </MenuItem>
  );
}

/* =========================================================
   RESOURCE HELPERS
   ========================================================= */

function safeWorkspaceHref(
  href: string | undefined
): string | null {
  if (!href) {
    return null;
  }

  if (
    !href.startsWith('/') ||
    href.startsWith('//') ||
    href.includes('\\')
  ) {
    return null;
  }

  const clean = normalizeStaffPath(href);

  if (
    clean === '/' ||
    clean.startsWith('/projects/') ||
    clean === '/projects' ||
    clean.startsWith('/leads/') ||
    clean === '/inquiries' ||
    clean.startsWith('/inquiries/')
  ) {
    return clean;
  }

  return null;
}

function sortRecentFiles(
  files: WorkspaceMenuResource[]
) {
  return [...files].sort((a, b) => {
    const aTime = a.updatedAt
      ? Date.parse(a.updatedAt)
      : 0;

    const bTime = b.updatedAt
      ? Date.parse(b.updatedAt)
      : 0;

    return (
      (Number.isFinite(bTime) ? bTime : 0) -
      (Number.isFinite(aTime) ? aTime : 0)
    );
  });
}

/* =========================================================
   WORKSPACE MENU BAR
   ========================================================= */

export function WorkspaceMenuBar({
  activeTab,
  tabs,
  bookmarks,
  recentlyClosed,
  openTab,
  closeTab,
  togglePin,
  toggleBookmark,
  reopenClosedTab,
  closeOtherTabs,
  closeUnpinnedTabs,
  recentFiles,
  relatedRecords = [],
  templates,
  forms,
  onAction,
  onEditAction,
  onResourceOpen,
  density = 'comfortable',
  onDensityChange,
  sidebarCollapsed = false,
  onToggleSidebar,
}: WorkspaceMenuBarProps) {
  const router = useRouter();

  /* =======================================================
     DESKTOP MENU STATE
     ======================================================= */

  const [openMenu, setOpenMenu] =
    useState<MenuName | null>(null);

  /*
   * Tracks pointer-based transitions between
   * top-level menus.
   *
   * Prevents the old menu from stealing focus
   * when the cursor opens a different menu.
   */

  const switchingMenuRef = useRef(false);

  function switchMenuOnHover(
    label: MenuName,
    pointerType: string
  ) {
    /*
     * A menu must already be open.
     *
     * Hover alone does not open the first
     * menu; the user clicks once to begin.
     */

    if (
      openMenu === null ||
      openMenu === label ||
      pointerType === 'touch'
    ) {
      return;
    }

    switchingMenuRef.current = true;

    setOpenMenu(label);
  }

  function handleMenuOpenChange(
    label: MenuName,
    open: boolean
  ) {
    setOpenMenu((current) => {
      if (open) {
        return label;
      }

      /*
       * Ignore a close event from a menu
       * that is no longer active.
       *
       * This prevents hover switching from
       * accidentally closing the new menu.
       */

      return current === label
        ? null
        : current;
    });
  }

  function handleMenuCloseAutoFocus(
    event: Event
  ) {
    if (switchingMenuRef.current) {
      event.preventDefault();
      switchingMenuRef.current = false;
    }
  }

  /* =======================================================
     ADDITIONAL STATE
     ======================================================= */

  const [fullscreen, setFullscreen] =
    useState(false);

  const [message, setMessage] =
    useState('');

  const isProject =
    activeTab?.kind === 'project';

  const isInquiry =
    activeTab?.kind === 'inquiry' ||
    activeTab?.kind === 'lead';

  const activeKey =
    activeTab?.key ?? null;

  const base = activeTab
    ? getWorkspaceRecordHref(
        activeTab.kind,
        activeTab.id
      )
    : null;

  const projectBase =
    isProject ? base : null;

  const inquiryBase =
    isInquiry ? base : null;

  const isBookmarked =
    activeKey !== null &&
    bookmarks.some(
      (bookmark) =>
        bookmark.key === activeKey
    );

  /* =======================================================
     FULLSCREEN STATE
     ======================================================= */

  useEffect(() => {
    function updateFullscreen() {
      setFullscreen(
        Boolean(document.fullscreenElement)
      );
    }

    document.addEventListener(
      'fullscreenchange',
      updateFullscreen
    );

    updateFullscreen();

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        updateFullscreen
      );
    };
  }, []);

  /* =======================================================
     RECORD-SCOPED FILES
     ======================================================= */

  const latestFiles = useMemo(() => {
    if (
      !activeKey ||
      recentFiles === undefined
    ) {
      return null;
    }

    return sortRecentFiles(
      recentFiles.filter(
        (file) =>
          file.recordKey === activeKey
      )
    ).slice(0, MAX_RECENT_FILES);
  }, [activeKey, recentFiles]);

  /* =======================================================
     COMMON ACTIONS
     ======================================================= */

  function navigate(href: string) {
    guardWorkspaceNavigation(() => router.push(href));
  }

  function execute(
    command: WorkspaceMenuCommand
  ) {
    onAction?.(command, activeTab);
  }

  function commandItem(
    label: string,
    command: WorkspaceMenuCommand,
    shortcut?: string
  ) {
    return (
      <MenuItem
        disabled={!onAction}
        shortcut={shortcut}
        onSelect={() =>
          execute(command)
        }
      >
        {label}
      </MenuItem>
    );
  }

  function routeItem(
    label: string,
    href: string | null,
    shortcut?: string
  ) {
    return (
      <MenuItem
        disabled={!href}
        shortcut={shortcut}
        onSelect={() => {
          if (href) {
            navigate(href);
          }
        }}
      >
        {label}
      </MenuItem>
    );
  }

  function editItem(
    label: string,
    command: WorkspaceEditCommand,
    shortcut?: string
  ) {
    return (
      <MenuItem
        disabled={!onEditAction}
        shortcut={shortcut}
        onSelect={() =>
          onEditAction?.(command)
        }
      >
        {label}
      </MenuItem>
    );
  }

  function resourceItem(
    type: WorkspaceResourceType,
    resource: WorkspaceMenuResource
  ) {
    const href = safeWorkspaceHref(
      resource.href
    );

    return (
      <MenuItem
        key={`${type}:${resource.id}`}
        disabled={
          !href && !onResourceOpen
        }
        onSelect={() => {
          if (href) {
            navigate(href);
          } else {
            onResourceOpen?.(
              type,
              resource
            );
          }
        }}
      >
        {resource.title}
      </MenuItem>
    );
  }

  function resourceSubmenu(
    title: string,
    type: WorkspaceResourceType,
    resources:
      | WorkspaceMenuResource[]
      | undefined
  ) {
    return (
      <MenuSubmenu
        label={title}
        disabled={!activeTab}
      >
        {resources === undefined ? (
          <EmptyMenuItem>
            Not connected yet
          </EmptyMenuItem>
        ) : resources.length === 0 ? (
          <EmptyMenuItem>
            No items available
          </EmptyMenuItem>
        ) : (
          resources.map((resource) =>
            resourceItem(
              type,
              resource
            )
          )
        )}

        <MenuDivider />

        {type === 'template'
          ? commandItem(
              'Manage templates…',
              'manage-templates'
            )
          : type === 'form'
            ? commandItem(
                'Manage forms…',
                'manage-forms'
              )
            : routeItem(
                'View all linked files',
                projectBase
                  ? `${projectBase}/files`
                  : inquiryBase
                    ? `${inquiryBase}/onboarding`
                    : null
              )}
      </MenuSubmenu>
    );
  }

  function sectionItem(
    label: string,
    section: string
  ) {
    return routeItem(
      label,
      projectBase
        ? `${projectBase}?tab=${section}`
        : null
    );
  }

  function openOtherTab(
    offset: number
  ) {
    if (!activeKey || tabs.length < 2) {
      return;
    }

    const index = tabs.findIndex(
      (tab) =>
        tab.key === activeKey
    );

    if (index < 0) {
      return;
    }

    const nextIndex =
      (index + offset + tabs.length) %
      tabs.length;

    openTab(tabs[nextIndex]);
  }

  async function shareCurrentRecord() {
    if (!activeTab) {
      return;
    }

    const url = new URL(
      activeTab.href,
      window.location.origin
    ).href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: activeTab.title,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(
        url
      );

      setMessage(
        'Record link copied.'
      );
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'AbortError'
      ) {
        return;
      }

      setMessage(
        'Could not share this record.'
      );
    }
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement
          .requestFullscreen();
      }
    } catch {
      setMessage(
        'Full screen is unavailable in this browser.'
      );
    }
  }

  function searchWeb() {
    const selected =
      window.getSelection()
        ?.toString()
        .trim() ?? '';

    const url = selected
      ? `https://www.google.com/search?q=${encodeURIComponent(selected)}`
      : 'https://www.google.com/';

    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  }

  /* =======================================================
     FILE MENU
     ======================================================= */

  const fileMenu = (
    <>
      <MenuHeading>
        Workspace
      </MenuHeading>

      <MenuSubmenu label="New">
        {commandItem(
          'New project',
          'new-project'
        )}

        {commandItem(
          'New inquiry',
          'new-inquiry'
        )}

        {commandItem(
          'New contact',
          'new-contact'
        )}

        <MenuDivider />

        {isProject && (
          <>
            {commandItem(
              'New task',
              'new-task'
            )}

            {commandItem(
              'New milestone',
              'new-milestone'
            )}
          </>
        )}

        {commandItem(
          'New document',
          'new-document'
        )}
      </MenuSubmenu>

      <MenuSubmenu
        label="Open related"
        disabled={!activeTab}
      >
        {isProject &&
          routeItem(
            'Original inquiry',
            `/leads/${activeTab!.id}`
          )}

        {relatedRecords.length === 0 &&
          !isProject && (
            <EmptyMenuItem>
              No related records connected
            </EmptyMenuItem>
          )}

        {relatedRecords.map(
          (record) => (
            <MenuItem
              key={record.key}
              onSelect={() =>
                openTab(record)
              }
            >
              {record.title}
            </MenuItem>
          )
        )}
      </MenuSubmenu>

      <MenuSubmenu
        label="Recent files"
        disabled={!activeTab}
      >
        <MenuHeading>
          Latest 10 files
        </MenuHeading>

        {latestFiles === null ? (
          <EmptyMenuItem>
            Recent files not connected
          </EmptyMenuItem>
        ) : latestFiles.length === 0 ? (
          <EmptyMenuItem>
            No recent files
          </EmptyMenuItem>
        ) : (
          latestFiles.map(
            (file) =>
              resourceItem(
                'file',
                file
              )
          )
        )}

        <MenuDivider />

        {routeItem(
          'View all linked files',
          projectBase
            ? `${projectBase}/files`
            : inquiryBase
              ? `${inquiryBase}/onboarding`
              : null
        )}
      </MenuSubmenu>

      {resourceSubmenu(
        'Templates',
        'template',
        templates
      )}

      {resourceSubmenu(
        'Forms',
        'form',
        forms
      )}

      <MenuDivider />

      {commandItem(
        'Upload / import file…',
        'upload-file'
      )}

      {commandItem(
        'Export record…',
        'export-record'
      )}

      <MenuItem
        disabled={!activeTab}
        onSelect={() => {
          void shareCurrentRecord();
        }}
      >
        Share…
      </MenuItem>

      <MenuItem
        onSelect={() =>
          window.print()
        }
        shortcut="⌘ P"
      >
        Print current view…
      </MenuItem>

      <MenuDivider />

      <MenuItem
        disabled={
          !activeTab ||
          activeTab.pinned
        }
        shortcut="⌘ W"
        onSelect={() => {
          if (activeKey) {
            closeTab(activeKey);
          }
        }}
      >
        Close tab
      </MenuItem>
    </>
  );

  /* =======================================================
     EDIT MENU
     ======================================================= */

  const editMenu = (
    <>
      {editItem(
        'Undo',
        'undo',
        '⌘ Z'
      )}

      {editItem(
        'Redo',
        'redo',
        '⇧ ⌘ Z'
      )}

      <MenuDivider />

      {editItem(
        'Cut',
        'cut',
        '⌘ X'
      )}

      {editItem(
        'Copy',
        'copy',
        '⌘ C'
      )}

      {editItem(
        'Paste',
        'paste',
        '⌘ V'
      )}

      {editItem(
        'Select all',
        'select-all',
        '⌘ A'
      )}

      <MenuDivider />

      {commandItem(
        'Find in record…',
        'find-in-record',
        '⌘ F'
      )}

      <MenuItem onSelect={searchWeb}>
        Search the web…
      </MenuItem>

      <MenuDivider />

      {commandItem(
        'Edit record details…',
        'edit-details'
      )}

      {commandItem(
        'Save changes',
        'save-record',
        '⌘ S'
      )}
    </>
  );

  /* =======================================================
     VIEW MENU
     ======================================================= */

  const viewMenu = (
    <>
      <MenuHeading>
        Appearance
      </MenuHeading>

      <MenuItem
        disabled={!onDensityChange}
        onSelect={() =>
          onDensityChange?.(
            'comfortable'
          )
        }
      >
        {density === 'comfortable'
          ? '✓ Comfortable density'
          : 'Comfortable density'}
      </MenuItem>

      <MenuItem
        disabled={!onDensityChange}
        onSelect={() =>
          onDensityChange?.(
            'compact'
          )
        }
      >
        {density === 'compact'
          ? '✓ Compact density'
          : 'Compact density'}
      </MenuItem>

      <MenuDivider />

      <MenuItem
        disabled={!onToggleSidebar}
        onSelect={onToggleSidebar}
      >
        {sidebarCollapsed
          ? 'Show sidebar'
          : 'Hide sidebar'}
      </MenuItem>

      <MenuItem
        onSelect={() => {
          void toggleFullscreen();
        }}
      >
        {fullscreen
          ? 'Exit full screen'
          : 'Full screen'}
      </MenuItem>

      <MenuDivider />

      <MenuSubmenu
        label="Record sections"
        disabled={!activeTab}
      >
        {isProject ? (
          PROJECT_SECTIONS.map(
            (section) => (
              <MenuItem
                key={section.value}
                onSelect={() =>
                  navigate(
                    `${projectBase}?tab=${section.value}`
                  )
                }
              >
                {section.label}
              </MenuItem>
            )
          )
        ) : isInquiry ? (
          <>
            {routeItem(
              'Overview',
              inquiryBase
            )}

            {routeItem(
              'Proposals',
              `${inquiryBase}/proposals`
            )}

            {routeItem(
              'Readiness',
              `${inquiryBase}/readiness`
            )}

            {routeItem(
              'Onboarding',
              `${inquiryBase}/onboarding`
            )}

            {routeItem(
              'Client access',
              `${inquiryBase}/access`
            )}
          </>
        ) : (
          <EmptyMenuItem>
            No record sections available
          </EmptyMenuItem>
        )}
      </MenuSubmenu>

      {projectBase && (
        <MenuSubmenu label="Project workspaces">
          {routeItem(
            'Files',
            `${projectBase}/files`
          )}

          {routeItem(
            'Discussion',
            `${projectBase}/discussion`
          )}

          {routeItem(
            'Publishing',
            `${projectBase}/publish`
          )}

          {routeItem(
            'Client access',
            `${projectBase}/access`
          )}
        </MenuSubmenu>
      )}

      <MenuDivider />

      {commandItem(
        'Split view…',
        'split-view'
      )}
    </>
  );

  /* =======================================================
     WINDOW MENU
     ======================================================= */

  const windowMenu = (
    <>
      <MenuSubmenu
        label={`Open tabs (${tabs.length})`}
        disabled={tabs.length === 0}
      >
        {tabs.map((tab) => (
          <MenuItem
            key={tab.key}
            onSelect={() =>
              openTab(tab)
            }
          >
            {tab.key === activeKey
              ? '✓ '
              : ''}

            {tab.pinned
              ? '⌁ '
              : ''}

            {tab.title}
          </MenuItem>
        ))}
      </MenuSubmenu>

      <MenuItem
        disabled={tabs.length < 2}
        onSelect={() =>
          openOtherTab(1)
        }
      >
        Next tab
      </MenuItem>

      <MenuItem
        disabled={tabs.length < 2}
        onSelect={() =>
          openOtherTab(-1)
        }
      >
        Previous tab
      </MenuItem>

      <MenuItem
        disabled={
          recentlyClosed.length === 0
        }
        onSelect={reopenClosedTab}
      >
        Reopen closed tab
      </MenuItem>

      <MenuDivider />

      <MenuItem
        disabled={!activeKey}
        onSelect={() => {
          if (activeKey) {
            togglePin(activeKey);
          }
        }}
      >
        {activeTab?.pinned
          ? 'Unpin current tab'
          : 'Pin current tab'}
      </MenuItem>

      <MenuItem
        disabled={
          !activeTab ||
          activeTab.pinned
        }
        onSelect={() => {
          if (activeKey) {
            closeTab(activeKey);
          }
        }}
      >
        Close current tab
      </MenuItem>

      <MenuItem
        disabled={tabs.length < 2}
        onSelect={closeOtherTabs}
      >
        Close other tabs
      </MenuItem>

      <MenuItem
        disabled={tabs.length < 2}
        onSelect={closeUnpinnedTabs}
      >
        Close unpinned tabs
      </MenuItem>

      <MenuDivider />

      <MenuItem
        disabled={!activeTab}
        onSelect={() => {
          if (!activeTab) {
            return;
          }

          const href =
            getWorkspaceRecordHref(
              activeTab.kind,
              activeTab.id
            );

          window.open(
            href,
            '_blank',
            'noopener,noreferrer'
          );
        }}
      >
        Open record in new window
      </MenuItem>

      {commandItem(
        'Split view…',
        'split-view'
      )}
    </>
  );

  /* =======================================================
     ONBOARDING MENU
     ======================================================= */

  const onboardingMenu = (
    <>
      <MenuHeading>
        {isProject
          ? 'Project onboarding'
          : isInquiry
            ? 'Inquiry onboarding'
            : 'Onboarding'}
      </MenuHeading>

      {routeItem(
        'Onboarding overview',
        isInquiry
          ? `${inquiryBase}/onboarding`
          : isProject
            ? `/leads/${activeTab!.id}/onboarding`
            : null
      )}

      {routeItem(
        'Readiness checklist',
        isInquiry
          ? `${inquiryBase}/readiness`
          : isProject
            ? `/leads/${activeTab!.id}/readiness`
            : null
      )}

      {routeItem(
        'Proposal and accepted scope',
        isInquiry
          ? `${inquiryBase}/proposals`
          : isProject
            ? `/leads/${activeTab!.id}/proposals`
            : null
      )}

      <MenuDivider />

      {resourceSubmenu(
        'Onboarding forms',
        'form',
        forms
      )}

      {resourceSubmenu(
        'Onboarding templates',
        'template',
        templates
      )}

      <MenuDivider />

      {routeItem(
        'Client invitations and access',
        projectBase
          ? `${projectBase}/access`
          : inquiryBase
            ? `${inquiryBase}/access`
            : null
      )}

      {routeItem(
        'Project files and documents',
        projectBase
          ? `${projectBase}/files`
          : inquiryBase
            ? `${inquiryBase}/onboarding`
            : null
      )}

      {isProject &&
        sectionItem(
          'Project lifecycle',
          'lifecycle'
        )}
    </>
  );

  /* =======================================================
     BOOKMARKS MENU
     ======================================================= */

  const bookmarksMenu = (
    <>
      <MenuItem
        disabled={!activeKey}
        shortcut="⌘ D"
        onSelect={() => {
          if (activeKey) {
            toggleBookmark(activeKey);
          }
        }}
      >
        {isBookmarked
          ? 'Remove current bookmark'
          : 'Bookmark current record'}
      </MenuItem>

      <MenuDivider />

      <MenuHeading>
        Saved records
      </MenuHeading>

      {bookmarks.length === 0 ? (
        <EmptyMenuItem>
          No bookmarks yet
        </EmptyMenuItem>
      ) : (
        bookmarks.map(
          (bookmark) => (
            <MenuItem
              key={bookmark.key}
              onSelect={() =>
                openTab(bookmark)
              }
            >
              {bookmark.title}
            </MenuItem>
          )
        )
      )}

      <MenuDivider />

      {commandItem(
        'Manage bookmarks…',
        'manage-bookmarks'
      )}
    </>
  );

  /* =======================================================
     DISCUSSION MENU
     ======================================================= */

  const discussionMenu = (
    <>
      <MenuHeading>
        Communication
      </MenuHeading>

      {routeItem(
        isProject
          ? 'Project discussion'
          : 'Inquiry details and context',
        projectBase
          ? `${projectBase}/discussion`
          : inquiryBase
      )}

      {routeItem(
        'Activity and history',
        projectBase
          ? `${projectBase}/discussion`
          : inquiryBase
      )}

      {routeItem(
        'Client access',
        projectBase
          ? `${projectBase}/access`
          : inquiryBase
            ? `${inquiryBase}/access`
            : null
      )}

      <MenuDivider />

      {commandItem(
        'Start new discussion…',
        'new-discussion'
      )}

      {isProject &&
        sectionItem(
          'Project tasks',
          'plan'
        )}
    </>
  );

  /* =======================================================
     PUBLISHING MENU
     ======================================================= */

  const publishingMenu = (
    <>
      <MenuHeading>
        {isProject
          ? 'Project publishing'
          : 'Proposal workflow'}
      </MenuHeading>

      {isProject ? (
        <>
          {routeItem(
            'Publishing overview',
            `${projectBase}/publish`
          )}

          {routeItem(
            'Client review and feedback',
            `${projectBase}/publish`
          )}

          {sectionItem(
            'Delivery workspace',
            'delivery'
          )}

          {routeItem(
            'Project files',
            `${projectBase}/files`
          )}

          <MenuDivider />

          {sectionItem(
            'Lifecycle and closeout',
            'lifecycle'
          )}
        </>
      ) : isInquiry ? (
        <>
          {routeItem(
            'Proposals',
            `${inquiryBase}/proposals`
          )}

          {routeItem(
            'Accepted scope',
            `${inquiryBase}/proposals`
          )}

          {routeItem(
            'Readiness and approval',
            `${inquiryBase}/readiness`
          )}

          <MenuDivider />

          {commandItem(
            'Create proposal…',
            'new-proposal'
          )}
        </>
      ) : (
        <EmptyMenuItem>
          Open a project or inquiry
        </EmptyMenuItem>
      )}
    </>
  );

  /* =======================================================
     CLIENT ACCESS MENU
     ======================================================= */

  const clientAccessMenu = (
    <>
      <MenuHeading>
        Access management
      </MenuHeading>

      {routeItem(
        'Access overview',
        projectBase
          ? `${projectBase}/access`
          : inquiryBase
            ? `${inquiryBase}/access`
            : null
      )}

      {routeItem(
        'Client invitations',
        projectBase
          ? `${projectBase}/access`
          : inquiryBase
            ? `${inquiryBase}/access`
            : null
      )}

      {routeItem(
        'Permissions and roles',
        projectBase
          ? `${projectBase}/access`
          : inquiryBase
            ? `${inquiryBase}/access`
            : null
      )}

      <MenuDivider />

      {routeItem(
        'Shared project files',
        projectBase
          ? `${projectBase}/files`
          : inquiryBase
            ? `${inquiryBase}/onboarding`
            : null
      )}

      {isProject &&
        routeItem(
          'Publishing and client review',
          `${projectBase}/publish`
        )}
    </>
  );

  /* =======================================================
     MENU CONTENT MAP
     ======================================================= */

  const menus: Record<MenuName, ReactNode> = {
    File: fileMenu,
    Edit: editMenu,
    View: viewMenu,
    Window: windowMenu,
    Onboarding: onboardingMenu,
    Bookmarks: bookmarksMenu,
    Discussion: discussionMenu,
    Publishing: publishingMenu,
    'Client access': clientAccessMenu,
  };

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <div
      className="
        relative
        z-30
        flex
        h-11
        shrink-0
        items-center
        gap-0.5
        border-b
        border-border/60
        bg-card
        px-2
        sm:px-4
      "
    >
      <nav
        aria-label="Workspace menu"
        className="
          flex
          min-w-0
          flex-1
          items-center
          gap-0.5
          overflow-x-auto
          scrollbar-hide
        "
      >
        {MENU_LABELS.map((label) => (
          <DropdownMenu
            key={label}

            /*
             * Non-modal is important here:
             * an open menu must not block
             * pointer interaction with the
             * neighboring menu triggers.
             */
            modal={false}

            open={openMenu === label}
            onOpenChange={(open) =>
              handleMenuOpenChange(
                label,
                open
              )
            }
          >
            <DropdownMenuTrigger asChild>
              <button
                type="button"

                onPointerEnter={(event) =>
                  switchMenuOnHover(
                    label,
                    event.pointerType
                  )
                }

                className={`
                  flex
                  h-8
                  shrink-0
                  items-center
                  rounded-md
                  px-2.5
                  text-[11px]
                  font-medium
                  transition-colors
                  duration-100

                  hover:bg-muted
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-ring

                  ${
                    openMenu === label
                      ? 'bg-muted text-foreground'
                      : 'text-foreground/80'
                  }
                `}
              >
                {label}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="start"
              sideOffset={5}
              collisionPadding={12}
              className={contentClass}

              onCloseAutoFocus={
                handleMenuCloseAutoFocus
              }
            >
              {menus[label]}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </nav>

      {message && (
        <span
          role="status"
          className="
            hidden
            max-w-[180px]
            shrink-0
            truncate
            px-2
            text-[10px]
            text-muted-foreground
            lg:block
          "
        >
          {message}
        </span>
      )}
    </div>
  );
}
