import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';

import { parseOnboardingItems, type OnboardingItem } from './item-schema';

export async function getOnboardingItems(
  client: SupabaseClient,
  requestId: string
): Promise<OnboardingItem[]> {
  const { data, error } = await client
    .from('inquiry_onboarding_items')
    .select('*')
    .eq('request_id', requestId)
    .order('required', { ascending: false })
    .order('due_on', { ascending: true, nullsFirst: false })
    .order('item_key', { ascending: true });

  if (error) {
    throw new Error('Personalized onboarding could not be loaded. Apply migration 011.');
  }

  return parseOnboardingItems(data ?? []);
}
