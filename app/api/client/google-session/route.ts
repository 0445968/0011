import { z } from 'zod';

import {
  createStaffClient,
  staffAuthConfigured,
} from '@/lib/admin/auth';

import {
  authorizeClient,
  CLIENT_COOKIE,
} from '@/lib/portal/auth';

import {
  adminReply,
  isSameOrigin,
  readAdminJson,
} from '@/lib/admin/http';

const bodySchema = z
  .object({
    credential: z
      .string()
      .min(100)
      .max(10000),
  })
  .strict();

export async function POST(
  request: Request
) {
  /*
   * Only accept requests originating
   * from the Bivi application.
   */
  if (!isSameOrigin(request)) {
    return adminReply(
      {
        error:
          'Sign in from the Bivi client portal.',
      },
      403
    );
  }

  if (!staffAuthConfigured()) {
    return adminReply(
      {
        error:
          'Client sign-in is not configured yet.',
      },
      503
    );
  }

  let raw: unknown;

  try {
    raw =
      await readAdminJson(request);
  } catch {
    return adminReply(
      {
        error:
          'Google sign-in could not be verified.',
      },
      400
    );
  }

  const parsed =
    bodySchema.safeParse(raw);

  if (!parsed.success) {
    return adminReply(
      {
        error:
          'Google sign-in could not be verified.',
      },
      400
    );
  }

  try {
    /*
     * Authenticate the Google ID
     * credential through Supabase.
     *
     * This client does not persist
     * sessions in browser storage.
     */
    const supabase =
      createStaffClient();

    const {
      data,
      error,
    } =
      await supabase.auth.signInWithIdToken(
        {
          provider: 'google',
          token:
            parsed.data.credential,
        }
      );

    if (
      error ||
      !data.session ||
      !data.user
    ) {
      return adminReply(
        {
          error:
            'Google sign-in could not be verified.',
        },
        401
      );
    }

    /*
     * Google/Supabase authentication
     * proves identity only.
     *
     * Bivi independently determines
     * whether this user has access
     * to any client projects.
     */
    const access =
      await authorizeClient(
        data.session.access_token
      );

    if (!access.allowed) {
      /*
       * Best-effort cleanup of the
       * temporary Supabase session.
       */
      try {
        await supabase.auth.signOut({
          scope: 'local',
        });
      } catch {
        // Ignore cleanup failure.
      }

      if (
        access.status === 503
      ) {
        return adminReply(
          {
            error:
              'Client access is temporarily unavailable.',
          },
          503
        );
      }

      return adminReply(
        {
          error:
            'This Google account is not assigned to a Bivi client project.',
        },
        403
      );
    }

    const response =
      adminReply({
        redirect: '/client',
      });

    /*
     * Preserve the existing Bivi
     * HttpOnly client-session model.
     */
    response.cookies.set(
      CLIENT_COOKIE,
      data.session.access_token,
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV ===
          'production',
        sameSite: 'lax',
        path: '/',
        maxAge: Math.min(
          data.session.expires_in,
          3600
        ),
      }
    );

    return response;
  } catch {
    return adminReply(
      {
        error:
          'Google sign-in is temporarily unavailable.',
      },
      503
    );
  }
}