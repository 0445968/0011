
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface StaffLogoutProps {
  iconOnly?: boolean;
}

export function StaffLogout({
  iconOnly = false,
}: StaffLogoutProps) {
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function signOut() {
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/admin/session', {
        method: 'DELETE',
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error('Could not sign out.');
      }

      router.replace('/admin/login');
      router.refresh();
    } catch {
      setError('Could not sign out. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative w-full">
      <Button
        type="button"
        variant="outline"
        size={iconOnly ? 'icon' : 'default'}
        disabled={busy}
        onClick={signOut}
        aria-label="Sign out"
        title={iconOnly ? 'Sign out' : undefined}
        className={`
          rounded-xl
          border-border/80
          bg-background/80
          font-mono
          text-xs
          text-muted-foreground
          transition-colors
          hover:border-primary/25
          hover:bg-primary/10
          hover:text-primary
          ${iconOnly
            ? 'h-10 w-10 p-0'
            : 'w-full justify-start gap-3 px-3'
          }
        `}
      >
        <LogOut
          size={16}
          className={busy ? 'animate-pulse' : ''}
          aria-hidden="true"
        />

        {!iconOnly && (
          <span>
            {busy ? 'Signing out…' : 'Sign out'}
          </span>
        )}
      </Button>

      {error && (
        <p
          role="alert"
          className={`
            rounded-lg
            bg-red-50
            p-2
            text-xs
            text-red-700
            dark:bg-red-950
            dark:text-red-300
            ${iconOnly
              ? 'absolute bottom-full left-0 z-50 mb-2 w-52'
              : 'mt-2'
            }
          `}
        >
          {error}
        </p>
      )}
    </div>
  );
}
