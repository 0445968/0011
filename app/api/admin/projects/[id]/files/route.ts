
import { z } from 'zod';

import {
  getStaffAccess,
} from '@/lib/admin/auth';

import {
  adminReply,
} from '@/lib/admin/http';

import {
  fileCommand,
} from '@/lib/files/http';

/* =========================================================
   CONFIGURATION
   ========================================================= */

export const dynamic = 'force-dynamic';

const MAX_RECENT_FILES = 10;

interface RouteContext {
  params: {
    id: string;
  };
}

/* =========================================================
   GET — RECENT PROJECT FILES
   ========================================================= */

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  /* =======================================================
     AUTHENTICATE STAFF
     ======================================================= */

  const access = await getStaffAccess();

  if (!access.allowed) {
    return adminReply(
      {
        error: 'Staff access is required.',
      },
      access.status
    );
  }

  /* =======================================================
     VALIDATE PROJECT ID
     ======================================================= */

  const parsedId = z
    .string()
    .uuid()
    .safeParse(params.id);

  if (!parsedId.success) {
    return adminReply(
      {
        error: 'Project not found.',
      },
      404
    );
  }

  const projectId = parsedId.data;

  /* =======================================================
     QUERY VERIFIED FILES
     ======================================================= */

  try {
    const {
      data,
      error,
    } = await access.client
      .from('project_files')
      .select(
        'id, filename, updated_at'
      )
      .eq(
        'request_id',
        projectId
      )
      .eq(
        'state',
        'ready'
      )
      .order(
        'updated_at',
        {
          ascending: false,
        }
      )
      .limit(
        MAX_RECENT_FILES
      );

    if (error) {
      return adminReply(
        {
          error:
            'Recent project files could not be loaded.',
        },
        503
      );
    }

    /* =====================================================
       FORMAT MENU RESOURCES
       ===================================================== */

    const recordKey =
      `project:${projectId}`;

    const files = (data ?? []).map(
      (file) => ({
        id: file.id,
        title: file.filename,
        updatedAt: file.updated_at,
        recordKey,
      })
    );

    /* =====================================================
       RETURN
       ===================================================== */

    return adminReply({
      files,
    });
  } catch {
    return adminReply(
      {
        error:
          'Recent project files could not be loaded.',
      },
      503
    );
  }
}

/* =========================================================
   POST — EXISTING PROJECT FILE COMMANDS
   ========================================================= */

/*
 * Preserve existing behavior for:
 *
 * - Reserve upload
 * - Finalize upload
 * - Share file
 * - Make file private
 * - Withdraw file
 *
 * Authentication, validation, storage
 * operations, and permissions remain
 * managed by the existing fileCommand.
 */

export function POST(
  request: Request,
  { params }: RouteContext
) {
  return fileCommand(
    request,
    params.id,
    true
  );
}
