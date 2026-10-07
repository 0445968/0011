import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import {
  authorizeClient,
  CLIENT_COOKIE,
} from '@/lib/portal/auth';

function loginRedirect(
  request: Request,
  reason?: string
) {
  const url = new URL(
    '/client/login',
    request.url
  );

  if (reason) {
    url.searchParams.set(
      'error',
      reason
    );
  }

  return NextResponse.redirect(url);
}

export async function GET(
  request: Request
) {
  const url = new URL(request.url);
  const code =
    url.searchParams.get('code');

  if (!code) {
    return loginRedirect(
      request,
      'oauth'
    );
  }

  try {
    const supabase =
      await createClient();

    const {
      data,
      error,
    } =
      await supabase.auth.exchangeCodeForSession(
        code
      );

    if (
      error ||
      !data.session
    ) {
      return loginRedirect(
        request,
        'oauth'
      );
    }

    /*
     * Google authenticates the user.
     *
     * Bivi still independently checks
     * whether that Supabase user has
     * client-project access.
     */
    const access =
      await authorizeClient(
        data.session.access_token
      );

    if (!access.allowed) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Best effort only.
      }

      return loginRedirect(
        request,
        'not-authorized'
      );
    }

    const response =
      NextResponse.redirect(
        new URL(
          '/client',
          request.url
        )
      );

    /*
     * Preserve Bivi's existing
     * server-side client session model.
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
    return loginRedirect(
      request,
      'oauth'
    );
  }
}