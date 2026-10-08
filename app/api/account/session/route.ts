import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

import {
  STAFF_COOKIE,
  getStaffAccess,
  staffAuthConfigured,
} from '@/lib/admin/auth';
import {
  CLIENT_COOKIE,
  getClientAccess,
} from '@/lib/portal/auth';
import {
  publicOrigin,
  requestSurface,
} from '@/lib/site/origins';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type AccountKind = 'client' | 'staff';

function corsHeaders(request: Request) {
  const origin = request.headers.get('origin');
  if (origin !== publicOrigin()) return null;

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'GET, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    Vary: 'Origin',
  };
}

function initialForUser(user: User) {
  const metadata = user.user_metadata || {};
  const candidates = [
    metadata.given_name,
    metadata.first_name,
    metadata.full_name,
    metadata.name,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      const firstName = candidate.trim().split(/\s+/)[0];
      const initial = Array.from(firstName)[0];
      if (initial) return initial.toLocaleUpperCase();
    }
  }

  const emailInitial = user.email?.trim().charAt(0);
  return emailInitial ? emailInitial.toLocaleUpperCase() : 'B';
}

function reply(request: Request, body: Record<string, unknown>, status = 200) {
  const headers = corsHeaders(request);
  if (!headers) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  return NextResponse.json(body, { status, headers });
}

async function accountForRequest(request: Request) {
  const surface = requestSurface(request);

  if (surface === 'client') {
    const access = await getClientAccess();
    return { kind: 'client' as const, access };
  }

  if (surface === 'staff') {
    const access = await getStaffAccess();
    return { kind: 'staff' as const, access };
  }

  return null;
}

export async function OPTIONS(request: Request) {
  const headers = corsHeaders(request);
  if (!headers) return new NextResponse(null, { status: 404 });
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(request: Request) {
  const account = await accountForRequest(request);
  if (!account) return reply(request, { authenticated: false });

  if (!account.access.allowed) {
    if (account.access.status === 503) {
      return reply(request, { error: 'Account status is temporarily unavailable.' }, 503);
    }
    return reply(request, { authenticated: false });
  }

  return reply(request, {
    authenticated: true,
    kind: account.kind,
    initial: initialForUser(account.access.user),
  });
}

async function revokeProviderSession(token: string | undefined) {
  if (!token || !staffAuthConfigured()) return;

  try {
    const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!key || !process.env.SUPABASE_URL) return;

    await fetch(`${process.env.SUPABASE_URL}/auth/v1/logout?scope=local`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    // Local cookie removal must still succeed when the provider is unavailable.
  }
}

export async function DELETE(request: Request) {
  const headers = corsHeaders(request);
  if (!headers) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const surface = requestSurface(request);
  let cookieName: string | null = null;

  if (surface === 'client') cookieName = CLIENT_COOKIE;
  if (surface === 'staff') cookieName = STAFF_COOKIE;
  if (!cookieName) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

  const token = cookies().get(cookieName)?.value;
  await revokeProviderSession(token);

  const response = NextResponse.json({ signedOut: true }, { headers });
  response.cookies.set(cookieName, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
