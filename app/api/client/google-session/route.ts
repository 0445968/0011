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
    raw = await readAdminJson(request);
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
     * Google proves identity.
     * Bivi still decides whether the
     * user has active client access.
     */
    const access =
      await authorizeClient(
        data.session.access_token
      );

    if (!access.allowed) {
      try {
        await supabase.auth.signOut({
          scope: 'local',
        });
      } catch {
        // Best effort only.
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

    /*
     * Check whether this account has
     * a verified authenticator factor.
     */
    const factors =
      await access.client.auth.mfa.listFactors();

    if (factors.error) {
      return adminReply(
        {
          error:
            'Account security could not be verified.',
        },
        503
      );
    }

    const hasVerifiedTotp =
      factors.data.totp.some(
        (factor) =>
          factor.status ===
          'verified'
      );

    let requiresMfa = false;

    if (hasVerifiedTotp) {
      const aal =
        await access.client.auth.mfa.getAuthenticatorAssuranceLevel(
          data.session.access_token
        );

      if (aal.error) {
        return adminReply(
          {
            error:
              'Account security could not be verified.',
          },
          503
        );
      }

      requiresMfa =
        aal.data.nextLevel ===
          'aal2' &&
        aal.data.currentLevel !==
          'aal2';
    }

    const response =
      adminReply({
        redirect: requiresMfa
          ? '/client/mfa'
          : '/client',
        requiresMfa,
      });

    /*
     * Store the current Supabase
     * session in Bivi's HttpOnly
     * client cookie.
     *
     * If MFA is required, this is an
     * AAL1 session and /client/mfa
     * will upgrade it to AAL2.
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