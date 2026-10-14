'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getWorkspaceRecordFromPath, recordDefinitions } from '@/lib/admin/workspace/navigation';

export default function WorkspaceNotFound() {
  const pathname = usePathname();
  const record = getWorkspaceRecordFromPath(pathname);
  useEffect(() => {
    const unavailable = getWorkspaceRecordFromPath(pathname);
    let cancelled = false;
    queueMicrotask(() => {
      if (unavailable && !cancelled) window.dispatchEvent(new CustomEvent('bivi:workspace-record-unavailable', { detail: unavailable.key }));
    });
    return () => { cancelled = true; };
  }, [pathname]);
  return <section className="rounded-2xl border border-border bg-card p-8">
    <h1 className="text-2xl font-semibold">Record unavailable</h1>
    <p className="mt-3 text-sm text-muted-foreground">This record was removed or you no longer have access. Its saved workspace links have been cleared.</p>
    <Link className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-muted px-4 text-sm font-medium" href={record ? recordDefinitions[record.kind].directory : '/'}>Return to directory</Link>
  </section>;
}
