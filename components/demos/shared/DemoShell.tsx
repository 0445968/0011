'use client';

import Link from 'next/link';
import {
  useState,
  type ReactNode,
} from 'react';

import {
  ArrowLeft,
  Info,
  Maximize2,
  Minimize2,
  Monitor,
  Smartphone,
  Tag,
  X,
} from 'lucide-react';

import {
  cn,
} from '@/lib/utils';

import type {
  Demo,
  DemoCategory,
} from '@/data/demos/registry';

import {
  DemoViewport,
} from './DemoViewport';

const categoryBadgeColors: Record<
  DemoCategory,
  string
> = {
  App:
    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  SaaS:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  Dashboard:
    'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  Ecommerce:
    'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  Game:
    'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  Utility:
    'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  Experiment:
    'bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400',
  Mobile:
    'bg-teal-500/10 text-teal-600 dark:text-teal-400',
};

type ViewMode =
  | 'desktop'
  | 'mobile';

interface DemoShellProps {
  demo: Demo;
  children: ReactNode;

  immersiveByDefault?: boolean;
}

export function DemoShell({
  demo,
  children,
  immersiveByDefault = false,
}: DemoShellProps) {
  const [
    immersive,
    setImmersive,
  ] = useState(
    immersiveByDefault
  );

  const [
    infoOpen,
    setInfoOpen,
  ] = useState(false);

  const [
    viewMode,
    setViewMode,
  ] =
    useState<ViewMode>(
      'desktop'
    );

  const {
    presentation,
  } = demo;

  /* ================================================================ */
  /* Fullscreen                                                       */
  /* ================================================================ */

  if (immersive) {
    return (
      <div
        className="
          fixed
          inset-0
          z-[60]
          bg-background
        "
      >
        {/* ---------------------------------------------------------- */}
        {/* Fullscreen controls                                        */}
        {/* ---------------------------------------------------------- */}

        <div
          className="
            absolute
            right-4
            top-4
            z-50
            flex
            items-center
            gap-2
          "
        >
          <button
            type="button"
            onClick={() =>
              setInfoOpen(
                true
              )
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-border/70
              bg-background/90
              text-foreground
              shadow-lg
              backdrop-blur-xl
              transition-colors
              hover:bg-muted
            "
            aria-label="Show demo info"
          >
            <Info
              size={17}
            />
          </button>

          <button
            type="button"
            onClick={() =>
              setImmersive(
                false
              )
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-border/70
              bg-background/90
              text-foreground
              shadow-lg
              backdrop-blur-xl
              transition-colors
              hover:bg-muted
            "
            aria-label="Exit full screen"
          >
            <Minimize2
              size={17}
            />
          </button>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Raw demo                                                   */}
        {/* ---------------------------------------------------------- */}

        <div
          className="
            h-full
            w-full
            overflow-auto
          "
        >
          {children}
        </div>

        {infoOpen && (
          <DemoInfoPanel
            demo={demo}
            onClose={() =>
              setInfoOpen(
                false
              )
            }
          />
        )}
      </div>
    );
  }

  /* ================================================================ */
  /* Standard shell                                                   */
  /* ================================================================ */

  return (
    <section
      className="
        min-h-screen
        bg-background
        pt-24
        md:pt-28
      "
    >
      {/* ------------------------------------------------------------ */}
      {/* Header                                                       */}
      {/* ------------------------------------------------------------ */}

      <div
        className="
          container-page
        "
      >
        <div
          className="
            flex
            flex-col
            gap-7
            border-b
            border-border
            pb-7
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          {/* -------------------------------------------------------- */}
          {/* Demo identity                                            */}
          {/* -------------------------------------------------------- */}

          <div>
            <Link
              href={`/demos/${demo.slug}`}
              className="
                group
                inline-flex
                items-center
                gap-2
                text-sm
                font-medium
                text-muted-foreground
                transition-colors
                hover:text-foreground
              "
            >
              <ArrowLeft
                size={15}
                className="
                  transition-transform
                  duration-300
                  group-hover:-translate-x-1
                "
              />

              Demo overview
            </Link>

            <div
              className="
                mt-5
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <span
                className={cn(
                  `
                    rounded-full
                    px-2.5
                    py-1
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.14em]
                  `,
                  categoryBadgeColors[
                    demo.category
                  ]
                )}
              >
                {
                  demo.category
                }
              </span>

              <span
                className="
                  text-xs
                  text-muted-foreground
                "
              >
                Interactive prototype
              </span>
            </div>

            <h1
              className="
                mt-4
                font-heading
                text-3xl
                font-semibold
                tracking-[-0.035em]
                sm:text-4xl
                lg:text-[2.75rem]
              "
            >
              {
                demo.productName
              }
            </h1>

            <p
              className="
                mt-2
                max-w-2xl
                text-sm
                leading-6
                text-muted-foreground
                sm:text-[15px]
              "
            >
              {
                demo.shortDescription
              }
            </p>
          </div>

          {/* -------------------------------------------------------- */}
          {/* Actions                                                  */}
          {/* -------------------------------------------------------- */}

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-2
              lg:pb-1
            "
          >
            <button
              type="button"
              onClick={() =>
                setInfoOpen(
                  true
                )
              }
              className="
                inline-flex
                h-11
                items-center
                gap-2
                rounded-xl
                border
                border-border
                bg-background
                px-4
                text-sm
                font-medium
                text-foreground
                transition-colors
                hover:bg-muted/60
              "
            >
              <Info
                size={15}
              />

              Info
            </button>

            <button
              type="button"
              onClick={() =>
                setImmersive(
                  true
                )
              }
              className="
                inline-flex
                h-11
                items-center
                gap-2
                rounded-xl
                border
                border-border
                bg-background
                px-4
                text-sm
                font-medium
                text-foreground
                transition-colors
                hover:bg-muted/60
              "
            >
              <Maximize2
                size={15}
              />

              Full screen
            </button>

            <Link
              href={`/help/contact/demo?from=${encodeURIComponent(
                demo.slug
              )}`}
              className={`
                inline-flex
                h-11
                items-center
                justify-center
                rounded-xl
                px-5
                text-sm
                font-semibold
                transition-colors
                ${presentation.accent}
                ${presentation.accentHover}
                ${presentation.accentText}
              `}
            >
              Request a demo
            </Link>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* View mode controls                                           */}
      {/* ------------------------------------------------------------ */}

      <div
        className="
          container-page
          pt-8
          md:pt-10
        "
      >
        <div
          className="
            flex
            justify-center
          "
        >
          <div
            className="
              inline-flex
              items-center
              rounded-full
              border
              border-border
              bg-muted/40
              p-1
              shadow-sm
            "
          >
            <button
              type="button"
              onClick={() =>
                setViewMode(
                  'desktop'
                )
              }
              aria-pressed={
                viewMode ===
                'desktop'
              }
              className={cn(
                `
                  inline-flex
                  h-9
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  text-sm
                  font-medium
                  transition-colors
                `,
                viewMode ===
                  'desktop'
                  ? `
                    bg-foreground
                    text-background
                    shadow-sm
                  `
                  : `
                    text-muted-foreground
                    hover:text-foreground
                  `
              )}
            >
              <Monitor
                size={14}
              />

              Desktop
            </button>

            <button
              type="button"
              onClick={() =>
                setViewMode(
                  'mobile'
                )
              }
              aria-pressed={
                viewMode ===
                'mobile'
              }
              className={cn(
                `
                  inline-flex
                  h-9
                  items-center
                  gap-2
                  rounded-full
                  px-4
                  text-sm
                  font-medium
                  transition-colors
                `,
                viewMode ===
                  'mobile'
                  ? `
                    bg-foreground
                    text-background
                    shadow-sm
                  `
                  : `
                    text-muted-foreground
                    hover:text-foreground
                  `
              )}
            >
              <Smartphone
                size={14}
              />

              Mobile
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* Demo stage                                                   */}
      {/* ------------------------------------------------------------ */}

      <div
        className="
          container-page
          py-8
          md:py-10
          lg:py-12
        "
      >
        <div
          className={`
            relative
            overflow-hidden
            rounded-[1.75rem]
            border
            border-black/[0.06]
            p-3
            shadow-[0_24px_80px_rgba(0,0,0,0.10)]
            dark:border-white/[0.07]
            sm:p-4
            lg:p-5
            ${presentation.stage}
          `}
        >
          {/* -------------------------------------------------------- */}
          {/* Browser-style rail                                       */}
          {/* -------------------------------------------------------- */}

          <div
            className="
              mb-3
              flex
              h-7
              items-center
              justify-between
              px-1
              sm:mb-4
            "
          >
            <div
              className="
                flex
                items-center
                gap-1.5
              "
            >
              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-foreground/15
                "
              />

              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-foreground/10
                "
              />

              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-foreground/[0.07]
                "
              />
            </div>

            <span
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.18em]
                text-foreground/35
              "
            >
              {
                demo.productName
              }
            </span>
          </div>

          {/* -------------------------------------------------------- */}
          {/* Demo window                                              */}
          {/* -------------------------------------------------------- */}

          <div
            className={`
              overflow-hidden
              rounded-[1.25rem]
              border
              border-black/[0.07]
              shadow-xl
              dark:border-white/[0.07]
              ${presentation.surface}
            `}
          >
            <DemoViewport
  slug={demo.slug}
  mode={viewMode}
  disabled={
    demo.status !==
    'active'
  }
>
  {children}
</DemoViewport>
          </div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Footer metadata                                            */}
        {/* ---------------------------------------------------------- */}

        <div
          className="
            mt-5
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-4
              gap-y-2
              text-xs
              text-muted-foreground
            "
          >
            <span>
              {
                demo.title
              }
            </span>

            <span
              aria-hidden="true"
              className="
                hidden
                h-1
                w-1
                rounded-full
                bg-muted-foreground/30
                sm:block
              "
            />

            <span>
              {
                demo.difficulty
              }
            </span>

            <span
              aria-hidden="true"
              className="
                hidden
                h-1
                w-1
                rounded-full
                bg-muted-foreground/30
                sm:block
              "
            />

            <span>
              {
                demo.technologies.join(
                  ' · '
                )
              }
            </span>
          </div>

          <Link
            href={`/demos/${demo.slug}`}
            className="
              text-xs
              font-semibold
              text-foreground
              underline-offset-4
              hover:underline
            "
          >
            Demo overview
          </Link>
        </div>
      </div>

      {infoOpen && (
        <DemoInfoPanel
          demo={demo}
          onClose={() =>
            setInfoOpen(
              false
            )
          }
        />
      )}
    </section>
  );
}

/* ================================================================== */
/* Demo info panel                                                    */
/* ================================================================== */

function DemoInfoPanel({
  demo,
  onClose,
}: {
  demo: Demo;
  onClose: () => void;
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[70]
        flex
        items-center
        justify-center
        bg-black/45
        px-4
        backdrop-blur-sm
      "
      onClick={
        onClose
      }
    >
      <div
        className="
          relative
          w-full
          max-w-lg
          rounded-2xl
          border
          border-border
          bg-card
          p-6
          shadow-2xl
          md:p-8
        "
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          onClick={
            onClose
          }
          className="
            absolute
            right-4
            top-4
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            text-muted-foreground
            transition-colors
            hover:bg-muted
            hover:text-foreground
          "
          aria-label="Close info panel"
        >
          <X
            size={18}
          />
        </button>

        <span
          className={cn(
            `
              inline-flex
              rounded-full
              px-2.5
              py-1
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.12em]
            `,
            categoryBadgeColors[
              demo.category
            ]
          )}
        >
          {
            demo.category
          }
        </span>

        <h2
          className="
            mt-5
            font-heading
            text-2xl
            font-semibold
            tracking-tight
          "
        >
          {
            demo.productName
          }
        </h2>

        <p
          className="
            mt-1
            text-sm
            text-muted-foreground
          "
        >
          {
            demo.title
          }
        </p>

        <p
          className="
            mt-5
            text-sm
            leading-7
            text-muted-foreground
          "
        >
          {
            demo.longDescription
          }
        </p>

        {/* ---------------------------------------------------------- */}
        {/* Technologies                                               */}
        {/* ---------------------------------------------------------- */}

        <div
          className="
            mt-7
          "
        >
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-muted-foreground
            "
          >
            Technologies
          </p>

          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-2
            "
          >
            {demo.technologies.map(
              (
                technology
              ) => (
                <span
                  key={
                    technology
                  }
                  className="
                    rounded-full
                    border
                    border-border
                    bg-secondary/40
                    px-3
                    py-1
                    text-xs
                    font-medium
                    text-muted-foreground
                  "
                >
                  {
                    technology
                  }
                </span>
              )
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Tags                                                       */}
        {/* ---------------------------------------------------------- */}

        <div
          className="
            mt-6
          "
        >
          <p
            className="
              flex
              items-center
              gap-1.5
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-muted-foreground
            "
          >
            <Tag
              size={12}
            />

            Tags
          </p>

          <div
            className="
              mt-3
              flex
              flex-wrap
              gap-2
            "
          >
            {demo.tags.map(
              (
                tag
              ) => (
                <span
                  key={
                    tag
                  }
                  className="
                    rounded-full
                    bg-muted
                    px-2.5
                    py-1
                    text-xs
                    text-muted-foreground
                  "
                >
                  {
                    tag
                  }
                </span>
              )
            )}
          </div>
        </div>

        {/* ---------------------------------------------------------- */}
        {/* Difficulty                                                 */}
        {/* ---------------------------------------------------------- */}

        <div
          className="
            mt-7
            border-t
            border-border
            pt-5
          "
        >
          <span
            className="
              text-sm
              text-muted-foreground
            "
          >
            Difficulty:{' '}

            <span
              className="
                font-medium
                text-foreground
              "
            >
              {
                demo.difficulty
              }
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}