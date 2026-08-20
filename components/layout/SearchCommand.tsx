'use client';

import { Search } from 'lucide-react';

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
    /*
     * If Search is already open,
     * clicking the icon again closes it.
     */
    if (open) {
      setOpen(false);
      return;
    }

    /*
     * Opening Search lets Navbar.tsx
     * close Settings / Mega Menu first.
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
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-muted-foreground
          hover:text-foreground
        "
      >
        <Search
          size={19}
          strokeWidth={2.25}
        />
      </button>
    </div>
  );
}