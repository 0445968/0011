import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  createStaffClient,
  staffAuthConfigured,
  type StaffAccess,
} from '@/lib/admin/auth';

import {
  privilegedClient,
} from '@/lib/access/server';

export const CLIENT_COOKIE =
  'bivi_client_access';

export async function authorizeClient(
  token: string | undefined
): Promise<StaffAccess> {
  if (!token) {
    return {
      allowed: false,
      status: 401,
    };
  }

  if (!staffAuthConfigured()) {
    return {
      allowed: false,
      status: 503,
    };
  }

  try {
    const client =
      createStaffClient(token);

    const {
      data,
      error,
    } =
      await client.auth.getUser(token);

    if (error || !data.user) {
      return {
        allowed: false,
        status:
          error?.status &&
          error.status >= 500
            ? 503
            : 401,
      };
    }

    /*
     * project_clients is intentionally
     * not readable by normal clients.
     *
     * Use the server-only privileged
     * client solely to determine
     * whether this verified Auth user
     * has at least one active Bivi
     * project assignment.
     */
    const membership =
      await privilegedClient()
        .from('project_clients')
        .select('request_id')
        .eq(
          'user_id',
          data.user.id
        )
        .eq('active', true)
        .limit(1);

    if (membership.error) {
      return {
        allowed: false,
        status: 503,
      };
    }

    if (
      !membership.data ||
      membership.data.length === 0
    ) {
      return {
        allowed: false,
        status: 403,
      };
    }

    return {
      allowed: true,
      user: data.user,
      client,
    };
  } catch {
    return {
      allowed: false,
      status: 503,
    };
  }
}

export function getClientAccess() {
  return authorizeClient(
    cookies().get(
      CLIENT_COOKIE
    )?.value
  );
}

export async function requireClient(
  options: {
    allowMfaPending?: boolean;
  } = {}
) {
  const token =
    cookies().get(
      CLIENT_COOKIE
    )?.value;

  const access =
    await authorizeClient(token);

  if (!access.allowed) {
    if (access.status === 503) {
      throw new Error(
        'Client access is temporarily unavailable.'
      );
    }

    redirect('/client/login');
  }

  if (options.allowMfaPending) {
    return access;
  }

  try {
    const factors =
      await access.client.auth.mfa.listFactors();

    if (factors.error) {
      throw factors.error;
    }

    const hasVerifiedTotp =
      factors.data.totp.some(
        (factor) =>
          factor.status ===
          'verified'
      );

    if (!hasVerifiedTotp) {
      return access;
    }

    const aal =
      await access.client.auth.mfa.getAuthenticatorAssuranceLevel(
        token
      );

    if (aal.error) {
      throw aal.error;
    }

    const needsMfa =
      aal.data.nextLevel ===
        'aal2' &&
      aal.data.currentLevel !==
        'aal2';

    if (needsMfa) {
      redirect('/client/mfa');
    }

    return access;
  } catch (error) {
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest ===
        'string' &&
      error.digest.startsWith(
        'NEXT_REDIRECT'
      )
    ) {
      throw error;
    }

    throw new Error(
      'Client account security could not be verified.'
    );
  }
}