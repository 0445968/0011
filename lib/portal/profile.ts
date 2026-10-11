
import 'server-only';

import type {
  SupabaseClient,
  User,
} from '@supabase/supabase-js';

import { z } from 'zod';

const profileSchema = z.object({
  user_id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
  job_title: z.string(),
  phone: z.string(),
  timezone: z.string(),
  revision: z.number().int().positive(),
  updated_at: z.string(),
});

const organizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export type ClientProfile = {
  firstName: string;
  lastName: string;
  jobTitle: string;
  phone: string;
  timezone: string;
  revision: number;
};

export type ClientOrganization = z.infer<
  typeof organizationSchema
>;

function metadataName(user: User) {
  const metadata = user.user_metadata || {};

  const full = [
    metadata.given_name,
    metadata.family_name,
  ]
    .filter(
      (value): value is string =>
        typeof value === 'string' &&
        Boolean(value.trim())
    )
    .map((value) => value.trim());

  if (full.length) {
    return {
      firstName: full[0] ?? '',
      lastName: full[1] ?? '',
    };
  }

  const name =
    typeof metadata.full_name === 'string'
      ? metadata.full_name
      : typeof metadata.name === 'string'
        ? metadata.name
        : '';

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

export async function getClientProfileContext(
  client: SupabaseClient,
  user: User
) {
  const [profileResult, membershipResult] =
    await Promise.all([
      client
        .from('client_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),

      client
        .from('client_organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .eq('active', true),
    ]);

  if (
    profileResult.error ||
    membershipResult.error
  ) {
    throw new Error(
      'Client profile could not be loaded. Apply migration 011.'
    );
  }

  const fallback = metadataName(user);

  const saved = profileResult.data
    ? profileSchema.parse(profileResult.data)
    : null;

  // Array.from avoids downlevel Set iteration errors.
  const ids = Array.from(
    new Set(
      (membershipResult.data ?? []).map(
        (row) => row.organization_id
      )
    )
  );

  let organizations: ClientOrganization[] = [];

  if (ids.length) {
    const organizationResult = await client
      .from('client_organizations')
      .select('id,name')
      .in('id', ids)
      .order('name');

    if (organizationResult.error) {
      throw new Error(
        'Client organization could not be loaded.'
      );
    }

    organizations = z
      .array(organizationSchema)
      .parse(organizationResult.data ?? []);
  }

  return {
    profile: {
      firstName:
        saved?.first_name || fallback.firstName,
      lastName:
        saved?.last_name || fallback.lastName,
      jobTitle: saved?.job_title || '',
      phone: saved?.phone || '',
      timezone: saved?.timezone || '',
      revision: saved?.revision ?? 0,
    } satisfies ClientProfile,

    organizations,
  };
}
