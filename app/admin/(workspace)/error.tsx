'use client';
import { Button } from '@/components/ui/button';
export default function WorkspaceError({ reset }: { reset: () => void }) {
  return <div role="alert" className="rounded-2xl border border-border bg-card p-8"><h1 className="font-heading text-2xl font-semibold">The workspace couldn’t load.</h1><p className="mt-4 text-sm text-muted-foreground">Try again. If this continues, check the workspace setup and database connection.</p><Button onClick={reset} className="mt-6 rounded-xl">Try again</Button></div>;
}
