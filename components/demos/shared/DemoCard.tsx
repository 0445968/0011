'use client';

import Link from 'next/link';

import {
  motion,
} from 'framer-motion';

import {
  ArrowUpRight,
  Eye,
} from 'lucide-react';

import {
  cn,
} from '@/lib/utils';

import type {
  Demo,
  DemoCategory,
} from '@/data/demos/registry';

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

interface DemoCardProps {
  demo: Demo;
  index?: number;
}

export function DemoCard({
  demo,
  index = 0,
}: DemoCardProps) {
  const isComingSoon =
    demo.status ===
    'coming-soon';

  const isPlanned =
    demo.status ===
    'planned';

  const isActive =
    demo.status ===
    'active';

  const {
    presentation,
  } = demo;

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay:
          Math.min(
            index * 0.06,
            0.36
          ),
        ease: [
          0.16,
          1,
          0.3,
          1,
        ],
      }}
      className="
        group
        relative
        flex
        h-full
        flex-col
        overflow-hidden
        rounded-[1.5rem]
        border
        border-border
        bg-card
        transition-[border-color,box-shadow,transform]
        duration-300
        hover:-translate-y-1
        hover:border-foreground/15
        hover:shadow-xl
      "
    >
      {/* ========================================================== */}
      {/* Product preview                                            */}
      {/* ========================================================== */}

      <Link
        href={
          isActive
            ? demo.href
            : '#'
        }
        aria-disabled={
          !isActive
        }
        tabIndex={
          isActive
            ? undefined
            : -1
        }
        className={cn(
          `
            relative
            block
            aspect-[16/10]
            overflow-hidden
            p-3
            sm:p-4
          `,
          presentation.stage,
          !isActive &&
            'cursor-default'
        )}
      >
        {/* -------------------------------------------------------- */}
        {/* Mini product shell                                       */}
        {/* -------------------------------------------------------- */}

        <div
          className={cn(
            `
              relative
              h-full
              overflow-hidden
              rounded-[1.15rem]
              border
              border-black/[0.06]
              shadow-[0_18px_45px_rgba(0,0,0,0.10)]
              transition-transform
              duration-500
              ease-[cubic-bezier(0.16,1,0.3,1)]
              group-hover:scale-[1.015]
              dark:border-white/[0.07]
            `,
            presentation.surface
          )}
        >
          {/* Browser rail */}
          <div
            className="
              absolute
              inset-x-0
              top-0
              z-20
              flex
              h-7
              items-center
              justify-between
              border-b
              border-black/[0.05]
              bg-inherit
              px-2.5
              dark:border-white/[0.05]
            "
          >
            <div
              className="
                flex
                items-center
                gap-1
              "
            >
              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-foreground/20
                "
              />

              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-foreground/12
                "
              />

              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-foreground/[0.07]
                "
              />
            </div>

            <span
              className={cn(
                `
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                `,
                presentation.muted
              )}
            >
              {
                demo.productName
              }
            </span>
          </div>

          {/* ------------------------------------------------------ */}
          {/* Preview image                                          */}
          {/* ------------------------------------------------------ */}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              demo.thumbnail
            }
            alt={`${demo.productName} preview`}
            loading="lazy"
            decoding="async"
            className="
              h-full
              w-full
              object-cover
              object-top
              pt-7
              transition-transform
              duration-700
              ease-[cubic-bezier(0.16,1,0.3,1)]
              group-hover:scale-[1.025]
            "
          />

          <div
            aria-hidden="true"
            className="
              pointer-events-none
              absolute
              inset-0
              bg-gradient-to-t
              from-black/[0.08]
              via-transparent
              to-transparent
            "
          />
        </div>

        {/* -------------------------------------------------------- */}
        {/* Category badge                                           */}
        {/* -------------------------------------------------------- */}

        <span
          className={cn(
            `
              absolute
              left-5
              top-5
              z-30
              rounded-full
              px-2.5
              py-1
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.12em]
              backdrop-blur-xl
              sm:left-6
              sm:top-6
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

        {/* -------------------------------------------------------- */}
        {/* Status badge                                             */}
        {/* -------------------------------------------------------- */}

        {(isComingSoon ||
          isPlanned) && (
          <span
            className="
              absolute
              right-5
              top-5
              z-30
              rounded-full
              border
              border-border/60
              bg-background/85
              px-2.5
              py-1
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.1em]
              text-muted-foreground
              backdrop-blur-xl
              sm:right-6
              sm:top-6
            "
          >
            {isComingSoon
              ? 'Coming soon'
              : 'Planned'}
          </span>
        )}

        {/* -------------------------------------------------------- */}
        {/* Hover action                                             */}
        {/* -------------------------------------------------------- */}

        {isActive && (
          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-40
              flex
              items-center
              justify-center
              bg-black/[0.08]
              opacity-0
              transition-opacity
              duration-300
              group-hover:opacity-100
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-background/95
                px-4
                py-2
                text-xs
                font-semibold
                text-foreground
                shadow-lg
                backdrop-blur-xl
              "
            >
              <Eye
                size={14}
              />

              View demo
            </span>
          </div>
        )}
      </Link>

      {/* ========================================================== */}
      {/* Card body                                                  */}
      {/* ========================================================== */}

      <div
        className="
          flex
          flex-1
          flex-col
          px-5
          pb-5
          pt-5
          sm:px-6
          sm:pb-6
        "
      >
        {/* -------------------------------------------------------- */}
        {/* Heading                                                  */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-5
          "
        >
          <div>
            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.16em]
                text-muted-foreground
              "
            >
              {
                demo.title
              }
            </p>

            <h3
              className="
                mt-2
                font-heading
                text-xl
                font-semibold
                leading-tight
                tracking-[-0.025em]
              "
            >
              {
                demo.productName
              }
            </h3>
          </div>

          {isActive && (
            <Link
              href={
                demo.href
              }
              aria-label={`View ${demo.productName} demo`}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#BBFF1B]
                text-black
                transition-transform
                duration-300
                group-hover:-translate-y-0.5
                group-hover:translate-x-0.5
              "
            >
              <ArrowUpRight
                size={15}
              />
            </Link>
          )}
        </div>

        {/* -------------------------------------------------------- */}
        {/* Description                                              */}
        {/* -------------------------------------------------------- */}

        <p
  className="
    mt-4
    mb-6
    line-clamp-2
    text-sm
    leading-6
    text-muted-foreground
  "
>
  {demo.shortDescription}
</p>

        {/* -------------------------------------------------------- */}
        {/* Footer                                                   */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mt-auto
            flex
            items-center
            justify-between
            border-t
            border-border
            pt-5
          "
        >
          <span
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.16em]
              text-muted-foreground
            "
          >
            {
              demo.difficulty
            }
          </span>

          {isActive ? (
            <Link
              href={
                demo.href
              }
              className="
                group/link
                inline-flex
                items-center
                gap-1.5
                text-sm
                font-semibold
                text-foreground
              "
            >
              View demo

              <ArrowUpRight
                size={14}
                className="
                  transition-transform
                  duration-300
                  group-hover/link:-translate-y-0.5
                  group-hover/link:translate-x-0.5
                "
              />
            </Link>
          ) : (
            <span
              className="
                text-xs
                font-medium
                text-muted-foreground
              "
            >
              Not available yet
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}