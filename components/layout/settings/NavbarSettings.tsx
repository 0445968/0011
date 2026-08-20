'use client';

import {
  SlidersHorizontal,
} from 'lucide-react';

export function NavbarSettings({
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
            ? 'Close preferences'
            : 'Preferences'
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
        <SlidersHorizontal
          size={19}
          strokeWidth={2.25}
        />
      </button>
    </div>
  );
}