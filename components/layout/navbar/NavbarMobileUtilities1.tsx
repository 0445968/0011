'use client';

import Link from 'next/link';
import { Menu, Search } from 'lucide-react';

interface NavbarMobileUtilities1Props {
  surfaceActive: boolean;
  open: boolean;
  setOpen: (value: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (value: boolean) => void;
  settingsOpen: boolean;
  onSearchOpen: () => void;
}

export function NavbarMobileUtilities1({
  surfaceActive,
  open,
  setOpen,
  searchOpen,
  setSearchOpen,
  settingsOpen,
  onSearchOpen,
}: NavbarMobileUtilities1Props) {
  const panelOpen = open || searchOpen || settingsOpen;
  const showStickySurface = surfaceActive && !panelOpen;
  const showTransparentSurface = !surfaceActive && !panelOpen;

  const handleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false);
      return;
    }

    setOpen(false);
    onSearchOpen();
    setSearchOpen(true);
  };

  const handleMenu = () => {
    setSearchOpen(false);
    setOpen(!open);
  };

  return (
    <>
      {/* Transparent top navigation */}
      <div
        className={`
          fixed
          left-0
          right-0
          top-0
          z-[80]
          h-16
          transition-all
          duration-300
          lg:hidden
          ${
            showTransparentSurface
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-3 opacity-0'
          }
        `}
      >
        <button
          type="button"
          data-navbar-utility-trigger
          onClick={handleSearch}
          aria-label="Search"
          aria-expanded={searchOpen}
          className="
            absolute
            left-5
            top-1/2
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            text-white
            transition-colors
            duration-150
            hover:bg-white/[0.08]
          "
        >
          <Search size={21} strokeWidth={2.25} />
        </button>

        <Link
          href="/"
          aria-label="Bivi home"
          className="
            absolute
            left-1/2
            top-1/2
            flex
            h-10
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
          "
        >
          <img
            src="/images/logo.svg"
            alt=""
            aria-hidden="true"
            className="
              h-[27px]
              w-auto
              brightness-0
              invert
            "
          />
        </Link>

        <button
          type="button"
          onClick={handleMenu}
          aria-label="Open menu"
          aria-expanded={open}
          className="
            absolute
            right-5
            top-1/2
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            text-white
            transition-colors
            duration-150
            hover:bg-white/[0.08]
          "
        >
          <Menu size={22} strokeWidth={2.25} />
        </button>
      </div>

      {/* Sticky top navigation */}
      <div
        className={`
          fixed
          left-3
          right-3
          top-3
          z-[80]
          h-[100px]
          transition-all
          duration-300
          lg:hidden
          ${
            showStickySurface
              ? 'pointer-events-auto translate-y-0 opacity-100'
              : 'pointer-events-none -translate-y-4 opacity-0'
          }
        `}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 375 100"
          preserveAspectRatio="none"
          className="
            pointer-events-none
            absolute
            inset-0
            h-full
            w-full
            overflow-visible
            drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)]
            drop-shadow-[0_2px_6px_rgba(0,0,0,0.10)]
          "
        >
          <defs>
            <linearGradient
              id="mobileNavbarGlass1"
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
                stopColor="#FFFFFF"
                stopOpacity="0.94"
              />
            </linearGradient>

            <linearGradient
              id="mobileNavbarBorder1"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#FFFFFF"
                stopOpacity="0.9"
              />
              <stop
                offset="100%"
                stopColor="#D8D8D8"
                stopOpacity="0.8"
              />
            </linearGradient>
          </defs>

          <path
            fill="url(#mobileNavbarGlass1)"
            stroke="url(#mobileNavbarBorder1)"
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

          <circle
            cx="187.5"
            cy="55"
            r="29"
            fill="url(#mobileNavbarGlass1)"
            stroke="url(#mobileNavbarBorder1)"
            strokeWidth="1"
          />
        </svg>

        <button
          type="button"
          data-navbar-utility-trigger
          onClick={handleSearch}
          aria-label="Search"
          aria-expanded={searchOpen}
          className="
            absolute
            left-5
            top-[32px]
            z-10
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            text-black
            transition-colors
            duration-150
            hover:bg-black/[0.05]
          "
        >
          <Search size={21} strokeWidth={2.25} />
        </button>

        <Link
          href="/"
          aria-label="Bivi home"
          className="
            absolute
            left-1/2
            top-[55px]
            z-10
            flex
            h-[58px]
            w-[58px]
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
          "
        >
          <img
            src="/images/bivi-icon.png"
            alt=""
            aria-hidden="true"
            className="
              h-[25px]
              w-[25px]
              object-contain
            "
          />
        </Link>

        <button
          type="button"
          onClick={handleMenu}
          aria-label="Open menu"
          aria-expanded={open}
          className="
            absolute
            right-5
            top-[32px]
            z-10
            flex
            h-10
            w-10
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            text-black
            transition-colors
            duration-150
            hover:bg-black/[0.05]
          "
        >
          <Menu size={22} strokeWidth={2.25} />
        </button>
      </div>
    </>
  );
}