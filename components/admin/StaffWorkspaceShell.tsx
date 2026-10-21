
'use client';

import {ProfileImage} from '@/components/profile-images/ProfileImage';
import {ImageEditorDialog} from '@/components/profile-images/ImageEditor';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { staffGroups, recordDefinitions, canonicalKind, isStaffDestinationActive as isActive, type SectionId, type StaffDestination } from '@/lib/admin/workspace/navigation';
import { projectRecordSections, projectSectionHref } from '@/lib/admin/workspace/project-sections';
import { WorkspacePreferencesContext } from './workspace/WorkspacePreferences';
import { NotificationsBell } from './notifications/NotificationsBell';
import { WorkspaceItemMenu } from './workspace/WorkspaceItemMenu';
import { WorkspaceNavigationGuard, guardWorkspaceNavigation } from './workspace/WorkspaceNavigationGuard';
import { staffNavigationItems as navItems, recordIcons } from './workspace/navigationUi';
import Image from 'next/image';
import Link from 'next/link';

import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  CalendarDays,
  Clock3,
  Files,
  MessageSquare,
  FileText,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Pin,
  Plus,
  Search,
  Send,
  Settings2,
  Layers,
  Truck,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';

import {
  ThemeToggle,
} from '@/components/layout/ThemeToggle';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  WorkspaceMenuBar,
  type WorkspaceDensity,
} from './workspace/WorkspaceMenuBar';

import {
  WorkspaceTabBar,
} from './workspace/WorkspaceTabBar';

import {
  getWorkspaceRecordHref,
  normalizeStaffPath,
  useStaffWorkspaceTabs,
  type WorkspaceBookmark,
  type WorkspaceRecordKind,
  type WorkspaceRecordMetadata,
  type WorkspaceTab,
} from './workspace/useStaffWorkspaceTabs';

/* =========================================================
   NAVIGATION TYPES
   ========================================================= */

type NavItem = Omit<StaffDestination, 'icon'> & { icon: LucideIcon };
const sidebarItems = navItems.filter(item => item.placement !== 'topbar');
const sections = staffGroups.map(group => ({ ...group, links: sidebarItems.filter(item => item.subgroup === group.id) })).filter(group => group.links.length > 0);

/* =========================================================
   RECORD CONFIGURATION
   ========================================================= */

/* =========================================================
   PROJECT SECTIONS
   ========================================================= */

const projectSectionIcons: Record<(typeof projectRecordSections)[number]['id'], LucideIcon> = {
  overview: LayoutDashboard,
  plan: ClipboardList,
  phases: Layers,
  calendar: CalendarDays,
  brief: FileText,
  delivery: Truck,
  files: Files,
  discussion: MessageSquare,
  access: Users,
  activity: Clock3,
  publishing: Send,
};
const projectSections = projectRecordSections.map(section => ({
  ...section,
  icon: projectSectionIcons[section.id],
}));

/* =========================================================
   INQUIRY SECTIONS
   ========================================================= */

const inquirySections = [
  {
    label: 'Overview',
    suffix: '',
    icon: LayoutDashboard,
  },
  {
    label: 'Proposals',
    suffix: '/proposals',
    icon: FileText,
  },
  {
    label: 'Readiness',
    suffix: '/readiness',
    icon: ClipboardList,
  },
  {
    label: 'Onboarding',
    suffix: '/onboarding',
    icon: Settings2,
  },
  {
    label: 'Client Access',
    suffix: '/access',
    icon: Users,
  },
];

/* =========================================================
   STORAGE KEYS
   ========================================================= */

const SIDEBAR_STORAGE_KEY =
  'bivi-staff-sidebar-collapsed';

const DENSITY_STORAGE_KEY =
  'bivi-staff-workspace-density';

/* =========================================================
   RECORD METADATA CONTEXT
   ========================================================= */

/*
 * The actual project/inquiry page supplies
 * its company name, service type, status,
 * and optional due date.
 *
 * The shared shell receives that metadata
 * without making additional client-side
 * requests to protected database tables.
 */

type RegisterMetadata = (
  metadata: WorkspaceRecordMetadata
) => void;

const RecordMetadataContext =
  createContext<RegisterMetadata>(
    () => {}
  );

/* =========================================================
   RECORD METADATA REGISTRATION COMPONENT
   ========================================================= */

export function WorkspaceRecordDetails({
  kind,
  id,
  title,
  recordType,
  status,
  dueDate,
}: WorkspaceRecordMetadata) {
  const register = useContext(
    RecordMetadataContext
  );

  useEffect(() => {
    register({
      kind,
      id,
      title,
      recordType,
      status,
      dueDate,
    });
  }, [
    register,
    kind,
    id,
    title,
    recordType,
    status,
    dueDate,
  ]);

  return null;
}

/* =========================================================
   PATH HELPERS
   ========================================================= */

const recordGroup = canonicalKind;

/* =========================================================
   SIDEBAR DIRECTORY LINK
   ========================================================= */

function SidebarLink({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  const active = isActive(
    pathname,
    item.href
  );

  return (
    <WorkspaceItemMenu href={item.href}>
    <Link
      href={item.href}
      title={
        collapsed
          ? item.label
          : undefined
      }
      aria-label={
        collapsed
          ? item.label
          : undefined
      }
      aria-current={
        active
          ? 'page'
          : undefined
      }
      className={`
        flex
        shrink-0
        items-center
        rounded-xl
        text-[13px]
        transition-colors
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-ring

        ${
          collapsed
            ? 'h-11 w-11 justify-center'
            : 'h-11 w-full gap-3 px-3'
        }

        ${
          active
            ? 'bg-muted font-semibold text-foreground'
            : 'font-medium text-muted-foreground hover:bg-muted/70 hover:text-foreground'
        }
      `}
    >
      <Icon
        size={collapsed ? 19 : 17}
        strokeWidth={
          active ? 2.1 : 1.8
        }
        className="shrink-0"
        aria-hidden="true"
      />

      {!collapsed && (
        <span className="truncate">
          {item.label}
        </span>
      )}
    </Link>
    </WorkspaceItemMenu>
  );
}

/* =========================================================
   OPEN RECORD IN SIDEBAR
   ========================================================= */

function SidebarRecord({
  tab,
  active,
  onOpen,
  onPin,
  onBookmark,
  bookmarked,
  onClose,
  onPrefetch,
}: {
  onPin: () => void;
  onBookmark: () => void;
  bookmarked: boolean;
  onClose?: () => void;
  onPrefetch: () => void;
  tab: WorkspaceTab | WorkspaceBookmark;
  active: boolean;
  onOpen: () => void;
}) {
  const Icon =
    'pinned' in tab && tab.pinned
      ? Pin
      : recordIcons[tab.kind];

  const typeLabel = tab.recordType || recordDefinitions[tab.kind].label;

  return (
    <WorkspaceItemMenu href={tab.href} pinned={'pinned' in tab && tab.pinned} bookmarked={bookmarked} onOpen={onOpen} onPin={onPin} onBookmark={onBookmark} onClose={onClose}>
    <button
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      type="button"
      onClick={onOpen}
      title={`${tab.title} · ${typeLabel}`}
      aria-current={
        active ? 'page' : undefined
      }
      className={`
        flex
        min-h-11
        w-full
        min-w-0
        items-center
        gap-2
        rounded-lg
        px-2.5
        py-1.5
        text-left
        transition-colors

        ${
          active
            ? 'bg-muted font-semibold text-foreground'
            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
        }
      `}
    >
      <Icon
        size={13}
        strokeWidth={1.8}
        className="shrink-0"
        aria-hidden="true"
      />

      <span
        className="
          flex
          min-w-0
          flex-1
          flex-col
          gap-0.5
        "
      >
        <span
          className="
            truncate
            text-[11px]
            font-semibold
            leading-tight
          "
        >
          {tab.title}
        </span>

        <span
          className="
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
    </WorkspaceItemMenu>
  );
}

/* =========================================================
   RECORD CONTEXT NAVIGATION
   ========================================================= */

function RecordContextNavigation({
  tab,
  pathname,
  selectedProjectTab,
}: {
  tab: WorkspaceTab | null;
  pathname: string;
  selectedProjectTab: string;
}) {
  if (!tab) {
    return null;
  }

  const isProject =
    tab.kind === 'project';

  const isInquiry =
    tab.kind === 'inquiry' ||
    tab.kind === 'lead';

  const base = getWorkspaceRecordHref(
    tab.kind,
    tab.id
  );

  const cleanPath = normalizeStaffPath(
    pathname
  );

  const isOnMainProjectPage =
    isProject &&
    cleanPath === base;

  const currentProjectSection =
    isProject &&
    tab.status === 'Not activated' &&
    selectedProjectTab === 'overview'
      ? 'plan'
      : selectedProjectTab;

  const RecordIcon = recordIcons[tab.kind];
  return (
    <div
      className="
        flex
        min-h-[52px]
        shrink-0
        items-center
        gap-3
        border-b
        border-border/60
        bg-card
        px-3
        sm:px-5
      "
    >
      {/* SECTION NAVIGATION */}

      <nav
        aria-label="Record sections"
        className="
          flex
          h-[52px]
          min-w-0
          flex-1
          items-center
          gap-1
          overflow-x-auto
          scrollbar-hide
        "
      >
        {/* PROJECT SECTIONS */}

        {isProject &&
          projectSections.map(section => {
            const href = projectSectionHref(base, section);
            const active = Boolean(href && (
              section.href === ''
                ? isOnMainProjectPage && currentProjectSection === 'overview'
                : section.href?.startsWith('?tab=')
                  ? isOnMainProjectPage && currentProjectSection === section.id
                  : cleanPath === href
            ));
            const Icon = section.icon;
            const content = <>
              <Icon size={14} strokeWidth={1.8} aria-hidden="true" />
              {section.label}
            </>;
            const className = `flex h-full shrink-0 items-center gap-1.5 border-b-2 px-2 text-[11px] font-medium transition-colors ${active
              ? 'border-foreground font-semibold text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'}`;
            return href ? (
              <Link key={section.id} href={href} scroll={false}
                aria-current={active ? 'page' : undefined} className={className}>
                {content}
              </Link>
            ) : (
              <span key={section.id} aria-disabled="true"
                title="Not available yet"
                className="flex h-full shrink-0 cursor-not-allowed items-center gap-1.5 border-b-2 border-transparent px-2 text-[11px] text-muted-foreground/50">
                {content}<span className="sr-only">Coming soon</span>
              </span>
            );
          })}

        {/* INQUIRY SECTIONS */}

        {isInquiry &&
          inquirySections.map(
            (section) => {
              const href =
                `${base}${section.suffix}`;

              const active =
                cleanPath === href;

              const Icon = section.icon;

              return (
                <Link
                  key={section.label}
                  href={href}
                  scroll={false}
                  aria-current={
                    active
                      ? 'page'
                      : undefined
                  }
                  className={`
                    flex
                    h-full
                    shrink-0
                    items-center
                    gap-1.5
                    border-b-2
                    px-2
                    text-[11px]
                    font-medium
                    transition-colors

                    ${
                      active
                        ? 'border-foreground font-semibold text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  <Icon
                    size={14}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  {section.label}
                </Link>
              );
            }
          )}

        {/* CONTACT PLACEHOLDER */}

        {(tab.kind === 'contact' || tab.kind === 'company') && (
          <span className="flex items-center gap-2 text-xs font-semibold">
            <RecordIcon size={15} />
            {recordDefinitions[tab.kind].label} workspace
          </span>
        )}
      </nav>

      {/* PROJECT STATUS */}

      <div
        className="
          hidden
          shrink-0
          items-center
          gap-3
          lg:flex
        "
      >
        {tab.status && (
          <span
            className="
              rounded-full
              bg-muted
              px-3
              py-1.5
              text-[10px]
              font-semibold
              text-foreground
            "
          >
            {tab.status.replaceAll(
              '_',
              ' '
            )}
          </span>
        )}

        {tab.dueDate && (
          <span
            title={tab.dueDate}
            className="
              max-w-[125px]
              truncate
              text-[10px]
              text-muted-foreground
            "
          >
            Due {tab.dueDate}
          </span>
        )}
      </div>

      {/* PROJECT NEW TASK */}

      {isProject && (
        <button
          type="button"
          disabled
          title="New task action will be connected to the project editor."
          className="
            hidden
            h-9
            shrink-0
            items-center
            gap-2
            rounded-lg
            bg-foreground
            px-3
            text-[11px]
            font-semibold
            text-background
            disabled:cursor-not-allowed
            disabled:opacity-50
            xl:flex
          "
        >
          <Plus size={14} />
          New task
        </button>
      )}

      {/* INQUIRY PROPOSALS */}

      {isInquiry && (
        <Link
          href={`${base}/proposals`}
          className="
            hidden
            h-9
            shrink-0
            items-center
            gap-2
            rounded-lg
            bg-foreground
            px-3
            text-[11px]
            font-semibold
            text-background
            xl:flex
          "
        >
          <Send size={14} />
          Proposals
        </Link>
      )}
    </div>
  );
}

/* =========================================================
   MAIN STAFF WORKSPACE SHELL
   ========================================================= */

export function StaffWorkspaceShell({
  children,
  staffId,
  staffEmail = '',
  initialCollapsed = false,
  staffAvatarPath = null,
  staffPublicId = '',
}: {
  children: ReactNode;
  staffId?: string;
  staffEmail?: string;
  initialCollapsed?: boolean;
  staffAvatarPath?:string|null;staffPublicId?:string;
}) {
  const [avatarOpen,setAvatarOpen]=useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  /*
   * An authenticated staff ID should be
   * supplied by the server layout.
   *
   * Until then, the temporary namespace
   * avoids mixing tabs between accounts
   * on the same browser.
   */

  const [temporaryId] = useState(
    () =>
      `temporary-${Math.random()
        .toString(36)
        .slice(2)}`
  );

  const workspaceId =
    staffId ||
    staffEmail ||
    temporaryId;

  /* =======================================================
     WORKSPACE TABS
     ======================================================= */

  const workspace =
    useStaffWorkspaceTabs(
      workspaceId
    );

  const {
    hydrated,
    tabs,
    bookmarks,
    recentlyClosed,
    activeKey,
    activeTab,
    routeRecord,
    openTab,
    closeTab,
    togglePin,
    toggleBookmark,
    reorderTabs,
    prefetchTab,
    pinRecord,
    navigating,
    reopenClosedTab,
    closeOtherTabs,
    closeUnpinnedTabs,
    registerRecord,
  } = workspace;

  /* =======================================================
     LOCAL UI STATE
     ======================================================= */

  const [collapsed, setCollapsed] =
    useState(initialCollapsed);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const [showTabs, setShowTabs] = useState(true);
  const tabBarStorageKey = `bivi-staff-tab-bar:${workspaceId}`;
  const [sidebarAnimated, setSidebarAnimated] = useState(false);

  const [openSections, setOpenSections] =
    useState<
      Record<SectionId, boolean>
    >({
      overview: true,
      sales: true,
      workspace: true,
      resources: true,
      business: true,
      system: true,
    });

  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({});

  const [density, setDensity] =
    useState<WorkspaceDensity>(
      'comfortable'
    );

  const [searchOpen, setSearchOpen] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [signingOut, setSigningOut] =
    useState(false);

  const [logoutError, setLogoutError] =
    useState('');

  useEffect(() => {
    const closeSearch = () => setSearchOpen(false);
    window.addEventListener('bivi:workspace-navigation-blocked', closeSearch);
    return () => window.removeEventListener('bivi:workspace-navigation-blocked', closeSearch);
  }, []);

  /* =======================================================
     RECORD METADATA STATE
     ======================================================= */

  /*
   * Keep metadata keyed by record ID, rather
   * than storing only the last record visited.
   *
   * This lets metadata remain available when
   * switching between existing open tabs.
   */

  const [
    registeredRecords,
    setRegisteredRecords,
  ] = useState<
    Record<string, WorkspaceRecordMetadata>
  >({});

  const receiveMetadata = useCallback(
    (
      metadata: WorkspaceRecordMetadata
    ) => {
      const kind =
        metadata.kind === 'lead'
          ? 'inquiry'
          : metadata.kind;

      const key =
        `${kind}:${metadata.id}`;

      setRegisteredRecords(
        (current) => {
          const existing =
            current[key];

          if (
            existing &&
            existing.title === metadata.title &&
            existing.recordType ===
              metadata.recordType &&
            existing.status ===
              metadata.status &&
            existing.dueDate ===
              metadata.dueDate
          ) {
            return current;
          }

          return {
            ...current,
            [key]: {
              ...metadata,
              kind,
            },
          };
        }
      );
    },
    []
  );

  const activeMetadata =
    routeRecord
      ? registeredRecords[
          routeRecord.key
        ]
      : undefined;

  /* =======================================================
     APPLY REGISTERED METADATA
     ======================================================= */

useEffect(() => {
  if (
    !hydrated ||
    !routeRecord ||
    !activeTab ||
    !activeMetadata
  ) {
    return;
  }

  if (activeTab.key !== routeRecord.key) {
    return;
  }

  registerRecord(activeMetadata);
}, [
  hydrated,
  routeRecord,
  activeTab,
  activeMetadata,
  registerRecord,
]);

  /* =======================================================
     PREFERENCES
     ======================================================= */

  useEffect(() => {
    try {
      setShowTabs(localStorage.getItem(tabBarStorageKey) !== 'false');
      const storedCollapsed = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      const restored = storedCollapsed === null ? initialCollapsed : storedCollapsed === 'true';
      setCollapsed(restored);
      document.cookie = `${SIDEBAR_STORAGE_KEY}=${restored}; Path=/; Max-Age=31536000; SameSite=Lax`;

      const storedDensity =
        localStorage.getItem(
          DENSITY_STORAGE_KEY
        );

      if (
        storedDensity === 'compact' ||
        storedDensity === 'comfortable'
      ) {
        setDensity(
          storedDensity
        );
      }
    } catch {
      // Default preferences remain active.
    } finally { setPreferencesReady(true); }
  }, [initialCollapsed, tabBarStorageKey]);

  const toggleSidebar =
    useCallback(() => {
      setSidebarAnimated(true);
      setCollapsed(
        (previous) => {
          const next =
            !previous;
          document.cookie = `${SIDEBAR_STORAGE_KEY}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;

          try {
            localStorage.setItem(
              SIDEBAR_STORAGE_KEY,
              String(next)
            );
          } catch {
            // Local preference still changes.
          }

          return next;
        }
      );
    }, []);

  const changeDensity = useCallback(
    (next: WorkspaceDensity) => {
      setDensity(next);

      try {
        localStorage.setItem(
          DENSITY_STORAGE_KEY,
          next
        );
      } catch {
        // Continue without persistence.
      }
    },
    []
  );

  const changeShowTabs = useCallback((next: boolean) => {
    setShowTabs(next);
    try { localStorage.setItem(tabBarStorageKey, String(next)); }
    catch { /* Continue for this session. */ }
  }, [tabBarStorageKey]);

  /* =======================================================
     KEYBOARD SHORTCUTS
     ======================================================= */

  useEffect(() => {
    function onKeyDown(
      event: KeyboardEvent
    ) {
      const modifier =
        event.metaKey ||
        event.ctrlKey;

      if (!modifier) {
        return;
      }

      const key =
        event.key.toLowerCase();

      if (key === 'k') {
        event.preventDefault();

        setSearchOpen(
          (previous) =>
            !previous
        );

        return;
      }

      if (
        key === 'd' &&
        activeKey
      ) {
        event.preventDefault();

        toggleBookmark(
          activeKey
        );
      }
    }

    window.addEventListener(
      'keydown',
      onKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        onKeyDown
      );
    };
  }, [
    activeKey,
    toggleBookmark,
  ]);

  /* =======================================================
     OPEN RECORD GROUPS
     ======================================================= */

  const recordsByKind = useMemo(() => {
    const groups: Record<
      'project' | 'inquiry' | 'contact' | 'company',
      WorkspaceTab[]
    > = {
      project: [],
      inquiry: [],
      contact: [],
      company: [],
    };

    for (const tab of tabs) {
      groups[
        recordGroup(tab.kind)
      ].push(tab);
    }

    return groups;
  }, [tabs]);

  function sectionRecords(
    item: NavItem
  ) {
    if (!item.kind) {
      return [];
    }

    return recordsByKind[
      recordGroup(item.kind)
    ];
  }

  /* =======================================================
     SEARCH RESULTS
     ======================================================= */

  const matches = useMemo(() => {
    const pages = navItems.map(
      (item) => ({
        key: `page:${item.href}`,
        label: item.label,
        href: item.href,
        icon: item.icon,
      })
    );

    const seen = new Set<string>();

    const records = [
      ...tabs,
      ...bookmarks,
    ]
      .filter((record) => {
        if (
          seen.has(
            record.key
          )
        ) {
          return false;
        }

        seen.add(
          record.key
        );

        return true;
      })
      .map((record) => ({
        key: record.key,
        label: record.title,
        href: record.href,
        icon: recordIcons[
          record.kind
        ],
      }));

    const term =
      search
        .trim()
        .toLowerCase();

    return [
      ...pages,
      ...records,
    ].filter(
      (item) =>
        !term ||
        item.label
          .toLowerCase()
          .includes(term)
    );
  }, [
    search,
    tabs,
    bookmarks,
  ]);

  /* =======================================================
     BREADCRUMB DATA
     ======================================================= */

  const currentPage =
    navItems.find(
      (item) =>
        isActive(
          pathname,
          item.href
        )
    )?.label ?? 'Staff';

  const breadcrumbCategory =
    routeRecord
      ? navItems.find(item => item.href === recordDefinitions[routeRecord.kind].directory)?.label ?? recordDefinitions[routeRecord.kind].label
      : 'Workspace';

  const breadcrumbTitle = routeRecord ? activeMetadata?.title ?? activeTab?.title ?? recordDefinitions[routeRecord.kind].label : currentPage;

  const breadcrumbHref = routeRecord ? recordDefinitions[routeRecord.kind].directory : '/';

  /* =======================================================
     SELECTED SECTION
     ======================================================= */

  const requestedProjectTab = searchParams.get('tab') ?? 'overview';
  // Preserve former lifecycle and calendar phase-schedule URLs as Phases aliases.
  const isLegacyPhaseView = requestedProjectTab === 'calendar' && searchParams.get('view') === 'phases';
  const selectedProjectTab = requestedProjectTab === 'lifecycle' || isLegacyPhaseView ? 'phases' : requestedProjectTab;

  /* =======================================================
     STAFF ACCOUNT
     ======================================================= */

  const initial =
    staffEmail
      .trim()
      .charAt(0)
      .toUpperCase() || 'B';

  async function signOut() {
    if (signingOut) {
      return;
    }

    setSigningOut(true);
    setLogoutError('');

    try {
      const response =
        await fetch(
          '/api/admin/session',
          {
            method: 'DELETE',
            signal:
              AbortSignal.timeout(
                15000
              ),
          }
        );

      if (!response.ok) {
        throw new Error(
          'Sign out failed'
        );
      }

      router.replace(
        '/login'
      );

      router.refresh();
    } catch {
      setLogoutError(
        'Could not sign out. Please try again.'
      );
    } finally {
      setSigningOut(false);
    }
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <WorkspaceNavigationGuard>
    <WorkspacePreferencesContext.Provider value={{density, changeDensity, collapsed, toggleSidebar, showTabs, changeShowTabs}}>
    <RecordMetadataContext.Provider
      value={receiveMetadata}
    >
      <div
        data-workspace-density={density}
        style={{ visibility: preferencesReady ? 'visible' : 'hidden' }}
        className="
          bivi-staff-theme
          flex
          h-[100dvh]
          min-h-0
          w-full
          overflow-hidden
          bg-background
          text-foreground
        "
      >
        {/* ===============================================
            SIDEBAR
            =============================================== */}

        <aside
          id="staff-sidebar"
          aria-label="Staff sidebar"
          className={`
            hidden
            h-full
            shrink-0
            flex-col
            border-r
            border-border/50
            bg-card
            ${sidebarAnimated ? 'transition-[width] duration-200 ease-out motion-reduce:transition-none' : ''}
            md:flex

            ${
              collapsed
                ? 'w-[64px]'
                : 'w-[236px]'
            }
          `}
        >
          {/* BRAND */}

          <div
            className={`
              flex
              h-[60px]
              shrink-0
              items-center

              ${
                collapsed
                  ? 'justify-center px-2'
                  : 'px-5'
              }
            `}
          >
            <Link
              href="/"
              title="Bivi dashboard"
              aria-label="Bivi dashboard"
              className="
                flex
                min-w-0
                items-center
                rounded-xl
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-ring
              "
            >
              {collapsed ? (
                <Image
                  src="/images/bivi-icon.svg"
                  alt=""
                  width={34}
                  height={34}
                  priority
                  className="h-8 w-8 object-contain dark:invert"
                />
              ) : (
                <>
                  <Image
                    src="/images/logo.svg"
                    alt="Bivi"
                    width={186}
                    height={65}
                    priority
                    className="h-auto w-[79px] object-contain dark:invert"
                  />

                  <span className="mx-3 h-5 w-px bg-border/60" />

                  <span
                    className="
                      font-mono
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-wider
                      text-muted-foreground
                    "
                  >
                    Staff
                  </span>
                </>
              )}
            </Link>
          </div>

          {/* SIDEBAR NAVIGATION */}

          <nav
            aria-label="Staff navigation"
            className={`
              min-h-0
              flex-1
              overflow-y-auto
              scrollbar-transparent

              ${
                collapsed
                  ? 'flex flex-col items-center gap-1.5 px-2 py-3'
                  : 'space-y-5 px-3 py-4'
              }
            `}
          >
            {collapsed ? (
              sidebarItems.map(
                (item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    collapsed
                  />
                )
              )
            ) : (
              <>
                {/* DIRECTORY SECTIONS */}

                {sections.map(
                  (section) => (
                    <div
                      key={section.id}
                    >
                      {section.id === 'overview' ? (
                        <p className="mb-2 px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70">{section.title}</p>
                      ) : (
                        <button
                          type="button"
                          aria-expanded={openSections[section.id]}
                          aria-controls={`sidebar-section-${section.id}`}
                          onClick={() => setOpenSections(current => ({...current, [section.id]: !current[section.id]}))}
                          className="group mb-2 flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/70 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {section.title}
                          <ChevronDown size={13} aria-hidden="true" className={`opacity-0 transition-all group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100 ${openSections[section.id] ? '' : '-rotate-90'}`} />
                        </button>
                      )}

                      {(section.id === 'overview' || openSections[section.id]) && (
                        <div id={`sidebar-section-${section.id}`} className="space-y-1">
                          {section.links.map(
                            (item) => {
                              const openRecords = sectionRecords(item);
                              const recordGroups = [
                                { label: 'Pinned', records: openRecords.filter(tab => tab.pinned) },
                                { label: 'Open', records: openRecords.filter(tab => !tab.pinned) },
                                { label: 'Bookmarked', records: bookmarks.filter(bookmark => item.kind && recordGroup(bookmark.kind) === recordGroup(item.kind) && !tabs.some(tab => tab.key === bookmark.key)) },
                              ].filter(group => group.records.length > 0);

                              return (
                                <div
                                  key={item.href}
                                >
                                  <div className="group relative flex items-center">
                                    <div className="min-w-0 flex-1">
                                      <SidebarLink item={item} pathname={pathname} collapsed={false} />
                                    </div>
                                    {!!item.kind && (
                                      <button
                                        type="button"
                                        aria-label={`${expandedTypes[item.id] ? 'Hide' : 'Show'} ${item.label.toLowerCase()} records`}
                                        aria-expanded={!!expandedTypes[item.id]}
                                        aria-controls={`sidebar-records-${item.id}`}
                                        onClick={() => setExpandedTypes(current => ({...current, [item.id]: !current[item.id]}))}
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(hover:none)]:opacity-100"
                                      >
                                        <ChevronRight size={14} aria-hidden="true" className={`transition-transform ${expandedTypes[item.id] ? 'rotate-90' : ''}`} />
                                      </button>
                                    )}
                                  </div>

                                  {!!item.kind && <div id={`sidebar-records-${item.id}`} hidden={!expandedTypes[item.id]}>
                                  {recordGroups.length > 0 ? (
                                    <div
                                      className="
                                        ml-4
                                        mt-1
                                        space-y-0.5
                                        border-l
                                        border-border/60
                                        pl-2
                                      "
                                    >
                                      {recordGroups.map(group => (
                                        <div key={group.label}>
                                          <p className="px-2.5 pt-2 text-[10px] font-medium text-muted-foreground">{group.label}</p>
                                          {group.records.map(tab => (
                                            <SidebarRecord key={tab.key} tab={tab} active={tab.key === activeKey} onOpen={() => openTab(tab)} onPrefetch={() => prefetchTab(tab.href)} onPin={() => pinRecord(tab)} onBookmark={() => toggleBookmark(tab.key)} bookmarked={bookmarks.some(bookmark => bookmark.key === tab.key)} onClose={'pinned' in tab ? () => closeTab(tab.key) : undefined} />
                                          ))}
                                        </div>
                                      ))}
                                    </div>
                                  ) : <p className="px-5 py-2 text-xs text-muted-foreground">No open or saved records.</p>}
                                  </div>}
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}

              </>
            )}
          </nav>

          {/* COLLAPSE CONTROL */}

          <div
            className="
              shrink-0
              border-t
              border-border/40
              px-3
              py-3
            "
          >
            <button
              type="button"
              onClick={
                toggleSidebar
              }
              aria-label={
                collapsed
                  ? 'Expand sidebar'
                  : 'Collapse sidebar'
              }
              aria-controls="staff-sidebar"
              aria-expanded={!collapsed}
              title={
                collapsed
                  ? 'Expand sidebar'
                  : 'Collapse sidebar'
              }
              className={`
                flex
                h-11
                items-center
                rounded-xl
                text-muted-foreground
                transition-colors
                hover:bg-muted
                hover:text-foreground

                ${
                  collapsed
                    ? 'mx-auto w-11 justify-center'
                    : 'w-full gap-3 px-3'
                }
              `}
            >
              {collapsed ? (
                <PanelLeftOpen
                  size={19}
                  strokeWidth={1.8}
                />
              ) : (
                <PanelLeftClose
                  size={18}
                  strokeWidth={1.8}
                />
              )}

              {!collapsed && (
                <span className="text-xs font-medium">
                  Collapse sidebar
                </span>
              )}
            </button>
          </div>
        </aside>

        {/* ===============================================
            MAIN WORKSPACE
            =============================================== */}

        <div
          className="
            flex
            min-h-0
            min-w-0
            flex-1
            flex-col
            overflow-hidden
          "
        >
          {/* HEADER */}

          <header
            className="
              relative
              z-20
              flex
              h-[60px]
              shrink-0
              items-center
              justify-between
              gap-3
              border-b
              border-border/40
              bg-card
              px-4
              sm:px-6
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >
              {/* MOBILE BRAND */}

              <Link
                href="/"
                aria-label="Bivi dashboard"
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                  md:hidden
                "
              >
                <Image
                  src="/images/logo.svg"
                  alt="Bivi"
                  width={186}
                  height={65}
                  className="h-auto w-[68px] dark:invert"
                />
              </Link>

              {/* BREADCRUMBS */}

              <nav
                aria-label="Breadcrumb"
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2
                  text-[12px]
                "
              >
                {routeRecord ? (
                  <>
                    <Link
                      href={breadcrumbHref}
                      className="
                        shrink-0
                        text-muted-foreground
                        hover:text-foreground
                      "
                    >
                      {breadcrumbCategory}
                    </Link>

                    <ChevronRight
                      size={13}
                      aria-hidden="true"
                      className="
                        shrink-0
                        text-muted-foreground
                      "
                    />

                    <span
                      title={
                        breadcrumbTitle
                      }
                      className="
                        min-w-0
                        truncate
                        font-semibold
                        text-foreground
                      "
                    >
                      {breadcrumbTitle}
                    </span>
                  </>
                ) : (
                  <span
                    className="
                      truncate
                      font-semibold
                      text-foreground
                    "
                  >
                    {breadcrumbTitle}
                  </span>
                )}
              </nav>
            </div>

            {/* HEADER ACTIONS */}

            <div
              className="
                flex
                shrink-0
                items-center
                gap-2
                sm:gap-3
              "
            >
              {navigating && <span role="status" className="text-xs text-muted-foreground">Opening…</span>}
              {/* SEARCH */}

              <button
                type="button"
                aria-label="Search workspace"
                onClick={() =>
                  setSearchOpen(true)
                }
                className="
                  flex
                  h-9
                  items-center
                  gap-2
                  rounded-lg
                  bg-muted/70
                  px-2.5
                  text-muted-foreground
                  transition-colors
                  hover:bg-muted
                  hover:text-foreground
                  sm:w-[180px]
                  sm:px-3
                  lg:w-[240px]
                "
              >
                <Search size={16} />

                <span
                  className="
                    hidden
                    flex-1
                    text-left
                    text-xs
                    sm:block
                  "
                >
                  Search workspace
                </span>

                <kbd
                  className="
                    hidden
                    rounded
                    bg-card
                    px-1.5
                    py-0.5
                    font-mono
                    text-[10px]
                    lg:block
                  "
                >
                  ⌘ K
                </kbd>
              </button>

              <NotificationsBell />

              {/* THEME */}

              <ThemeToggle />

              {/* ACCOUNT */}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open account menu"
                    className="
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      bg-muted
                      text-xs
                      font-semibold
                      text-foreground
                      hover:bg-accent
                    "
                  >
                    {staffId?<ProfileImage kind="staff" subject={staffId} name={staffEmail||initial} path={staffAvatarPath} size="h-9 w-9"/>:initial}
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className="
                    bivi-staff-surface
                    w-56
                    rounded-xl
                    border-border/50
                    bg-popover
                    p-2
                    text-popover-foreground
                    shadow-lg
                  "
                >
                  <DropdownMenuLabel
                    className="
                      space-y-1
                      px-2
                      py-2
                    "
                  >
                    <span
                      className="
                        flex
                        items-center
                        gap-2
                        text-xs
                        font-semibold
                      "
                    >
                      <UserRound size={14} />
                      Staff account
                    </span>

                    {staffEmail && (
                      <span
                        title={
                          staffEmail
                        }
                        className="
                          block
                          truncate
                          text-[11px]
                          font-normal
                          text-muted-foreground
                        "
                      >
                        {staffEmail}
                      </span>
                    )}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />
                  {staffPublicId&&<DropdownMenuLabel className="font-mono text-xs">Staff ID {staffPublicId}</DropdownMenuLabel>}
                  <DropdownMenuItem onSelect={()=>setAvatarOpen(true)}>Edit profile image</DropdownMenuItem>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    disabled={signingOut}
                    onSelect={() =>
                      guardWorkspaceNavigation(() => void signOut())
                    }
                    className="
                      cursor-pointer
                      gap-2
                      rounded-lg
                      px-3
                      py-2.5
                      text-xs
                    "
                  >
                    <LogOut size={15} />

                    {signingOut
                      ? 'Signing out…'
                      : 'Sign out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* MOBILE DIRECTORY NAVIGATION */}

          <nav
            aria-label="Mobile staff navigation"
            className="
              flex
              shrink-0
              gap-1.5
              overflow-x-auto
              border-b
              border-border/40
              bg-card
              px-3
              py-2
              scrollbar-hide
              md:hidden
            "
          >
            {sidebarItems.map(item => <div key={item.id} className="shrink-0"><SidebarLink item={item} pathname={pathname} collapsed={false} /></div>)}
          </nav>

          {/* TEXT-ONLY DESKTOP MENUS */}

          <WorkspaceMenuBar
            activeTab={activeTab}
            tabs={tabs}
            bookmarks={bookmarks}
            recentlyClosed={recentlyClosed}
            openTab={openTab}
            closeTab={closeTab}
            togglePin={togglePin}
            toggleBookmark={toggleBookmark}
            reopenClosedTab={reopenClosedTab}
            closeOtherTabs={closeOtherTabs}
            closeUnpinnedTabs={closeUnpinnedTabs}
            density={density}
            onDensityChange={changeDensity}
            sidebarCollapsed={collapsed}
            onToggleSidebar={toggleSidebar}
          />

          {/* PERSISTENT RECORD TABS */}

          {showTabs && <WorkspaceTabBar
            reorderTabs={reorderTabs}
            prefetchTab={prefetchTab}
            tabs={
              hydrated
                ? tabs
                : []
            }
            bookmarks={bookmarks}
            recentlyClosed={recentlyClosed}
            activeKey={activeKey}
            openTab={openTab}
            closeTab={closeTab}
            togglePin={togglePin}
            toggleBookmark={toggleBookmark}
            reopenClosedTab={reopenClosedTab}
            closeOtherTabs={closeOtherTabs}
            closeUnpinnedTabs={closeUnpinnedTabs}
          />}

          {/* PROJECT / INQUIRY SECTIONS */}

          <RecordContextNavigation
            tab={activeTab}
            pathname={pathname}
            selectedProjectTab={
              selectedProjectTab
            }
          />

          {/* WORKSPACE CONTENT */}

          <main
            id="staff-workspace-content"
            className="
              min-h-0
              min-w-0
              flex-1
              overflow-x-hidden
              overflow-y-auto
              overscroll-contain
              bg-background
              scrollbar-transparent
            "
          >
            <div
              className={`
                mx-auto
                w-full
                max-w-[1600px]
                px-4
                sm:px-6
                lg:px-8

                ${
                  density === 'compact'
                    ? 'py-3 sm:py-4'
                    : 'py-5 sm:py-6 lg:py-7'
                }
              `}
            >
              {children}{staffId&&<ImageEditorDialog open={avatarOpen} onOpenChange={setAvatarOpen} kind="staff" subject={staffId} name={staffEmail||"Staff"} path={staffAvatarPath}/>} 
            </div>
          </main>
        </div>

        {/* ===============================================
            WORKSPACE SEARCH
            =============================================== */}

        <Dialog
          open={searchOpen}
          onOpenChange={(open) => {
            setSearchOpen(open);

            if (!open) {
              setSearch('');
            }
          }}
        >
          <DialogContent
            className="
              bivi-staff-surface
              w-[calc(100%-2rem)]
              max-w-lg
              rounded-2xl
              border-border/50
              bg-popover
              p-5
              text-popover-foreground
              shadow-xl
            "
          >
            <DialogTitle
              className="
                text-base
                font-semibold
              "
            >
              Search workspace
            </DialogTitle>

            <DialogDescription
              className="text-xs"
            >
              Find an open record, bookmark,
              or workspace page.
            </DialogDescription>

            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-muted/70
                px-3
              "
            >
              <Search
                size={16}
                className="
                  shrink-0
                  text-muted-foreground
                "
              />

              <input
                autoFocus
                type="search"
                aria-label="Search workspace"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search..."
                className="
                  h-11
                  min-w-0
                  flex-1
                  bg-transparent
                  text-sm
                  outline-none
                  placeholder:text-muted-foreground
                "
              />
            </div>

            {/* SEARCH RESULTS */}

            <div
              className="
                max-h-80
                space-y-1
                overflow-y-auto
                scrollbar-transparent
              "
            >
              {matches.map(
                (item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.key}
                      href={item.href}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearch('');
                      }}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        px-3
                        py-3
                        text-sm
                        hover:bg-muted
                      "
                    >
                      <Icon
                        size={16}
                        aria-hidden="true"
                      />

                      <span
                        className="
                          min-w-0
                          truncate
                        "
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                }
              )}

              {matches.length === 0 && (
                <p
                  className="
                    py-5
                    text-center
                    text-xs
                    text-muted-foreground
                  "
                >
                  No matching pages or records.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* SIGN-OUT ERROR */}

        {logoutError && (
          <div
            role="alert"
            className="
              fixed
              bottom-5
              right-5
              z-50
              max-w-sm
              rounded-xl
              bg-foreground
              px-4
              py-3
              text-xs
              font-medium
              text-background
              shadow-lg
            "
          >
            {logoutError}
          </div>
        )}
      </div>
    </RecordMetadataContext.Provider>
    </WorkspacePreferencesContext.Provider>
    </WorkspaceNavigationGuard>
  );
}
