'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

type Editor = { label: string; save?: () => Promise<unknown> };
const editors = new Map<string, Editor>();
let requestNavigation: ((action: () => void) => void) | undefined;

/** Register actual editor dirty state; navigation never guesses from input events. */
export function useWorkspaceUnsavedChanges(dirty: boolean, label: string, save?: () => Promise<unknown>) {
  const id = useId();
  const latest = useRef({ label, save });
  latest.current = { label, save };
  const hasSave = Boolean(save);
  useEffect(() => {
    if (dirty) editors.set(id, { label, save: hasSave ? () => latest.current.save!() : undefined });
    else editors.delete(id);
    return () => { editors.delete(id); };
  }, [id, dirty, label, hasSave]);
  return () => { editors.delete(id); };
}

export function guardWorkspaceNavigation(action: () => void) {
  if (editors.size && requestNavigation) {
    window.dispatchEvent(new Event('bivi:workspace-navigation-blocked'));
    requestNavigation(action);
  }
  else action();
}

export function WorkspaceNavigationGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [pending, setPending] = useState<(() => void) | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const pendingRef = useRef<(() => void) | null>(null);
  pendingRef.current = pending;
  const dirtyEditors = [...editors.values()];

  useEffect(() => {
    requestNavigation = action => setPending(() => action);
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!editors.size) return;
      event.preventDefault();
      event.returnValue = '';
    }
    function click(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank' || anchor.hasAttribute('download') || !editors.size) return;
      const url = new URL(anchor.href);
      if (url.href === window.location.href) return;
      event.preventDefault();
      event.stopPropagation();
      const action = () => url.origin === window.location.origin
        ? router.push(url.pathname + url.search + url.hash)
        : window.location.assign(url.href);
      guardWorkspaceNavigation(action);
    }
    document.addEventListener('click', click, true);
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      requestNavigation = undefined;
      document.removeEventListener('click', click, true);
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [router]);

  return <>
    {children}
    <Dialog open={Boolean(pending)} onOpenChange={open => { if (!open && !saving) setPending(null); }}>
      <DialogContent className="bivi-staff-surface" onEscapeKeyDown={event => { if (saving) event.preventDefault(); }} onInteractOutside={event => { if (saving) event.preventDefault(); }}>
        <DialogTitle>Unsaved changes</DialogTitle>
        <DialogDescription>
          You have unsaved edits in {dirtyEditors.map(editor => editor.label).join(', ') || 'this record'}. Stay to continue editing or discard the edits before leaving.
        </DialogDescription>
        {saveError && <p role="alert" className="text-xs text-destructive">{saveError}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" disabled={saving} onClick={() => setPending(null)}>Stay</Button>
          <Button variant="outline" disabled={saving} onClick={() => {
            const action = pendingRef.current;
            editors.clear();
            setPending(null);
            action?.();
          }}>Discard and leave</Button>
          {dirtyEditors.length === 1 && dirtyEditors[0].save && <Button disabled={saving} onClick={async () => {
            setSaving(true);
            setSaveError('');
            try { await dirtyEditors[0].save!(); setPending(null); }
            catch (error) { setSaveError(error instanceof Error ? error.message : 'Unable to save changes.'); }
            finally { setSaving(false); }
          }}>{saving ? 'Saving…' : 'Save and stay'}</Button>}
        </div>
      </DialogContent>
    </Dialog>
  </>;
}
