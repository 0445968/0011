import { NextResponse } from 'next/server';

import { dispatchProjectCommunications } from '@/lib/communications/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }

  const result = await dispatchProjectCommunications({ includeReminders: true, limit: 30 });
  if (!result.configured) {
    return NextResponse.json({ error: 'Email delivery is not configured.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  if('error' in result)return NextResponse.json(result,{status:503,headers:{'Cache-Control':'no-store'}});
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
}
