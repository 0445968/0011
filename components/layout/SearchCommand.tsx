'use client';

import {
  Search,
  X,
} from 'lucide-react';

import { cn } from '@/lib/utils';

export function SearchCommand({
  open,
  setOpen,
  onOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  onOpen?: () => void;
}) {
  const handleClick = () => {
    if (open) {
      setOpen(false);
      return;
    }

    /*
     * Navbar.tsx handles closing any
     * competing navigation surfaces.
     *
     * Search itself does not focus an
     * input here. Mobile focus is left
     * entirely to the user tapping the
     * actual search field.
     */
    onOpen?.();

    setOpen(true);
  };

  return (
    <div
      data-navbar-utility-trigger
      className="relative"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={
          open
            ? 'Close search'
            : 'Search'
        }
        aria-expanded={open}
        className={cn(
          `
            flex
            h-10
            w-10
            items-center
            justify-center

            rounded-full

            text-muted-foreground

            transition-colors
            duration-150

            hover:text-foreground
          `
        )}
      >
        {open ? (
          <X
            size={19}
            strokeWidth={2.25}
          />
        ) : (
          <Search
            size={19}
            strokeWidth={2.25}
          />
        )}
      </button>
    </div>
  );
}