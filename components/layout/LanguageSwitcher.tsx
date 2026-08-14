'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { CircleFlag } from 'react-circle-flags';

import { useI18n } from '@/lib/i18n/context';
import {
  locales,
  localeNames,
  localeFlags,
  type Locale,
} from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { locale, setLocale } = useI18n();

  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        aria-label="Change language"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          compact
            ? `
              group
              flex
              h-8
              items-center
              gap-1
              rounded-full
              border
              border-white/15
              bg-background/10
              pl-1
              pr-2
              backdrop-blur-xl
              transition-all
              duration-300
              hover:border-secondary
              hover:bg-background/15
            `
            : `
              flex
              h-9
              items-center
              gap-2
              rounded-full
              border
              border-border
              bg-background
              px-2
              transition-colors
              hover:bg-muted
            `
        )}
      >
        <motion.div
          layout
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
          className="
            flex
            h-4
            w-4
            items-center
            justify-center
            rounded-full
            bg-background
            shadow-md
          "
        >
          <CircleFlag
            countryCode={localeFlags[locale]}
            height={10}
          />
        </motion.div>

        <span
          className={cn(
            'font-semibold uppercase tracking-[0.15em]',
            compact ? 'text-[10px]' : 'text-xs'
          )}
        >
          {locale}
        </span>

        <ChevronDown
          size={10}
          className={cn(
            'transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              y: -6,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -6,
              scale: 0.96,
            }}
            transition={{
              duration: 0.15,
            }}
            className={cn(
              `
              absolute
              z-50
              overflow-hidden
              rounded-2xl
              border
              border-border
              bg-popover/95
              p-1.5
              shadow-2xl
              backdrop-blur-xl
            `,
              compact
                ? 'bottom-full right-0 mb-2 w-44'
                : 'top-full right-0 mt-2 w-48'
            )}
          >
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLocale(l);
                  setOpen(false);
                }}
                className={cn(
                  `
                    flex
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    px-2
                    py-2
                    transition-colors
                  `,
                  locale === l
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      bg-background
                      shadow-sm
                    "
                  >
                    <CircleFlag
                      countryCode={localeFlags[l]}
                      height={18}
                    />
                  </div>

                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">
                      {localeNames[l]}
                    </span>

                    <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      {l}
                    </span>
                  </div>
                </div>

                {locale === l && <Check size={14} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}