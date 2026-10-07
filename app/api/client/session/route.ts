import { z } from 'zod';
import { cookies } from 'next/headers';

import {
  createStaffClient,
  staffAuthConfigured,
} from '@/lib/admin/auth';

import {
  CLIENT_COOKIE,
  authorizeClient,
} from '@/lib/portal/auth';

import {
  adminReply,
  isSameOrigin,
  readAdminJson,
} from '@/lib/admin/http';

const signInSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email()
      .max(254),

    password: z
      .string()
      .min(1)
      .max(1024),
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

  let raw: unknown;

  try {
    raw =
      await readAdminJson(request);
  } catch {
    return adminReply(
      {
        error:
          'Enter your email and password.',
      },
      400
    );
  }

  const parsed =
    signInSchema.safeParse(raw);

  if (!parsed.success) {
    return adminReply(
      {
        error:
          'Enter your email and password.',
      },
      400
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

  try {
    const supabase =
      createStaffClient();

    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword(
        parsed.data
      );

    if (
      error ||
      !data.session
    ) {
      return adminReply(
        {
          error:
            error?.status === 429
              ? 'Too many attempts. Please try later.'
              : 'Could not sign in with these details.',
        },
        error?.status === 429
          ? 429
          : 401
      );
    }

    /*
     * Verify that this authenticated
     * user actually has an active Bivi
     * client assignment.
     */
    const access =
      await authorizeClient(
        data.session.access_token
      );

    if (!access.allowed) {
      return adminReply(
        {
          error:
            access.status === 403
              ? 'This account is not assigned to a Bivi client project.'
              : 'Sign-in could not be verified.',
        },
        access.status
      );
    }

    /*
     * Determine whether this account
     * has a verified TOTP factor.
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
     * Store the authenticated session
     * in Bivi's HttpOnly cookie.
     *
     * When MFA is required this is
     * still only an AAL1 session.
     * /client/mfa will upgrade it to
     * AAL2 after verification.
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
          'Sign-in is temporarily unavailable.',
      },
      503
    );
  }
}

export async function DELETE(
  request: Request
) {
  if (!isSameOrigin(request)) {
    return adminReply(
      {
        error:
          'Sign out from the Bivi client portal.',
      },
      403
    );
  }

  const token =
    cookies().get(
      CLIENT_COOKIE
    )?.value;

  if (
    token &&
    staffAuthConfigured()
  ) {
    try {
      await fetch(
        `${process.env.SUPABASE_URL}/auth/v1/logout?scope=local`,
        {
          method: 'POST',
          headers: {
            apikey:
              process.env
                .SUPABASE_ANON_KEY ||
              process.env
                .NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            Authorization:
              `Bearer ${token}`,
          },
          cache: 'no-store',
          signal:
            AbortSignal.timeout(
              10000
            ),
        }
      );
    } catch {
      // Best-effort logout.
    }
  }

  const response =
    adminReply({
      redirect:
        '/client/login',
    });

  response.cookies.set(
    CLIENT_COOKIE,
    '',
    {
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    }
  );

  return response;
}