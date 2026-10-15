export default function WorkspaceLoading() {
  return <section role="status" aria-label="Loading workspace record" className="space-y-5 p-4">
    <p className="text-sm text-muted-foreground">Opening workspace…</p>
    <div aria-hidden="true" className="space-y-4 motion-safe:animate-pulse">
      <div className="h-8 w-2/5 rounded-lg bg-muted" />
      <div className="h-16 rounded-xl bg-muted" />
      <div className="h-64 rounded-xl bg-muted" />
    </div>
  </section>;
}
