'use client';

import Link from 'next/link';

import {
  ArrowUpRight,
} from 'lucide-react';

import {
  helpShortcuts,
} from '@/data/help-center/categories';

const shortcutStyles = [
  {
    background:
      'bg-[#0B65F3]/10 dark:bg-[#0B65F3]/15',
    hover:
      'hover:bg-[#0B65F3]/15 dark:hover:bg-[#0B65F3]/20',
    icon:
      'bg-[#0B65F3]/15 text-[#0B65F3] dark:bg-[#0B65F3]/25',
  },
  {
    background:
      'bg-[#20C997]/10 dark:bg-[#20C997]/15',
    hover:
      'hover:bg-[#20C997]/15 dark:hover:bg-[#20C997]/20',
    icon:
      'bg-[#20C997]/15 text-[#159A75] dark:bg-[#20C997]/25 dark:text-[#4DE0B4]',
  },
  {
    background:
      'bg-[#FFD400]/10 dark:bg-[#FFD400]/10',
    hover:
      'hover:bg-[#FFD400]/20 dark:hover:bg-[#FFD400]/15',
    icon:
      'bg-[#FFD400]/20 text-[#9A7900] dark:bg-[#FFD400]/20 dark:text-[#FFD400]',
  },
  {
    background:
      'bg-[#A855F7]/10 dark:bg-[#A855F7]/15',
    hover:
      'hover:bg-[#A855F7]/15 dark:hover:bg-[#A855F7]/20',
    icon:
      'bg-[#A855F7]/15 text-[#9333EA] dark:bg-[#A855F7]/25 dark:text-[#C084FC]',
  },
];

export function HelpShortcutRow() {
  return (
    <section
      className="
        bg-background
        py-6
        sm:py-7
        lg:py-8
      "
    >
      <div className="container-page">
        <div
          className="
            grid
            gap-2.5
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          {helpShortcuts.map(
            (shortcut, index) => {
              const Icon =
                shortcut.icon;

              const style =
                shortcutStyles[
                  index %
                    shortcutStyles.length
                ];

              return (
                <Link
                  key={shortcut.id}
                  href={shortcut.href}
                  className={`
                    group
                    flex
                    min-h-[64px]
                    items-center
                    justify-between
                    gap-2.5
                    rounded-xl
                    px-3
                    py-2.5
                    transition-all
                    duration-300
                    hover:-translate-y-0.5
                    ${style.background}
                    ${style.hover}
                  `}
                >
                  {/* -------------------------------------------------- */}
                  {/* Left                                               */}
                  {/* -------------------------------------------------- */}

                  <div
                    className="
                      flex
                      min-w-0
                      items-center
                      gap-2.5
                    "
                  >
                    <div
                      className={`
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        ${style.icon}
                      `}
                    >
                      <Icon
                        size={21}
                        strokeWidth={2}
                      />
                    </div>

                    <h3
                      className="
                        truncate
                        text-[15px]
                        font-semibold
                        tracking-[-0.02em]
                        text-foreground
                        sm:text-base
                      "
                    >
                      {shortcut.title}
                    </h3>
                  </div>

                  {/* -------------------------------------------------- */}
                  {/* Arrow                                              */}
                  {/* -------------------------------------------------- */}

                  <ArrowUpRight
                    size={17}
                    strokeWidth={2}
                    className="
                      mr-0.5
                      shrink-0
                      text-foreground/55
                      transition-all
                      duration-300
                      group-hover:-translate-y-0.5
                      group-hover:translate-x-0.5
                      group-hover:text-foreground
                    "
                  />
                </Link>
              );
            }
          )}
        </div>
      </div>
    </section>
  );
}