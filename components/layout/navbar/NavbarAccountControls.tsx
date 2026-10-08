
'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ChevronDown,
  LogOut,
  UserRound,
} from 'lucide-react';

import {
  browserAccountOrigins,
  clientOrigin,
  staffOrigin,
} from '@/lib/site/origins';

import { cn } from '@/lib/utils';

type PublicAccount = {
  kind: 'client' | 'staff';
  initial: string;
};

type CachedAccount =
  | PublicAccount
  | null
  | undefined;

let cachedAccount: CachedAccount;
let inFlight: Promise<PublicAccount | null> | null = null;

async function readAccount(
  origin: string,
  kind: PublicAccount['kind']
): Promise<PublicAccount | null> {
  try {
    const response = await fetch(
      `${origin}/api/account/session`,
      {
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (
      data?.authenticated === true &&
      data.kind === kind &&
      typeof data.initial === 'string' &&
      data.initial.length > 0
    ) {
      return {
        kind,
        initial: data.initial.charAt(0).toUpperCase(),
      };
    }
  } catch {
    // Public navigation remains accessible.
  }

  return null;
}

async function loadAccount(force = false) {
  const origins = browserAccountOrigins();

  if (!origins) return null;

  if (!force && cachedAccount !== undefined) {
    return cachedAccount;
  }

  if (inFlight) return inFlight;

  inFlight = (async () => {
    const [staff, client] = await Promise.all([
      readAccount(origins.staff, 'staff'),
      readAccount(origins.client, 'client'),
    ]);

    cachedAccount = staff || client || null;
    return cachedAccount;
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}

function dashboardHref(account: PublicAccount) {
  return account.kind === 'staff'
    ? staffOrigin()
    : clientOrigin();
}

async function signOutAccount(account: PublicAccount) {
  const origin =
    account.kind === 'staff'
      ? staffOrigin()
      : clientOrigin();

  const response = await fetch(
    `${origin}/api/account/session`,
    {
      method: 'DELETE',
      credentials: 'include',
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!response.ok) {
    throw new Error(
      'Sign out could not be confirmed.'
    );
  }

  cachedAccount = null;

  window.dispatchEvent(
    new Event('bivi-account-changed')
  );
}

function usePublicAccount() {
  const [account, setAccount] =
    useState<CachedAccount>(cachedAccount);

  const refresh = useCallback(async (force = false) => {
    const next = await loadAccount(force);
    setAccount(next);
  }, []);

  useEffect(() => {
    void refresh();

    const onFocus = () => {
      void refresh(true);
    };

    const onChanged = () => {
      setAccount(cachedAccount);
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener(
      'bivi-account-changed',
      onChanged
    );

    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener(
        'bivi-account-changed',
        onChanged
      );
    };
  }, [refresh]);

  return account;
}

interface NavbarAccountControlsProps {
  surfaceActive: boolean;
  onSignup: () => void;
  mobile?: boolean;
  mobileMode?: 'combined' | 'account' | 'signup';
  align?: 'left' | 'right';
}

export function NavbarAccountControls({
  surfaceActive,
  onSignup,
  mobile = false,
  mobileMode = 'combined',
  align = 'right',
}: NavbarAccountControlsProps) {
  const account = usePublicAccount();

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);

  const loginHref = `${clientOrigin()}/login`;

  useEffect(() => {
    if (!open) return;

    const close = (event: MouseEvent) => {
      if (
        !rootRef.current?.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    };

    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', close);
    window.addEventListener('keydown', escape);

    return () => {
      document.removeEventListener('mousedown', close);
      window.removeEventListener('keydown', escape);
    };
  }, [open]);

  if (!account) {
    const showSignup =
      !mobile ||
      mobileMode === 'combined' ||
      mobileMode === 'signup';

    const showAccount =
      !mobile ||
      mobileMode === 'combined' ||
      mobileMode === 'account';

    return (
      <>
        {showAccount && !mobile && (
          <a
            href={loginHref}
            className={cn(
              'inline-flex h-10 items-center justify-center rounded-[16px] px-4 font-mono text-[13px] font-semibold transition-colors',
              surfaceActive
                ? 'text-foreground hover:bg-muted'
                : 'text-white hover:bg-white/10'
            )}
          >
            Log in
          </a>
        )}

        {showSignup && (
          <button
            type="button"
            onClick={onSignup}
            className={cn(
              'inline-flex h-9 items-center justify-center rounded-[11px] px-3 font-mono text-[10px] font-semibold transition-colors',
              !mobile &&
                'h-10 rounded-[16px] px-4 text-[13px]',
              surfaceActive
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-[white] text-black'
            )}
          >
            Sign up
          </button>
        )}

        {showAccount && mobile && (
          <a
            href={loginHref}
            aria-label="Log in to Bivi"
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full transition-colors',
              surfaceActive
                ? 'text-black hover:bg-black/10'
                : 'text-white hover:bg-white/10'
            )}
          >
            <UserRound
              size={20}
              strokeWidth={2}
            />
          </a>
        )}
      </>
    );
  }

  if (mobile && mobileMode === 'signup') {
    return null;
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex h-10 items-center justify-center gap-1.5 rounded-full transition-colors',
          mobile ? 'w-10' : 'pl-1 pr-2',
          surfaceActive
            ? 'text-foreground hover:bg-muted'
            : 'text-white hover:bg-white/10'
        )}
      >
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full font-mono text-[12px] font-semibold',
            surfaceActive
              ? 'bg-foreground text-background'
              : 'bg-white text-black'
          )}
        >
          {account.initial}
        </span>

        {!mobile && (
          <ChevronDown
            size={13}
            strokeWidth={2}
          />
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-[calc(100%+10px)] z-[140] w-52 overflow-hidden rounded-[16px] border border-border bg-background p-1.5 text-foreground shadow-xl',
            align === 'left'
              ? 'left-0'
              : 'right-0'
          )}
        >
          <a
            href={dashboardHref(account)}
            className="
              flex
              items-center
              rounded-xl
              px-3
              py-2.5
              text-sm
              font-medium
              transition-colors
              hover:bg-muted
            "
          >
            Go to dashboard
          </a>

          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);

              try {
                await signOutAccount(account);
                setOpen(false);
              } catch {
                window.alert(
                  'Could not sign out. Please try again.'
                );
              } finally {
                setBusy(false);
              }
            }}
            className="
              flex
              w-full
              items-center
              gap-2
              rounded-xl
              px-3
              py-2.5
              text-left
              text-sm
              font-medium
              transition-colors
              hover:bg-muted
              disabled:opacity-50
            "
          >
            <LogOut size={15} />
            {busy ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      )}
    </div>
  );
}
