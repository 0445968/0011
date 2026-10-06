import { z } from 'zod';
import { cookies } from 'next/headers';
import { STAFF_COOKIE, authorizeStaff, createStaffClient, staffAuthConfigured } from '@/lib/admin/auth';
import { adminReply, isSameOrigin, readAdminJson } from '@/lib/admin/http';

export const runtime = 'nodejs';
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(1024) }).strict();

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Please sign in from the Bivi website.' }, 403);
  let raw: unknown;
  try { raw = await readAdminJson(request); } catch { return adminReply({ error: 'Enter your email and password.' }, 400); }
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return adminReply({ error: 'Enter a valid email and password.' }, 400);
  if (!staffAuthConfigured()) return adminReply({ error: 'Staff sign-in is not configured yet. Complete the workspace setup first.' }, 503);
  try {
    const { data, error } = await createStaffClient().auth.signInWithPassword(parsed.data);
    if (error || !data.session) {
      return adminReply({ error: error?.status === 429 ? 'Too many sign-in attempts. Please try again later.' : 'We could not sign you in with these details.' }, error?.status === 429 ? 429 : 401);
    }
    const access = await authorizeStaff(data.session.access_token);
    if (!access.allowed) return adminReply({ error: access.status === 503 ? 'The workspace is temporarily unavailable.' : 'We could not sign you in with these details.' }, access.status === 503 ? 503 : 401);
    const response = adminReply({ redirect: '/admin' });
    response.cookies.set(STAFF_COOKIE, data.session.access_token, {
      httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
      maxAge: Math.min(data.session.expires_in, 3600),
    });
    return response;
  } catch { return adminReply({ error: 'Sign-in is temporarily unavailable. Please try again.' }, 503); }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return adminReply({ error: 'Please sign out from the Bivi website.' }, 403);
  const token = cookies().get(STAFF_COOKIE)?.value;
  // Best-effort revocation at the provider; local logout always removes the workspace cookie.
  if (token && staffAuthConfigured()) {
    try {
      const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      await fetch(`${process.env.SUPABASE_URL}/auth/v1/logout?scope=local`, {
        method: 'POST', headers: { apikey: key, Authorization: `Bearer ${token}` },
        cache: 'no-store', signal: AbortSignal.timeout(10000),
      });
    } catch { /* Cookie removal must still work when the provider is unavailable. */ }
  }
  const response = adminReply({ redirect: '/admin/login' });
  response.cookies.set(STAFF_COOKIE, '', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  return response;
}
