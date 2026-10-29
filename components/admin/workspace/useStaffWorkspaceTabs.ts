
'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  useRef,
} from 'react';

import {
  usePathname,
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  canonicalKind,canonicalRecordId, recordDefinitions, isWorkspaceRecordId, normalizeStaffPath, liveStaffDestinations, reorderWorkspaceTabs,
  getWorkspaceRecordHref, getWorkspaceRecordFromPath,
  type WorkspaceRecordKind,
} from '@/lib/admin/workspace/navigation';
export { normalizeStaffPath, getWorkspaceRecordHref, getWorkspaceRecordFromPath } from '@/lib/admin/workspace/navigation';
import { guardWorkspaceNavigation } from './WorkspaceNavigationGuard';
export type { WorkspaceRecordKind } from '@/lib/admin/workspace/navigation';

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

const RECORD_KINDS: WorkspaceRecordKind[] = [
  'project','task',
  'inquiry',
  'lead',
  'contact',
  'company',
];

function emptySnapshot(): WorkspaceSnapshot {
  return {
    tabs: [],
    bookmarks: [],
    recentlyClosed: [],
  };
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
    case 'task':return 'Task';
    case 'project':
      return 'Project';
    case 'inquiry':
    case 'lead':
      return 'Inquiry';
    case 'contact':
      return 'Person';
    case 'company':
      return 'Company';
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
    record.id !== (kind==='task'?id:id.toLowerCase()) ||
    record.kind !== canonicalKind(kind)
  ) {
    return fallback;
  }

  return clean.replace(`/inquiries/${id}`, `/leads/${id}`);
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
    isWorkspaceRecordId(item.kind as WorkspaceRecordKind, item.id) &&
    isRecordKind(item.kind) &&
    liveStaffDestinations.some(destination => destination.kind === canonicalKind(item.kind!)) &&
    item.key === `${item.kind}:${item.id}` &&
    typeof item.title === 'string' &&
    item.title.length > 0 &&
    item.title.length <= 180 &&
    typeof item.href === 'string' &&
    (item.recordType === undefined || typeof item.recordType === 'string') &&
    (item.status === undefined || typeof item.status === 'string') &&
    (item.dueDate === undefined || typeof item.dueDate === 'string') &&
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
    isWorkspaceRecordId(item.kind as WorkspaceRecordKind, item.id) &&
    isRecordKind(item.kind) &&
    liveStaffDestinations.some(destination => destination.kind === canonicalKind(item.kind!)) &&
    item.key === `${item.kind}:${item.id}` &&
    typeof item.title === 'string' &&
    item.title.length > 0 &&
    item.title.length <= 180 &&
    typeof item.href === 'string' &&
    (item.recordType === undefined || typeof item.recordType === 'string')
  );
}

/* =========================================================
   STORAGE
   ========================================================= */

export function restoreSnapshot(
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
          .map((item) => ({ ...item, kind: canonicalKind(item.kind), id: canonicalRecordId(item.kind,item.id), key: `${canonicalKind(item.kind)}:${canonicalRecordId(item.kind,item.id)}` }))
          .filter((item, index, all) => all.findIndex(other => other.key === item.key) === index)
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
          .map((item) => ({ ...item, kind: canonicalKind(item.kind), id: canonicalRecordId(item.kind,item.id), key: `${canonicalKind(item.kind)}:${canonicalRecordId(item.kind,item.id)}` }))
          .filter((item, index, all) => all.findIndex(other => other.key === item.key) === index)
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
          .map((item) => ({ ...item, kind: canonicalKind(item.kind), id: canonicalRecordId(item.kind,item.id), key: `${canonicalKind(item.kind)}:${canonicalRecordId(item.kind,item.id)}` }))
          .filter((item, index, all) => all.findIndex(other => other.key === item.key) === index)
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
export function limitTabs(
  tabs: WorkspaceTab[]
): WorkspaceTab[] {
  if (tabs.length <= MAX_OPEN_TABS) {
    return tabs;
  }

  const removable = tabs.findIndex(
    (tab, index) => !tab.pinned && index !== tabs.length - 1
  );

  if (removable === -1) {
    return tabs; // Never evict a pinned record; a newly visited active record stays visible.
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
  const [navigating, startNavigation] = useTransition();

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
        queryString?pathname+'?'+queryString:pathname
      ),
    [pathname,queryString]
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

  useEffect(() => {
    function forgetUnavailable(event: Event) {
      const key = (event as CustomEvent<unknown>).detail;
      if (typeof key !== 'string') return;
      setSnapshot(current => ({
        tabs: current.tabs.filter(tab => tab.key !== key),
        bookmarks: current.bookmarks.filter(tab => tab.key !== key),
        recentlyClosed: current.recentlyClosed.filter(tab => tab.key !== key),
      }));
    }
    window.addEventListener('bivi:workspace-record-unavailable', forgetUnavailable);
    return () => window.removeEventListener('bivi:workspace-record-unavailable', forgetUnavailable);
  }, []);

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

      guardWorkspaceNavigation(() => {
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

        startNavigation(() => router.push(href));
      });
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

      const performClose = () => {
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

          router.push(next?.href ?? recordDefinitions[closing.kind].directory);
        }
      };
      if (activeKey === key) guardWorkspaceNavigation(performClose);
      else performClose();
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

  const pinRecord = useCallback((record: WorkspaceTab | WorkspaceBookmark) => {
    setSnapshot(current => {
      const found = current.tabs.find(tab => tab.key === record.key);
      if (found) return { ...current, tabs: current.tabs.map(tab => tab.key === record.key ? { ...tab, pinned: !tab.pinned } : tab) };
      return { ...current, tabs: limitTabs([...current.tabs, { ...record, pinned: true, lastOpenedAt: Date.now() }]), recentlyClosed: current.recentlyClosed.filter(tab => tab.key !== record.key) };
    });
  }, []);

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
          !isWorkspaceRecordId(metadata.kind, metadata.id)
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

  const tabs = snapshot.tabs;
  const reorderTabs = useCallback((active: string, over: string) => {
    setSnapshot(current => {
      const next = reorderWorkspaceTabs(current.tabs, active, over);
      return next === current.tabs ? current : { ...current, tabs: next };
    });
  }, []);
  const prefetched = useRef(new Set<string>());
  const prefetchTab = useCallback((href: string) => {
    if (prefetched.current.has(href)) return;
    prefetched.current.add(href);
    router.prefetch(href);
  }, [router]);
  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setTimeout(() => {
      tabs.filter(tab => tab.key !== activeKey).slice(0, 3).forEach(tab => prefetchTab(tab.href));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [hydrated, tabs, activeKey, prefetchTab]);

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
    reorderTabs,
    prefetchTab,
    pinRecord,
    navigating,
    reopenClosedTab,
    closeOtherTabs,
    closeUnpinnedTabs,
    registerRecord,
  };
}
