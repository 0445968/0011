'use client';

import Link from 'next/link';

import {
  Menu,
  Search,
  X,
} from 'lucide-react';

interface NavbarMobileUtilitiesProps {
  surfaceActive: boolean;

  open: boolean;
  setOpen: (value: boolean) => void;

  searchOpen: boolean;
  setSearchOpen: (value: boolean) => void;

  settingsOpen: boolean;

  onSearchOpen: () => void;
}

export function NavbarMobileUtilities({
  surfaceActive,
  open,
  setOpen,
  searchOpen,
  setSearchOpen,
  settingsOpen,
  onSearchOpen,
}: NavbarMobileUtilitiesProps) {
  const panelOpen =
    open ||
    searchOpen ||
    settingsOpen;

  /*
   * The shaped sticky navbar only appears
   * when the navbar surface is active AND
   * no menu/utility panel is open.
   */
  const showStickySurface =
    surfaceActive && !panelOpen;

  const handleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      return;
    }

    onSearchOpen();
    setSearchOpen(true);
  };

  const handleMenu = () => {
    setSearchOpen(false);
    setOpen(!open);
  };

  return (
    <div
      className="
        absolute
        left-3
        right-3
        top-3
        z-[80]
        h-[100px]
        lg:hidden
      "
    >
      {/* ================================================== */}
      {/* STICKY NAVBAR SHAPE                               */}
      {/* ================================================== */}

      <svg
        aria-hidden="true"
        viewBox="0 0 375 100"
        preserveAspectRatio="none"
        className={`
          pointer-events-none
          absolute
          inset-0
          h-full
          w-full
          overflow-visible

          transition-[opacity,filter]
          duration-300

          ${
            showStickySurface
              ? `
                  opacity-100
                  drop-shadow-[0_8px_20px_rgba(0,0,0,0.24)]
                  drop-shadow-[0_2px_6px_rgba(0,0,0,0.18)]
                `
              : 'opacity-0'
          }
        `}
      >
        <defs>
          <linearGradient
            id="mobileNavbarGlass"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#FFFFFF"
              stopOpacity="1"
            />

            <stop
              offset="100%"
              stopColor="#FFFFFF"
              stopOpacity="0.98"
            />
          </linearGradient>

          <linearGradient
            id="mobileNavbarBorder"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#FFFFFF"
              stopOpacity="0.98"
            />

            <stop
              offset="100%"
              stopColor="#D8D8D8"
              stopOpacity="0.9"
            />
          </linearGradient>
        </defs>

        {/* Main bar */}

        <path
          fill="url(#mobileNavbarGlass)"
          stroke="url(#mobileNavbarBorder)"
          strokeWidth="1"
          fillRule="evenodd"
          clipRule="evenodd"
          d="
            M26 0
            H349

            C363.36 0 375 11.64 375 26

            V56

            C375 60.4183 371.418 64 367 64

            H247

            C230 64 230 19 187.5 19

            C145 19 145 64 128 64

            H8

            C3.58172 64 0 60.4183 0 56

            V26

            C0 11.64 11.64 0 26 0

            Z
          "
        />

        {/* Center circle */}

        <circle
          cx="187.5"
          cy="55"
          r="29"
          fill="url(#mobileNavbarGlass)"
          stroke="url(#mobileNavbarBorder)"
          strokeWidth="1"
        />
      </svg>

      {/* ================================================== */}
      {/* SEARCH                                            */}
      {/* ================================================== */}

      <button
        type="button"
        data-navbar-utility-trigger
        onClick={handleSearch}
        aria-label={
          searchOpen
            ? 'Close search'
            : 'Search'
        }
        aria-expanded={searchOpen}
        className={`
          absolute
          left-5
          top-[32px]
          z-20

          flex
          h-10
          w-10
          -translate-y-1/2
          items-center
          justify-center

          rounded-full

          transition-[color,background-color,opacity]
          duration-300

          ${
            panelOpen
              ? 'opacity-0 pointer-events-none'
              : showStickySurface
                ? `
                    text-black
                    hover:bg-black/[0.05]
                    active:bg-black/[0.08]
                  `
                : `
                    text-white
                    hover:bg-white/[0.08]
                    active:bg-white/[0.12]
                  `
          }
        `}
      >
        <Search
          size={21}
          strokeWidth={2.25}
        />
      </button>

      {/* ================================================== */}
      {/* CENTER BRAND                                      */}
      {/* ================================================== */}

      <Link
        href="/"
        aria-label="Bivi home"
        className={`
          absolute
          left-1/2
          z-20

          flex
          -translate-x-1/2
          -translate-y-1/2
          items-center
          justify-center

          transition-[top,width,height,opacity,transform]
          duration-300

          ${
            panelOpen
              ? 'pointer-events-none opacity-0'
              : showStickySurface
                ? `
                    top-[55px]
                    h-[58px]
                    w-[58px]
                    rounded-full
                    opacity-100
                  `
                : `
                    top-[32px]
                    h-10
                    w-auto
                    opacity-100
                  `
          }
        `}
      >
        {/* ================================================== */}
        {/* TRANSPARENT STATE — MAIN LOGO                    */}
        {/* ================================================== */}

        <img
          src="/images/logo.svg"
          alt=""
          aria-hidden="true"
          className={`
            absolute
            w-auto

            brightness-0
            invert

            transition-[opacity,transform]
            duration-300

            ${
              showStickySurface
                ? `
                    scale-90
                    opacity-0
                  `
                : `
                    h-[24px]
                    scale-100
                    opacity-100
                  `
            }
          `}
        />

        {/* ================================================== */}
        {/* STICKY STATE — BIVI ICON                          */}
        {/* ================================================== */}

        <img
          src="/images/bivi-icon.png"
          alt=""
          aria-hidden="true"
          className={`
            absolute
            h-[25px]
            w-auto

            object-contain

            transition-[opacity,transform]
            duration-300

            ${
              showStickySurface
                ? `
                    scale-100
                    opacity-100
                  `
                : `
                    scale-90
                    opacity-0
                  `
            }
          `}
        />
      </Link>

      {/* ================================================== */}
      {/* MENU                                              */}
      {/* ================================================== */}

      <button
        type="button"
        onClick={handleMenu}
        aria-label={
          open
            ? 'Close menu'
            : 'Open menu'
        }
        aria-expanded={open}
        className={`
          absolute
          right-5
          top-[32px]
          z-20

          flex
          h-10
          w-10
          -translate-y-1/2
          items-center
          justify-center

          rounded-full

          transition-[color,background-color,opacity]
          duration-300

          ${
            panelOpen
              ? 'opacity-0 pointer-events-none'
              : showStickySurface
                ? `
                    text-black
                    hover:bg-black/[0.05]
                    active:bg-black/[0.08]
                  `
                : `
                    text-white
                    hover:bg-white/[0.08]
                    active:bg-white/[0.12]
                  `
          }
        `}
      >
        <Menu
          size={22}
          strokeWidth={2.25}
        />
      </button>
    </div>
  );
}