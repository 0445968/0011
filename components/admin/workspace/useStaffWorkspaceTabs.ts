
'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

export type WorkspaceRecordKind =
  | 'project'
  | 'inquiry'
  | 'lead'
  | 'contact';

export interface WorkspaceTab {
  key: string;
  id: string;
  kind: WorkspaceRecordKind;
  title: string;
  href: string;
  pinned: boolean;
  lastOpenedAt: number;
  recordType?: string;
  status?: string;
  dueDate?: string;
}

export interface WorkspaceBookmark {
  key: string;
  id: string;
  kind: WorkspaceRecordKind;
  title: string;
  href: string;
  recordType?: string;
}

export interface WorkspaceRecordMetadata {
  kind: WorkspaceRecordKind;
  id: string;
  title: string;
  recordType?: string;
  status?: string;
  dueDate?: string;
}

interface WorkspaceSnapshot {
  tabs: WorkspaceTab[];
  bookmarks: WorkspaceBookmark[];
  recentlyClosed: WorkspaceTab[];
}

const STORAGE_PREFIX =
  'bivi-staff-workspace-v2';

const MAX_OPEN_TABS = 30;
const MAX_BOOKMARKS = 100;
const MAX_RECENTLY_CLOSED = 10;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const RECORD_KINDS: WorkspaceRecordKind[] = [
  'project',
  'inquiry',
  'lead',
  'contact',
];

function emptySnapshot(): WorkspaceSnapshot {
  return {
    tabs: [],
    bookmarks: [],
    recentlyClosed: [],
  };
}

function canonicalKind(
  kind: WorkspaceRecordKind
): WorkspaceRecordKind {
  return kind === 'lead'
    ? 'inquiry'
    : kind;
}

function isRecordKind(
  value: unknown
): value is WorkspaceRecordKind {
  return RECORD_KINDS.includes(
    value as WorkspaceRecordKind
  );
}

function fallbackTitle(
  kind: WorkspaceRecordKind
): string {
  switch (kind) {
    case 'project':
      return 'Project';
    case 'inquiry':
    case 'lead':
      return 'Inquiry';
    case 'contact':
      return 'Contact';
  }
}

function normalizeTitle(
  title: string,
  kind: WorkspaceRecordKind
): string {
  const clean = title.trim().slice(0, 180);

  // Replace old automatic UUID-based labels.
  if (
    /^(Project|Inquiry|Contact) [0-9a-f]{8}$/i.test(
      clean
    )
  ) {
    return fallbackTitle(kind);
  }

  return clean || fallbackTitle(kind);
}

/* =========================================================
   STAFF SUBDOMAIN ROUTING
   ========================================================= */

export function normalizeStaffPath(
  pathname: string
): string {
  if (pathname === '/admin') {
    return '/';
  }

  if (pathname.startsWith('/admin/')) {
    return pathname.slice('/admin'.length);
  }

  return pathname;
}

export function getWorkspaceRecordHref(
  kind: WorkspaceRecordKind,
  id: string
): string {
  switch (kind) {
    case 'project':
      return `/projects/${id}`;
    case 'inquiry':
    case 'lead':
      return `/leads/${id}`;
    case 'contact':
      return `/contacts/${id}`;
  }
}

export function getWorkspaceRecordFromPath(
  pathname: string
): {
  key: string;
  id: string;
  kind: WorkspaceRecordKind;
  href: string;
} | null {
  const clean = normalizeStaffPath(
    pathname.split(/[?#]/)[0]
  );

  const segments = clean
    .split('/')
    .filter(Boolean);

  const section = segments[0];
  const id = segments[1];

  if (!id || !UUID_PATTERN.test(id)) {
    return null;
  }

  let kind: WorkspaceRecordKind;

  switch (section) {
    case 'projects':
      kind = 'project';
      break;
    case 'inquiries':
    case 'leads':
      kind = 'inquiry';
      break;
    case 'contacts':
      kind = 'contact';
      break;
    default:
      return null;
  }

  return {
    key: `${kind}:${id}`,
    id,
    kind,
    href: getWorkspaceRecordHref(kind, id),
  };
}

function safeTabHref(
  href: string,
  kind: WorkspaceRecordKind,
  id: string
): string {
  const fallback =
    getWorkspaceRecordHref(kind, id);

  if (
    !href.startsWith('/') ||
    href.startsWith('//') ||
    href.includes('\\')
  ) {
    return fallback;
  }

  const clean = normalizeStaffPath(href);
  const record =
    getWorkspaceRecordFromPath(clean);

  if (
    !record ||
    record.id !== id ||
    record.kind !== canonicalKind(kind)
  ) {
    return fallback;
  }

  return clean;
}

/* =========================================================
   VALIDATE STORED DATA
   ========================================================= */

function validTab(
  value: unknown
): value is WorkspaceTab {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item = value as Partial<WorkspaceTab>;

  return (
    typeof item.key === 'string' &&
    typeof item.id === 'string' &&
    UUID_PATTERN.test(item.id) &&
    isRecordKind(item.kind) &&
    item.key === `${item.kind}:${item.id}` &&
    typeof item.title === 'string' &&
    item.title.length > 0 &&
    item.title.length <= 180 &&
    typeof item.href === 'string' &&
    typeof item.pinned === 'boolean' &&
    typeof item.lastOpenedAt === 'number' &&
    Number.isFinite(item.lastOpenedAt)
  );
}

function validBookmark(
  value: unknown
): value is WorkspaceBookmark {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const item =
    value as Partial<WorkspaceBookmark>;

  return (
    typeof item.key === 'string' &&
    typeof item.id === 'string' &&
    UUID_PATTERN.test(item.id) &&
    isRecordKind(item.kind) &&
    item.key === `${item.kind}:${item.id}` &&
    typeof item.title === 'string' &&
    item.title.length > 0 &&
    item.title.length <= 180 &&
    typeof item.href === 'string'
  );
}

/* =========================================================
   STORAGE
   ========================================================= */

function restoreSnapshot(
  storageKey: string
): WorkspaceSnapshot {
  try {
    const raw = localStorage.getItem(
      storageKey
    );

    if (!raw) {
      return emptySnapshot();
    }

    const parsed = JSON.parse(
      raw
    ) as Partial<WorkspaceSnapshot>;

    const tabs = Array.isArray(parsed.tabs)
      ? parsed.tabs
          .filter(validTab)
          .slice(0, MAX_OPEN_TABS)
          .map((tab) => ({
            ...tab,
            title: normalizeTitle(
              tab.title,
              tab.kind
            ),
            href: safeTabHref(
              tab.href,
              tab.kind,
              tab.id
            ),
          }))
      : [];

    const bookmarks = Array.isArray(
      parsed.bookmarks
    )
      ? parsed.bookmarks
          .filter(validBookmark)
          .slice(0, MAX_BOOKMARKS)
          .map((bookmark) => ({
            ...bookmark,
            title: normalizeTitle(
              bookmark.title,
              bookmark.kind
            ),
            href: getWorkspaceRecordHref(
              bookmark.kind,
              bookmark.id
            ),
          }))
      : [];

    const recentlyClosed = Array.isArray(
      parsed.recentlyClosed
    )
      ? parsed.recentlyClosed
          .filter(validTab)
          .slice(0, MAX_RECENTLY_CLOSED)
          .map((tab) => ({
            ...tab,
            title: normalizeTitle(
              tab.title,
              tab.kind
            ),
            href: safeTabHref(
              tab.href,
              tab.kind,
              tab.id
            ),
          }))
      : [];

    return {
      tabs,
      bookmarks,
      recentlyClosed,
    };
  } catch {
    return emptySnapshot();
  }
}

function rememberClosed(
  existing: WorkspaceTab[],
  tab: WorkspaceTab
): WorkspaceTab[] {
  return [
    tab,
    ...existing.filter(
      (item) => item.key !== tab.key
    ),
  ].slice(0, MAX_RECENTLY_CLOSED);
}

/*
 * Preserve the order of existing tabs.
 * Only a new record may be appended.
 */
function limitTabs(
  tabs: WorkspaceTab[]
): WorkspaceTab[] {
  if (tabs.length <= MAX_OPEN_TABS) {
    return tabs;
  }

  const removable = tabs.findIndex(
    (tab) => !tab.pinned
  );

  if (removable === -1) {
    return tabs.slice(0, MAX_OPEN_TABS);
  }

  return tabs.filter(
    (_, index) => index !== removable
  );
}

/* =========================================================
   WORKSPACE TABS HOOK
   ========================================================= */

export function useStaffWorkspaceTabs(
  staffId: string
) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [snapshot, setSnapshot] =
    useState<WorkspaceSnapshot>(
      emptySnapshot
    );

  const [hydrated, setHydrated] =
    useState(false);

  const storageKey = useMemo(
    () => `${STORAGE_PREFIX}:${staffId}`,
    [staffId]
  );

  const queryString = searchParams.toString();

  const routeRecord = useMemo(
    () =>
      getWorkspaceRecordFromPath(
        pathname
      ),
    [pathname]
  );

  const activeKey =
    routeRecord?.key ?? null;

  /* =======================================================
     LOAD PERSISTED WORKSPACE
     ======================================================= */

  useEffect(() => {
    setHydrated(false);
    setSnapshot(
      restoreSnapshot(storageKey)
    );
    setHydrated(true);
  }, [storageKey]);

  /* =======================================================
     CREATE TABS AUTOMATICALLY
     ======================================================= */

  useEffect(() => {
    if (!hydrated || !routeRecord) {
      return;
    }

    const cleanPath = normalizeStaffPath(
      pathname
    );

    const href = safeTabHref(
      queryString
        ? `${cleanPath}?${queryString}`
        : cleanPath,
      routeRecord.kind,
      routeRecord.id
    );

    setSnapshot((current) => {
      const existing =
        current.tabs.find(
          (tab) =>
            tab.key === routeRecord.key
        );

      if (existing) {
        if (existing.href === href) {
          return current;
        }

        /*
         * IMPORTANT:
         * Update in place.
         * Never remove and append the active tab.
         */

        return {
          ...current,
          tabs: current.tabs.map(
            (tab) =>
              tab.key === routeRecord.key
                ? {
                    ...tab,
                    href,
                    lastOpenedAt: Date.now(),
                  }
                : tab
          ),
        };
      }

      const bookmark =
        current.bookmarks.find(
          (item) =>
            item.key === routeRecord.key
        );

      const newTab: WorkspaceTab = {
        key: routeRecord.key,
        id: routeRecord.id,
        kind: routeRecord.kind,
        title:
          bookmark?.title ??
          fallbackTitle(routeRecord.kind),
        href,
        pinned: false,
        lastOpenedAt: Date.now(),
        recordType: bookmark?.recordType,
      };

      return {
        ...current,
        tabs: limitTabs([
          ...current.tabs,
          newTab,
        ]),
        recentlyClosed:
          current.recentlyClosed.filter(
            (tab) =>
              tab.key !== routeRecord.key
          ),
      };
    });
  }, [
    hydrated,
    routeRecord,
    pathname,
    queryString,
  ]);

  /* =======================================================
     SAVE
     ======================================================= */

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(snapshot)
      );
    } catch {
      // Workspace remains usable.
    }
  }, [
    hydrated,
    snapshot,
    storageKey,
  ]);

  /* =======================================================
     CROSS-WINDOW SYNC
     ======================================================= */

  useEffect(() => {
    function handleStorage(
      event: StorageEvent
    ) {
      if (event.key !== storageKey) {
        return;
      }

      setSnapshot(
        restoreSnapshot(storageKey)
      );
    }

    window.addEventListener(
      'storage',
      handleStorage
    );

    return () => {
      window.removeEventListener(
        'storage',
        handleStorage
      );
    };
  }, [storageKey]);

  /* =======================================================
     OPEN OR SWITCH TABS
     ======================================================= */

  const openTab = useCallback(
    (
      tab: WorkspaceTab |
        WorkspaceBookmark
    ) => {
      /*
       * If already open, return to its last
       * location without changing tab order.
       */

      const currentTab =
        snapshot.tabs.find(
          (item) =>
            item.key === tab.key
        );

      const href = safeTabHref(
        currentTab?.href ?? tab.href,
        tab.kind,
        tab.id
      );

      setSnapshot((current) => {
        const existing =
          current.tabs.find(
            (item) =>
              item.key === tab.key
          );

        if (existing) {
          /*
           * Update the existing tab at its
           * current index. Do not sort by
           * lastOpenedAt.
           */

          return {
            ...current,
            tabs: current.tabs.map(
              (item) =>
                item.key === tab.key
                  ? {
                      ...item,
                      href,
                      lastOpenedAt: Date.now(),
                    }
                  : item
            ),
            recentlyClosed:
              current.recentlyClosed.filter(
                (item) =>
                  item.key !== tab.key
              ),
          };
        }

        const newTab: WorkspaceTab = {
          ...tab,
          href,
          pinned:
            'pinned' in tab
              ? tab.pinned
              : false,
          lastOpenedAt: Date.now(),
        };

        return {
          ...current,
          tabs: limitTabs([
            ...current.tabs,
            newTab,
          ]),
          recentlyClosed:
            current.recentlyClosed.filter(
              (item) =>
                item.key !== tab.key
            ),
        };
      });

      router.push(href);
    },
    [
      router,
      snapshot.tabs,
    ]
  );

  /* =======================================================
     CLOSE TAB
     ======================================================= */

  const closeTab = useCallback(
    (key: string) => {
      const closing =
        snapshot.tabs.find(
          (tab) =>
            tab.key === key
        );

      if (!closing || closing.pinned) {
        return;
      }

      const remaining =
        snapshot.tabs.filter(
          (tab) =>
            tab.key !== key
        );

      setSnapshot((current) => ({
        ...current,
        tabs: current.tabs.filter(
          (tab) =>
            tab.key !== key
        ),
        recentlyClosed: rememberClosed(
          current.recentlyClosed,
          closing
        ),
      }));

      if (activeKey === key) {
        const next =
          remaining[
            remaining.length - 1
          ];

        router.push(
          next?.href ?? '/projects'
        );
      }
    },
    [
      snapshot.tabs,
      activeKey,
      router,
    ]
  );

  /* =======================================================
     PINNING
     ======================================================= */

  const togglePin = useCallback(
    (key: string) => {
      setSnapshot((current) => ({
        ...current,
        tabs: current.tabs.map(
          (tab) =>
            tab.key === key
              ? {
                  ...tab,
                  pinned: !tab.pinned,
                }
              : tab
        ),
      }));
    },
    []
  );

  /* =======================================================
     BOOKMARKS
     ======================================================= */

  const toggleBookmark = useCallback(
    (key: string) => {
      setSnapshot((current) => {
        const exists =
          current.bookmarks.some(
            (item) =>
              item.key === key
          );

        if (exists) {
          return {
            ...current,
            bookmarks:
              current.bookmarks.filter(
                (item) =>
                  item.key !== key
              ),
          };
        }

        const tab =
          current.tabs.find(
            (item) =>
              item.key === key
          );

        if (!tab) {
          return current;
        }

        const bookmark:
          WorkspaceBookmark = {
          key: tab.key,
          id: tab.id,
          kind: tab.kind,
          title: tab.title,
          recordType: tab.recordType,
          href: getWorkspaceRecordHref(
            tab.kind,
            tab.id
          ),
        };

        return {
          ...current,
          bookmarks: [
            ...current.bookmarks,
            bookmark,
          ].slice(0, MAX_BOOKMARKS),
        };
      });
    },
    []
  );

  /* =======================================================
     REOPEN CLOSED
     ======================================================= */

  const reopenClosedTab =
    useCallback(() => {
      const tab =
        snapshot.recentlyClosed[0];

      if (tab) {
        openTab(tab);
      }
    }, [
      snapshot.recentlyClosed,
      openTab,
    ]);

  /* =======================================================
     CLOSE OTHER TABS
     ======================================================= */

  const closeOtherTabs =
    useCallback(() => {
      setSnapshot((current) => {
        const toClose =
          current.tabs.filter(
            (tab) =>
              tab.key !== activeKey &&
              !tab.pinned
          );

        let recentlyClosed =
          current.recentlyClosed;

        for (const tab of toClose) {
          recentlyClosed =
            rememberClosed(
              recentlyClosed,
              tab
            );
        }

        return {
          ...current,
          tabs: current.tabs.filter(
            (tab) =>
              tab.key === activeKey ||
              tab.pinned
          ),
          recentlyClosed,
        };
      });
    }, [activeKey]);

  /* =======================================================
     CLOSE UNPINNED TABS
     ======================================================= */

  const closeUnpinnedTabs =
    useCallback(() => {
      setSnapshot((current) => {
        const toClose =
          current.tabs.filter(
            (tab) =>
              !tab.pinned &&
              tab.key !== activeKey
          );

        let recentlyClosed =
          current.recentlyClosed;

        for (const tab of toClose) {
          recentlyClosed =
            rememberClosed(
              recentlyClosed,
              tab
            );
        }

        return {
          ...current,
          tabs: current.tabs.filter(
            (tab) =>
              tab.pinned ||
              tab.key === activeKey
          ),
          recentlyClosed,
        };
      });
    }, [activeKey]);

  /* =======================================================
     REAL COMPANY / RECORD METADATA
     ======================================================= */

  const registerRecord =
    useCallback(
      (
        metadata:
          WorkspaceRecordMetadata
      ) => {
        if (
          !UUID_PATTERN.test(
            metadata.id
          )
        ) {
          return;
        }

        const kind =
          canonicalKind(
            metadata.kind
          );

        const key =
          `${kind}:${metadata.id}`;

        const title = normalizeTitle(
          metadata.title,
          kind
        );

        const recordType =
          metadata.recordType
            ?.trim()
            .slice(0, 100) ||
          undefined;

        setSnapshot((current) => {
          let changed = false;

          const tabs =
            current.tabs.map(
              (tab) => {
                if (tab.key !== key) {
                  return tab;
                }

                const next = {
                  ...tab,
                  title,
                  recordType:
                    recordType ??
                    tab.recordType,
                  status:
                    metadata.status ??
                    tab.status,
                  dueDate:
                    metadata.dueDate ??
                    tab.dueDate,
                };

                if (
                  next.title === tab.title &&
                  next.recordType ===
                    tab.recordType &&
                  next.status ===
                    tab.status &&
                  next.dueDate ===
                    tab.dueDate
                ) {
                  return tab;
                }

                changed = true;
                return next;
              }
            );

          const bookmarks =
            current.bookmarks.map(
              (bookmark) => {
                if (
                  bookmark.key !== key
                ) {
                  return bookmark;
                }

                if (
                  bookmark.title === title &&
                  (
                    !recordType ||
                    bookmark.recordType ===
                      recordType
                  )
                ) {
                  return bookmark;
                }

                changed = true;

                return {
                  ...bookmark,
                  title,
                  recordType:
                    recordType ??
                    bookmark.recordType,
                };
              }
            );

          return changed
            ? {
                ...current,
                tabs,
                bookmarks,
              }
            : current;
        });
      },
      []
    );

  /* =======================================================
     DERIVED DATA
     ======================================================= */

  /*
   * Pinned tabs group first.
   *
   * Relative order within each group is
   * preserved. Clicking a tab never moves it.
   */

  const tabs = useMemo(() => {
    const pinned =
      snapshot.tabs.filter(
        (tab) => tab.pinned
      );

    const unpinned =
      snapshot.tabs.filter(
        (tab) => !tab.pinned
      );

    return [
      ...pinned,
      ...unpinned,
    ];
  }, [snapshot.tabs]);

  const activeTab = useMemo(
    () =>
      tabs.find(
        (tab) =>
          tab.key === activeKey
      ) ?? null,
    [
      tabs,
      activeKey,
    ]
  );

  return {
    hydrated,

    tabs,
    bookmarks:
      snapshot.bookmarks,
    recentlyClosed:
      snapshot.recentlyClosed,

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
  };
}
