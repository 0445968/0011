import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

export const STAFF_COOKIE = 'bivi_staff_access';
export type StaffAccess =
  | { allowed: true; user: User; client: SupabaseClient }
  | { allowed: false; status: 401 | 403 | 503 };

export function staffAuthConfigured() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}

export function createStaffClient(token?: string) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Staff authentication is not configured.');
  // Never use the privileged service key for staff reads or decisions. Database RLS applies.
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store', signal: init?.signal || AbortSignal.timeout(15000) }),
    },
  });
}

export async function authorizeStaff(token: string | undefined): Promise<StaffAccess> {
  if (!token) return { allowed: false, status: 401 };
  if (!staffAuthConfigured()) return { allowed: false, status: 503 };
  try {
    const client = createStaffClient(token);
    // This network call verifies the token with Supabase, rather than trusting decoded claims.
    const { data, error } = await client.auth.getUser(token);
    if (error || !data.user) return { allowed: false, status: error && error.status && error.status >= 500 ? 503 : 401 };
    const membership = await client.rpc('is_inquiry_staff');
    if (membership.error) return { allowed: false, status: 503 };
    if (membership.data !== true) return { allowed: false, status: 403 };
    return { allowed: true, user: data.user, client };
  } catch { return { allowed: false, status: 503 }; }
}

export function getStaffAccess() {
  return authorizeStaff(cookies().get(STAFF_COOKIE)?.value);
}

export async function requireStaff() {
  const access = await getStaffAccess();
  if (!access.allowed) {
    if (access.status === 503) throw new Error('The workspace is temporarily unavailable. Check the staff migration and authentication configuration.');
    redirect('/admin/login');
  }
  return access;
}
