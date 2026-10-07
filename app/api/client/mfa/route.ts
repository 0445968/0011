import { cookies } from 'next/headers';
import { z } from 'zod';

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

const actionSchema = z.discriminatedUnion(
  'action',
  [
    z.object({
      action: z.literal('enroll'),
    }),
    z.object({
      action: z.literal(
        'verify-enrollment'
      ),
      factorId: z.string().uuid(),
      code: z
        .string()
        .regex(/^\d{6}$/),
    }),
    z.object({
      action: z.literal(
        'challenge'
      ),
      factorId: z.string().uuid(),
      code: z
        .string()
        .regex(/^\d{6}$/),
    }),
    z.object({
      action: z.literal(
        'unenroll'
      ),
      factorId: z.string().uuid(),
    }),
  ]
);

function clientToken() {
  return cookies().get(
    CLIENT_COOKIE
  )?.value;
}

export async function GET() {
  const token = clientToken();

  const access =
    await authorizeClient(token);

  if (!access.allowed) {
    return adminReply(
      {
        error:
          'Client authentication is required.',
      },
      access.status
    );
  }

  try {
    const factors =
      await access.client.auth.mfa.listFactors();

    if (factors.error) {
      throw factors.error;
    }

    const aal =
      await access.client.auth.mfa.getAuthenticatorAssuranceLevel(
        token
      );

    if (aal.error) {
      throw aal.error;
    }

    return adminReply({
      factors: factors.data.totp.map(
        (factor) => ({
          id: factor.id,
          status: factor.status,
          friendlyName:
            factor.friendly_name ??
            'Authenticator app',
          createdAt:
            factor.created_at,
          updatedAt:
            factor.updated_at,
        })
      ),
      currentLevel:
        aal.data.currentLevel,
      nextLevel:
        aal.data.nextLevel,
    });
  } catch {
    return adminReply(
      {
        error:
          'Two-factor authentication settings could not be loaded.',
      },
      503
    );
  }
}

export async function POST(
  request: Request
) {
  if (!isSameOrigin(request)) {
    return adminReply(
      {
        error:
          'Manage two-factor authentication from the Bivi client portal.',
      },
      403
    );
  }

  if (!staffAuthConfigured()) {
    return adminReply(
      {
        error:
          'Client authentication is not configured.',
      },
      503
    );
  }

  const token = clientToken();

  const access =
    await authorizeClient(token);

  if (!access.allowed) {
    return adminReply(
      {
        error:
          'Client authentication is required.',
      },
      access.status
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
          'Invalid two-factor authentication request.',
      },
      400
    );
  }

  const parsed =
    actionSchema.safeParse(raw);

  if (!parsed.success) {
    return adminReply(
      {
        error:
          'Invalid two-factor authentication request.',
      },
      400
    );
  }

  try {
    if (
      parsed.data.action ===
      'enroll'
    ) {
      const result =
        await access.client.auth.mfa.enroll(
          {
            factorType: 'totp',
            friendlyName:
              'Bivi Authenticator',
          }
        );

      if (
        result.error ||
        !result.data.totp
      ) {
        return adminReply(
          {
            error:
              result.error?.message ||
              'Authenticator setup could not be started.',
          },
          400
        );
      }

      return adminReply({
        factorId:
          result.data.id,
        qrCode:
          result.data.totp
            .qr_code,
        secret:
          result.data.totp
            .secret,
        uri:
          result.data.totp.uri,
      });
    }

    if (
      parsed.data.action ===
      'verify-enrollment'
    ) {
      const challenge =
        await access.client.auth.mfa.challenge(
          {
            factorId:
              parsed.data.factorId,
          }
        );

      if (
        challenge.error ||
        !challenge.data.id
      ) {
        return adminReply(
          {
            error:
              challenge.error
                ?.message ||
              'Authenticator verification could not be started.',
          },
          400
        );
      }

      const verification =
        await access.client.auth.mfa.verify(
          {
            factorId:
              parsed.data.factorId,
            challengeId:
              challenge.data.id,
            code:
              parsed.data.code,
          }
        );

if (
  verification.error ||
  !verification.data.access_token
) {
  return adminReply(
    {
      error:
        verification.error?.message ||
        'The verification code was not accepted.',
    },
    400
  );
}

const response =
  adminReply({
    enabled: true,
  });

response.cookies.set(
  CLIENT_COOKIE,
  verification.data.access_token,
  {
    httpOnly: true,
    secure:
      process.env.NODE_ENV ===
      'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.min(
      verification.data.expires_in,
      3600
    ),
  }
);

return response;
    }

    if (
      parsed.data.action ===
      'challenge'
    ) {
      const result =
        await access.client.auth.mfa.challengeAndVerify(
          {
            factorId:
              parsed.data.factorId,
            code:
              parsed.data.code,
          }
        );

if (
  result.error ||
  !result.data.access_token
) {
  return adminReply(
    {
      error:
        result.error?.message ||
        'The verification code was not accepted.',
    },
    400
  );
}

const response =
  adminReply({
    verified: true,
  });

response.cookies.set(
  CLIENT_COOKIE,
  result.data.access_token,
  {
    httpOnly: true,
    secure:
      process.env.NODE_ENV ===
      'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.min(
      result.data.expires_in,
      3600
    ),
  }
);

return response;
    }

    const aal =
      await access.client.auth.mfa.getAuthenticatorAssuranceLevel(
        token
      );

    if (
      aal.error ||
      aal.data.currentLevel !==
        'aal2'
    ) {
      return adminReply(
        {
          error:
            'Verify your second factor before removing it.',
        },
        403
      );
    }

    const result =
      await access.client.auth.mfa.unenroll(
        {
          factorId:
            parsed.data.factorId,
        }
      );

    if (result.error) {
      return adminReply(
        {
          error:
            result.error.message,
        },
        400
      );
    }

    return adminReply({
      removed: true,
    });
  } catch {
    return adminReply(
      {
        error:
          'Two-factor authentication is temporarily unavailable.',
      },
      503
    );
  }
}