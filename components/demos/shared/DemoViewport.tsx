'use client';

import type {
  ReactNode,
} from 'react';

interface DemoViewportProps {
  slug: string;
  mode: 'desktop' | 'mobile';
  children: ReactNode;
  disabled?: boolean;
}

export function DemoViewport({
  slug,
  mode,
  children,
  disabled = false,
}: DemoViewportProps) {
  /**
   * Desktop mode renders the actual
   * React demo directly.
   */
  if (mode === 'desktop') {
    return <>{children}</>;
  }

  /**
   * Coming-soon / unavailable demos
   * do not get an iframe preview.
   */
  if (disabled) {
    return <>{children}</>;
  }

  /**
   * Mobile mode uses a dedicated route
   * inside an iframe so responsive
   * breakpoints use a real mobile viewport.
   */
  return (
    <div
      className="
        flex
        w-full
        justify-center
        px-4
        py-8
        sm:px-8
        sm:py-10
      "
    >
      <div
        className="
          relative
          w-full
          max-w-[414px]
        "
      >
        {/* Device shadow */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -inset-3
            rounded-[2rem]
            bg-black/[0.05]
            blur-2xl
            dark:bg-black/30
          "
        />

        {/* Device */}
        <div
          className="
            relative
            overflow-hidden
            rounded-[1.75rem]
            border
            border-black/10
            bg-background
            shadow-[0_24px_70px_rgba(0,0,0,0.16)]
            dark:border-white/10
          "
        >
          {/* Device rail */}
          <div
            className="
              flex
              h-8
              items-center
              justify-center
              border-b
              border-black/[0.06]
              bg-black/[0.025]
              dark:border-white/[0.06]
              dark:bg-white/[0.025]
            "
          >
            <div
              className="
                h-1.5
                w-16
                rounded-full
                bg-black/15
                dark:bg-white/15
              "
            />
          </div>

          <iframe
            src={`/demos/${slug}/embed`}
            title={`${slug} mobile demo`}
            loading="lazy"
            className="
              block
              h-[720px]
              w-full
              border-0
              bg-background
              sm:h-[780px]
            "
          />
        </div>
      </div>
    </div>
  );
}