
'use client';

import Link from 'next/link';

import { ClientLogin } from '@/components/portal/ClientLogin';
import { publicOrigin } from '@/lib/site/origins';

interface ClientAuthSwitcherProps {
  configured: boolean;
}

export function ClientAuthSwitcher({
  configured,
}: ClientAuthSwitcherProps) {
  return (
    <div className="mt-6 w-full">
      <ClientLogin configured={configured} />

      <div className="mt-4 text-center">
        <Link
          href="/recover"
          className="
            font-mono
            text-[11px]
            text-white/50
            transition-colors
            hover:text-white
          "
        >
          Forgot your password?
        </Link>
      </div>

      <div
        className="
          mt-7
          border-t
          border-white/10
          pt-5
          text-center
        "
      >
        <p className="text-[12px] text-white/50">
          New to Bivi?{' '}
          <a
            href={`${publicOrigin()}/get-started`}
            className="
              font-semibold
              text-[#BBFF1B]/50
              transition-colors
              hover:underline
              hover:underline-offset-4
              hover:text-[#BBFF1B]/80
            "
          >
            Start a project
          </a>
        </p>
      </div>
    </div>
  );
}
