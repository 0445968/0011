
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  Bookmark,
  ChevronDown,
  ChevronRight,
  ClipboardList,
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
  useStaffWorkspaceTabs,
  type WorkspaceBookmark,
  type WorkspaceRecordKind,
  type WorkspaceRecordMetadata,
  type WorkspaceTab,
} from './workspace/useStaffWorkspaceTabs';

/* =========================================================
   NAVIGATION CONFIGURATION
   ========================================================= */

type SectionId = 'overview' | 'work';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  kind?: WorkspaceRecordKind;
}

interface NavSection {
  id: SectionId;
  title: string;
  links: NavItem[];
}

const sections: NavSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    links: [
      {
        label: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: 'work',
    title: 'Work',
    links: [
      {
        label: 'Inquiries',
        href: '/admin/inquiries',
        icon: Inbox,
        kind: 'inquiry',
      },
      {
        label: 'Projects',
        href: '/admin/projects',
        icon: FolderKanban,
        kind: 'project',
      },
    ],
  },
];

const navItems =
  sections.flatMap(
    (section) => section.links
  );

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
  project: 'Projects',
  inquiry: 'Inquiries',
  lead: 'Inquiries',
  contact: 'Contacts',
};

const projectSections = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
  },
  {
    id: 'plan',
    label: 'Tasks & Milestones',
    icon: ClipboardList,
  },
  {
    id: 'lifecycle',
    label: 'Lifecycle',
    icon: Settings2,
  },
  {
    id: 'brief',
    label: 'Brief',
    icon: FileText,
  },
  {
    id: 'delivery',
    label: 'Delivery',
    icon: Truck,
  },
];

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

const SIDEBAR_STORAGE_KEY =
  'bivi-staff-sidebar-collapsed';

const DENSITY_STORAGE_KEY =
  'bivi-staff-workspace-density';

/* =========================================================
   RECORD METADATA REGISTRATION
   ========================================================= */

/*
 * Pages will use WorkspaceRecordDetails to
 * supply the real title, status, and due date.
 *
 * This avoids fetching protected record data
 * directly from the browser shell.
 */

const RecordMetadataContext =
  createContext<
    (metadata: WorkspaceRecordMetadata) => void
  >(() => {});

export function WorkspaceRecordDetails({
  kind,
  id,
  title,
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
      status,
      dueDate,
    });
  }, [
    register,
    kind,
    id,
    title,
    status,
    dueDate,
  ]);

  return null;
}

/* =========================================================
   NAVIGATION HELPERS
   ========================================================= */

function normalizePath(
  pathname: string
): string {
  if (pathname === '/') {
    return '/admin';
  }

  if (
    pathname === '/admin' ||
    pathname.startsWith('/admin/')
  ) {
    return pathname;
  }

  return `/admin${
    pathname.startsWith('/')
      ? pathname
      : `/${pathname}`
  }`;
}

function isActive(
  pathname: string,
  href: string
): boolean {
  const path = normalizePath(
    pathname
  );

  if (href === '/admin') {
    return path === '/admin';
  }

  if (href === '/admin/inquiries') {
    return (
      path === href ||
      path.startsWith(
        `${href}/`
      ) ||
      path.startsWith(
        '/admin/leads/'
      )
    );
  }

  return (
    path === href ||
    path.startsWith(`${href}/`)
  );
}

function matchesSection(
  kind: WorkspaceRecordKind,
  section: NavItem
) {
  if (
    kind === 'lead' &&
    section.kind === 'inquiry'
  ) {
    return true;
  }

  return kind === section.kind;
}

/* =========================================================
   SIDEBAR LINK
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
            ? 'h-10 w-10 justify-center'
            : 'h-10 w-full gap-3 px-3'
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
  );
}

/* =========================================================
   SIDEBAR RECORD
   ========================================================= */

function SidebarRecord({
  tab,
  active,
  onOpen,
}: {
  tab: WorkspaceTab | WorkspaceBookmark;
  active: boolean;
  onOpen: () => void;
}) {
  const Icon =
    'pinned' in tab && tab.pinned
      ? Pin
      : recordIcons[tab.kind];

  return (
    <button
      type="button"
      onClick={onOpen}
      title={tab.title}
      aria-current={
        active ? 'page' : undefined
      }
      className={`
        flex
        min-h-8
        w-full
        min-w-0
        items-center
        gap-2
        rounded-lg
        px-2.5
        py-1.5
        text-left
        text-[11px]
        transition-colors

        ${
          active
            ? 'bg-muted font-semibold text-foreground'
            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
        }
      `}
    >
      <Icon
        size={12}
        strokeWidth={1.8}
        className="shrink-0"
      />

      <span className="min-w-0 flex-1 truncate">
        {tab.title}
      </span>
    </button>
  );
}

/* =========================================================
   RECORD CONTEXT NAVIGATION
   ========================================================= */

function RecordContextNavigation({
  tab,
  pathname,
}: {
  tab: WorkspaceTab | null;
  pathname: string;
}) {
  if (!tab) {
    return null;
  }

  const isProject =
    tab.kind === 'project';

  const isInquiry =
    tab.kind === 'inquiry' ||
    tab.kind === 'lead';

  const base = isProject
    ? `/admin/projects/${tab.id}`
    : `/admin/leads/${tab.id}`;

  const search =
    typeof window === 'undefined'
      ? ''
      : window.location.search;

  const activeProjectSection =
    new URLSearchParams(
      search
    ).get('tab') ?? 'overview';

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
      {/* RECORD SECTIONS */}

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
        {isProject &&
          projectSections.map(
            (section) => {
              const href =
                section.id === 'overview'
                  ? base
                  : `${base}?tab=${section.id}`;

              const active =
                pathname === base &&
                activeProjectSection ===
                  section.id;

              const Icon =
                section.icon;

              return (
                <Link
                  key={section.id}
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
                  />

                  {section.label}
                </Link>
              );
            }
          )}

        {isInquiry &&
          inquirySections.map(
            (section) => {
              const href =
                `${base}${section.suffix}`;

              const active =
                pathname === href;

              const Icon =
                section.icon;

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
                  />

                  {section.label}
                </Link>
              );
            }
          )}

        {tab.kind === 'contact' && (
          <span className="flex items-center gap-2 text-xs font-semibold">
            <Users size={15} />
            Contact workspace
          </span>
        )}
      </nav>

      {/* STATUS + DUE DATE */}

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
              capitalize
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
            className="
              max-w-[125px]
              truncate
              text-[10px]
              text-muted-foreground
            "
            title={tab.dueDate}
          >
            Due {tab.dueDate}
          </span>
        )}
      </div>

      {/* PRIMARY ACTION */}

      {isProject && (
        <button
          type="button"
          disabled
          title="New task integration is coming with the project workspace update."
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
   STAFF WORKSPACE
   ========================================================= */

export function StaffWorkspaceShell({
  children,
  staffId,
  staffEmail = '',
}: {
  children: ReactNode;
  staffId?: string;
  staffEmail?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  /*
   * Until the authenticated layout supplies
   * staffId, use an ephemeral storage namespace.
   *
   * This prevents one staff member's tab titles
   * from being reused by a different account
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
    reopenClosedTab,
    closeOtherTabs,
    closeUnpinnedTabs,
    registerRecord,
  } = workspace;

  /* -------------------------------------------------------
     LOCAL UI STATE
     ------------------------------------------------------- */

  const [collapsed, setCollapsed] =
    useState(false);

  const [openSections, setOpenSections] =
    useState<
      Record<SectionId, boolean>
    >({
      overview: true,
      work: true,
    });

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

  const [
    registeredMetadata,
    setRegisteredMetadata,
  ] = useState<
    WorkspaceRecordMetadata | null
  >(null);

  /* -------------------------------------------------------
     RESTORE UI PREFERENCES
     ------------------------------------------------------- */

  useEffect(() => {
    try {
      setCollapsed(
        localStorage.getItem(
          SIDEBAR_STORAGE_KEY
        ) === 'true'
      );

      const storedDensity =
        localStorage.getItem(
          DENSITY_STORAGE_KEY
        );

      if (
        storedDensity === 'compact' ||
        storedDensity === 'comfortable'
      ) {
        setDensity(storedDensity);
      }
    } catch {
      // Use default preferences.
    }
  }, []);

  const toggleSidebar =
    useCallback(() => {
      setCollapsed((previous) => {
        const next = !previous;

        try {
          localStorage.setItem(
            SIDEBAR_STORAGE_KEY,
            String(next)
          );
        } catch {
          // Keep the in-memory setting.
        }

        return next;
      });
    }, []);

  const changeDensity =
    useCallback(
      (next: WorkspaceDensity) => {
        setDensity(next);

        try {
          localStorage.setItem(
            DENSITY_STORAGE_KEY,
            next
          );
        } catch {
          // Keep the in-memory setting.
        }
      },
      []
    );

  /* -------------------------------------------------------
     RECORD REGISTRATION
     ------------------------------------------------------- */

  const receiveMetadata =
    useCallback(
      (
        metadata:
          WorkspaceRecordMetadata
      ) => {
        setRegisteredMetadata(
          metadata
        );
      },
      []
    );

  useEffect(() => {
    if (
      !registeredMetadata ||
      !routeRecord ||
      !activeTab
    ) {
      return;
    }

    if (
      registeredMetadata.id !==
      routeRecord.id
    ) {
      return;
    }

    registerRecord(
      registeredMetadata
    );
  }, [
    registeredMetadata,
    routeRecord,
    activeTab?.key,
    registerRecord,
  ]);

  /* -------------------------------------------------------
     KEYBOARD SHORTCUTS
     ------------------------------------------------------- */

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

      if (
        event.key.toLowerCase() === 'k'
      ) {
        event.preventDefault();

        setSearchOpen(
          (previous) => !previous
        );
      }

      if (
        event.key.toLowerCase() === 'd' &&
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

    return () =>
      window.removeEventListener(
        'keydown',
        onKeyDown
      );
  }, [
    activeKey,
    toggleBookmark,
  ]);

  /* -------------------------------------------------------
     SIDEBAR RECORD GROUPING
     ------------------------------------------------------- */

  const recordsByKind = useMemo(() => {
    const groups: Record<
      WorkspaceRecordKind,
      WorkspaceTab[]
    > = {
      project: [],
      inquiry: [],
      lead: [],
      contact: [],
    };

    for (const tab of tabs) {
      groups[tab.kind].push(tab);
    }

    return groups;
  }, [tabs]);

  function sectionRecords(
    item: NavItem
  ) {
    if (!item.kind) {
      return [];
    }

    return [
      ...recordsByKind[
        item.kind
      ],
      ...(
        item.kind === 'inquiry'
          ? recordsByKind.lead
          : []
      ),
    ];
  }

  /* -------------------------------------------------------
     PAGE SEARCH
     ------------------------------------------------------- */

  const matches = useMemo(() => {
    const pages = navItems.map(
      (item) => ({
        label: item.label,
        href: item.href,
        icon: item.icon,
      })
    );

    const records = [
      ...tabs,
      ...bookmarks.filter(
        (bookmark) =>
          !tabs.some(
            (tab) =>
              tab.key ===
              bookmark.key
          )
      ),
    ].map((record) => ({
      label: record.title,
      href: record.href,
      icon:
        recordIcons[
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

  /* -------------------------------------------------------
     BREADCRUMBS
     ------------------------------------------------------- */

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
      ? recordLabels[
          routeRecord.kind
        ]
      : 'Workspace';

  const breadcrumbTitle =
    routeRecord
      ? activeTab?.title ??
        `${recordLabels[routeRecord.kind].slice(0, -1)} ${routeRecord.id.slice(0, 8)}`
      : currentPage;

  /* -------------------------------------------------------
     ACCOUNT
     ------------------------------------------------------- */

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
        '/admin/login'
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
    <RecordMetadataContext.Provider
      value={receiveMetadata}
    >
      <div
        data-workspace-density={density}
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
            transition-[width]
            duration-200
            ease-out
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
              href="/admin"
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

          {/* NAVIGATION */}

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
              navItems.map(
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
                {sections.map(
                  (section) => (
                    <div
                      key={section.id}
                    >
                      <button
                        type="button"
                        aria-expanded={
                          openSections[
                            section.id
                          ]
                        }
                        onClick={() =>
                          setOpenSections(
                            (current) => ({
                              ...current,
                              [section.id]:
                                !current[
                                  section.id
                                ],
                            })
                          )
                        }
                        className="
                          mb-2
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-lg
                          px-3
                          py-1.5
                          text-left
                          font-mono
                          text-[10px]
                          font-medium
                          uppercase
                          tracking-[0.1em]
                          text-muted-foreground
                          hover:bg-muted/50
                        "
                      >
                        {section.title}

                        <ChevronDown
                          size={13}
                          className={`
                            transition-transform
                            ${
                              openSections[
                                section.id
                              ]
                                ? ''
                                : '-rotate-90'
                            }
                          `}
                        />
                      </button>

                      {openSections[
                        section.id
                      ] && (
                        <div className="space-y-1">
                          {section.links.map(
                            (item) => {
                              const records =
                                sectionRecords(
                                  item
                                );

                              return (
                                <div
                                  key={
                                    item.href
                                  }
                                >
                                  <SidebarLink
                                    item={
                                      item
                                    }
                                    pathname={
                                      pathname
                                    }
                                    collapsed={
                                      false
                                    }
                                  />

                                  {records.length >
                                    0 && (
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
                                      {records.map(
                                        (
                                          tab
                                        ) => (
                                          <SidebarRecord
                                            key={
                                              tab.key
                                            }
                                            tab={
                                              tab
                                            }
                                            active={
                                              tab.key ===
                                              activeKey
                                            }
                                            onOpen={() =>
                                              openTab(
                                                tab
                                              )
                                            }
                                          />
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            }
                          )}
                        </div>
                      )}
                    </div>
                  )
                )}

                {/* BOOKMARKED RECORDS */}

                <div>
                  <div
                    className="
                      mb-2
                      px-3
                      font-mono
                      text-[10px]
                      font-medium
                      uppercase
                      tracking-[0.1em]
                      text-muted-foreground
                    "
                  >
                    Saved
                  </div>

                  <div className="flex items-center gap-3 px-3 py-2 text-xs font-medium text-muted-foreground">
                    <Bookmark
                      size={16}
                    />

                    Bookmarks

                    <span className="ml-auto font-mono text-[10px]">
                      {
                        bookmarks.length
                      }
                    </span>
                  </div>

                  <div className="ml-4 space-y-0.5 border-l border-border/60 pl-2">
                    {bookmarks.map(
                      (
                        bookmark
                      ) => (
                        <SidebarRecord
                          key={
                            bookmark.key
                          }
                          tab={
                            bookmark
                          }
                          active={
                            bookmark.key ===
                            activeKey
                          }
                          onOpen={() =>
                            openTab(
                              bookmark
                            )
                          }
                        />
                      )
                    )}
                  </div>
                </div>
              </>
            )}
          </nav>

          {/* SIDEBAR COLLAPSE */}

          <div className="shrink-0 border-t border-border/40 px-3 py-3">
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
              aria-expanded={
                !collapsed
              }
              className={`
                flex
                h-10
                items-center
                rounded-xl
                text-muted-foreground
                transition-colors
                hover:bg-muted
                hover:text-foreground

                ${
                  collapsed
                    ? 'mx-auto w-10 justify-center'
                    : 'w-full gap-3 px-3'
                }
              `}
            >
              {collapsed ? (
                <PanelLeftOpen
                  size={19}
                />
              ) : (
                <PanelLeftClose
                  size={18}
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
            MAIN WORKSPACE COLUMN
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
          {/* TOP BAR + BREADCRUMBS */}

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
            <div className="flex min-w-0 items-center gap-3">
              {/* MOBILE BRAND */}

              <Link
                href="/admin"
                aria-label="Bivi dashboard"
                className="flex shrink-0 items-center gap-2 md:hidden"
              >
                <Image
                  src="/images/logo.svg"
                  alt="Bivi"
                  width={186}
                  height={65}
                  className="h-auto w-[68px] dark:invert"
                />
              </Link>

              {/* DYNAMIC BREADCRUMBS */}

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
                      href={
                        routeRecord.kind ===
                        'project'
                          ? '/admin/projects'
                          : routeRecord.kind ===
                              'contact'
                            ? '/admin'
                            : '/admin/inquiries'
                      }
                      className="
                        shrink-0
                        text-muted-foreground
                        hover:text-foreground
                      "
                    >
                      {
                        breadcrumbCategory
                      }
                    </Link>

                    <ChevronRight
                      size={13}
                      className="shrink-0 text-muted-foreground"
                    />

                    <span
                      className="
                        min-w-0
                        truncate
                        font-semibold
                        text-foreground
                      "
                      title={
                        breadcrumbTitle
                      }
                    >
                      {
                        breadcrumbTitle
                      }
                    </span>
                  </>
                ) : (
                  <span className="truncate font-semibold">
                    {
                      breadcrumbTitle
                    }
                  </span>
                )}
              </nav>
            </div>

            {/* HEADER ACTIONS */}

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                aria-label="Search workspace"
                onClick={() =>
                  setSearchOpen(
                    true
                  )
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
                <Search
                  size={16}
                />

                <span className="hidden flex-1 text-left text-xs sm:block">
                  Search workspace
                </span>

                <kbd className="hidden rounded bg-card px-1.5 py-0.5 font-mono text-[10px] lg:block">
                  ⌘ K
                </kbd>
              </button>

              <ThemeToggle />

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
                    {
                      initial
                    }
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
                  <DropdownMenuLabel className="space-y-1 px-2 py-2">
                    <span className="flex items-center gap-2 text-xs font-semibold">
                      <UserRound
                        size={14}
                      />
                      Staff account
                    </span>

                    {staffEmail && (
                      <span className="block truncate text-[11px] font-normal text-muted-foreground">
                        {
                          staffEmail
                        }
                      </span>
                    )}
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    disabled={
                      signingOut
                    }
                    onSelect={() =>
                      void signOut()
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
                    <LogOut
                      size={15}
                    />

                    {signingOut
                      ? 'Signing out…'
                      : 'Sign out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* MENU BAR — TEXT ONLY */}

          <WorkspaceMenuBar
            activeTab={
              activeTab
            }
            tabs={
              tabs
            }
            bookmarks={
              bookmarks
            }
            recentlyClosed={
              recentlyClosed
            }
            openTab={
              openTab
            }
            closeTab={
              closeTab
            }
            togglePin={
              togglePin
            }
            toggleBookmark={
              toggleBookmark
            }
            reopenClosedTab={
              reopenClosedTab
            }
            closeOtherTabs={
              closeOtherTabs
            }
            closeUnpinnedTabs={
              closeUnpinnedTabs
            }
            density={
              density
            }
            onDensityChange={
              changeDensity
            }
            sidebarCollapsed={
              collapsed
            }
            onToggleSidebar={
              toggleSidebar
            }
          />

          {/* MULTI-RECORD TAB BAR */}

          <WorkspaceTabBar
            tabs={
              hydrated ? tabs : []
            }
            bookmarks={
              bookmarks
            }
            recentlyClosed={
              recentlyClosed
            }
            activeKey={
              activeKey
            }
            openTab={
              openTab
            }
            closeTab={
              closeTab
            }
            togglePin={
              togglePin
            }
            toggleBookmark={
              toggleBookmark
            }
            reopenClosedTab={
              reopenClosedTab
            }
            closeOtherTabs={
              closeOtherTabs
            }
            closeUnpinnedTabs={
              closeUnpinnedTabs
            }
          />

          {/* CONTEXTUAL RECORD NAVIGATION */}

          <RecordContextNavigation
            tab={
              activeTab
            }
            pathname={
              pathname
            }
          />

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
            {navItems.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  isActive(
                    pathname,
                    item.href
                  );

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href
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
                      gap-2
                      rounded-lg
                      px-3
                      py-2
                      text-xs
                      font-medium

                      ${
                        active
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                      }
                    `}
                  >
                    <Icon
                      size={15}
                    />

                    {
                      item.label
                    }
                  </Link>
                );
              }
            )}
          </nav>

          {/* SCROLLABLE PAGE CONTENT */}

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
              {
                children
              }
            </div>
          </main>
        </div>

        {/* ===============================================
            WORKSPACE SEARCH
            =============================================== */}

        <Dialog
          open={
            searchOpen
          }
          onOpenChange={(
            open
          ) => {
            setSearchOpen(
              open
            );

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
            <DialogTitle className="text-base font-semibold">
              Search workspace
            </DialogTitle>

            <DialogDescription className="text-xs">
              Find an open record, a bookmark, or a workspace page.
            </DialogDescription>

            <div className="flex items-center gap-2 rounded-xl bg-muted/70 px-3">
              <Search
                size={16}
                className="shrink-0 text-muted-foreground"
              />

              <input
                autoFocus
                type="search"
                aria-label="Search workspace"
                value={
                  search
                }
                onChange={(
                  event
                ) =>
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

            <div className="max-h-80 space-y-1 overflow-y-auto scrollbar-transparent">
              {matches.map(
                (item) => {
                  const Icon =
                    item.icon;

                  return (
                    <Link
                      key={
                        item.href
                      }
                      href={
                        item.href
                      }
                      onClick={() => {
                        setSearchOpen(
                          false
                        );

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
                      />

                      <span className="min-w-0 truncate">
                        {
                          item.label
                        }
                      </span>
                    </Link>
                  );
                }
              )}

              {!matches.length && (
                <p className="py-5 text-center text-xs text-muted-foreground">
                  No matching pages or records.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* LOGOUT ERROR */}

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
            {
              logoutError
            }
          </div>
        )}
      </div>
    </RecordMetadataContext.Provider>
  );
}
