
'use client';

import {
  useEffect,
  useRef,
} from 'react';

import type {
  WorkspaceMenuResource,
} from './WorkspaceMenuBar';

import type {
  WorkspaceTab,
} from './useStaffWorkspaceTabs';

/* =========================================================
   TYPES
   ========================================================= */

interface WorkspaceRecentFilesProps {
  activeTab: WorkspaceTab | null;

  onFilesChange: (
    files:
      | WorkspaceMenuResource[]
      | undefined
  ) => void;

  onError?: (
    message: string | null
  ) => void;

  refreshKey?: number;
}

interface RecentFilesResponse {
  files: WorkspaceMenuResource[];
  error?: string;
}

/* =========================================================
   CONFIGURATION
   ========================================================= */

const MAX_RECENT_FILES = 10;

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* =========================================================
   VALIDATION
   ========================================================= */

function isValidResource(
  value: unknown,
  recordKey: string
): value is WorkspaceMenuResource {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const item =
    value as Partial<WorkspaceMenuResource>;

  return (
    typeof item.id === 'string' &&
    UUID_PATTERN.test(item.id) &&
    typeof item.title === 'string' &&
    item.title.trim().length > 0 &&
    item.title.length <= 180 &&
    item.recordKey === recordKey
  );
}

/* =========================================================
   SORT RECENT FILES
   ========================================================= */

function sortRecentFiles(
  files: WorkspaceMenuResource[]
) {
  return [...files]
    .sort((a, b) => {
      const aTime = a.updatedAt
        ? Date.parse(a.updatedAt)
        : 0;

      const bTime = b.updatedAt
        ? Date.parse(b.updatedAt)
        : 0;

      const safeA =
        Number.isFinite(aTime)
          ? aTime
          : 0;

      const safeB =
        Number.isFinite(bTime)
          ? bTime
          : 0;

      return safeB - safeA;
    })
    .slice(0, MAX_RECENT_FILES);
}

/* =========================================================
   AUTHENTICATED FILE DOWNLOAD
   ========================================================= */

/*
 * The existing file download API validates
 * staff access and returns a short-lived
 * signed download URL.
 *
 * Never construct Supabase Storage URLs
 * directly from client-side file metadata.
 */

export async function getWorkspaceFileDownloadUrl(
  projectId: string,
  fileId: string
): Promise<string> {
  if (
    !UUID_PATTERN.test(projectId) ||
    !UUID_PATTERN.test(fileId)
  ) {
    throw new Error(
      'Invalid project or file.'
    );
  }

  const response = await fetch(
    `/api/admin/projects/${projectId}/files/${fileId}/download`,
    {
      method: 'POST',
      credentials: 'same-origin',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '{}',
      signal: AbortSignal.timeout(30000),
    }
  );

  if (!response.ok) {
    throw new Error(
      response.status === 401 ||
      response.status === 403
        ? 'Staff access is required to download this file.'
        : 'The file could not be downloaded.'
    );
  }

  const data: unknown =
    await response.json();

  if (
    !data ||
    typeof data !== 'object' ||
    !('url' in data) ||
    typeof data.url !== 'string'
  ) {
    throw new Error(
      'The download link is unavailable.'
    );
  }

  const signedUrl = new URL(
    data.url,
    window.location.origin
  );

  const isLocalHttp =
    signedUrl.protocol === 'http:' &&
    (
      signedUrl.hostname === 'localhost' ||
      signedUrl.hostname === '127.0.0.1'
    );

  if (
    signedUrl.protocol !== 'https:' &&
    !isLocalHttp
  ) {
    throw new Error(
      'The download link is invalid.'
    );
  }

  return signedUrl.href;
}

/* =========================================================
   RECENT FILES DATA PROVIDER
   ========================================================= */

export function WorkspaceRecentFiles({
  activeTab,
  onFilesChange,
  onError,
  refreshKey = 0,
}: WorkspaceRecentFilesProps) {
  /*
   * Store the latest callback references so
   * changes to parent render functions do not
   * cause repeated network requests.
   */

  const onFilesChangeRef =
    useRef(onFilesChange);

  const onErrorRef =
    useRef(onError);

  useEffect(() => {
    onFilesChangeRef.current =
      onFilesChange;

    onErrorRef.current =
      onError;
  });

  /* =======================================================
     ACTIVE PROJECT
     ======================================================= */

  const projectId =
    activeTab?.kind === 'project'
      ? activeTab.id
      : null;

  /* =======================================================
     LOAD FILES
     ======================================================= */

  useEffect(() => {
    let mounted = true;

    let requestNumber = 0;

    let activeController:
      | AbortController
      | null = null;

    /*
     * Clear the previous project's files
     * immediately when the active record
     * changes.
     */

    onFilesChangeRef.current(
      undefined
    );

    onErrorRef.current?.(null);

    if (
      !projectId ||
      !UUID_PATTERN.test(projectId)
    ) {
      return;
    }

    const recordKey =
      `project:${projectId}`;

    async function loadFiles() {
      const requestId =
        ++requestNumber;

      activeController?.abort();

      const controller =
        new AbortController();

      activeController =
        controller;

      try {
        const response = await fetch(
          `/api/admin/projects/${projectId}/files`,
          {
            method: 'GET',
            credentials: 'same-origin',
            cache: 'no-store',
            headers: {
              Accept: 'application/json',
            },
            signal:
              controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 401 ||
            response.status === 403
              ? 'Staff access is required to view project files.'
              : 'Recent files could not be loaded.'
          );
        }

        const data =
          (await response.json()) as RecentFilesResponse;

        if (
          !data ||
          !Array.isArray(
            data.files
          )
        ) {
          throw new Error(
            'The recent file response is invalid.'
          );
        }

        const validFiles =
          data.files.filter(
            (file) =>
              isValidResource(
                file,
                recordKey
              )
          );

        if (
          !mounted ||
          controller.signal.aborted ||
          requestId !== requestNumber
        ) {
          return;
        }

        const sortedFiles =
          sortRecentFiles(
            validFiles
          );

        onFilesChangeRef.current(
          sortedFiles
        );

        onErrorRef.current?.(null);
      } catch (error) {
        if (
          !mounted ||
          controller.signal.aborted ||
          requestId !== requestNumber
        ) {
          return;
        }

        onFilesChangeRef.current(
          undefined
        );

        onErrorRef.current?.(
          error instanceof Error
            ? error.message
            : 'Recent files could not be loaded.'
        );
      }
    }

    /* =====================================================
       REFRESH ON RETURN TO WORKSPACE
       ===================================================== */

    function handleWindowFocus() {
      if (
        document.visibilityState ===
        'visible'
      ) {
        void loadFiles();
      }
    }

    function handleVisibilityChange() {
      if (
        document.visibilityState ===
        'visible'
      ) {
        void loadFiles();
      }
    }

    void loadFiles();

    window.addEventListener(
      'focus',
      handleWindowFocus
    );

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    /* =====================================================
       CLEANUP
       ===================================================== */

    return () => {
      mounted = false;

      ++requestNumber;

      activeController?.abort();

      window.removeEventListener(
        'focus',
        handleWindowFocus
      );

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [
    projectId,
    refreshKey,
  ]);

  /*
   * Data-only component.
   *
   * It does not create an additional panel
   * or take up space in the workspace.
   */

  return null;
}
