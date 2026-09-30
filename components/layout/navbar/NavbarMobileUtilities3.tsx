'use client';

import Link from 'next/link';
import { Menu, Search } from 'lucide-react';

import type { NavbarMobileUtilitiesProps } from './NavbarMobileUtilities';

export function NavbarMobileUtilities3({
  surfaceActive,
  open,
  setOpen,
  searchOpen,
  setSearchOpen,
  settingsOpen,
  onSearchOpen,
}: NavbarMobileUtilitiesProps) {
  const panelOpen = open || searchOpen || settingsOpen;

  const handleSearch = () => {
    setOpen(false);
    onSearchOpen();
    setSearchOpen(true);
  };

  const handleMenu = () => {
    setSearchOpen(false);
    setOpen(true);
  };

  return (
    <>
      {/* Transparent navigation */}
      {!surfaceActive && !panelOpen && (
        <div
          className="
            fixed
            inset-x-0
            top-0
            z-[80]
            h-16
            lg:hidden
          "
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="Bivi home"
            className="
              absolute
              left-5
              top-1/2
              flex
              h-10
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

          {/* Right utilities */}
          <div
            className="
              absolute
              right-4
              top-1/2
              flex
              -translate-y-1/2
              items-center
              gap-1
            "
          >
            <button
              type="button"
              data-navbar-utility-trigger
              onClick={handleSearch}
              aria-label="Search"
              aria-expanded={searchOpen}
              className="
                flex
                h-10
                w-10
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

            <button
              type="button"
              onClick={handleMenu}
              aria-label="Open menu"
              aria-expanded={open}
              className="
                flex
                h-10
                w-10
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
        </div>
      )}

      {/* Sticky navigation */}
      {surfaceActive && !panelOpen && (
<div
  className="
    fixed
    inset-x-0
    top-0
    z-[80]
    h-[100px]
    animate-in
    fade-in
    duration-200
    lg:hidden
    drop-shadow-[0_8px_20px_rgba(0,0,0,0.18)]
    drop-shadow-[0_2px_6px_rgba(0,0,0,0.10)]
  "
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
"
          >
            <defs>
              <linearGradient
                id="mobileNavbarGlass3"
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
                id="mobileNavbarBorder3"
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

<defs>
  <linearGradient
    id="mobileNavbarGlass3"
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

  <filter
    id="mobileNavbarShadow3"
    x="-20%"
    y="-20%"
    width="140%"
    height="160%"
  >
    <feDropShadow
      dx="0"
      dy="8"
      stdDeviation="10"
      floodColor="#000000"
      floodOpacity="0.18"
    />
    <feDropShadow
      dx="0"
      dy="2"
      stdDeviation="3"
      floodColor="#000000"
      floodOpacity="0.10"
    />
  </filter>
</defs>

<g filter="url(#mobileNavbarShadow3)">
  <path
    fill="url(#mobileNavbarGlass3)"
    d="
      M0 0
      H375
      V56
      C375 60.4183 371.418 64 367 64

      H247

      C230 64 230 19 187.5 19
      C145 19 145 64 128 64

      H8
      C3.58172 64 0 60.4183 0 56

      V0
      Z
    "
  />

  <circle
    cx="187.5"
    cy="55"
    r="29"
    fill="url(#mobileNavbarGlass3)"
  />
</g>
          </svg>

          {/* Search */}
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

          {/* Center icon */}
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
              src="/images/bivi-icon.svg"
              alt=""
              aria-hidden="true"
              className="
                h-[25px]
                w-[25px]
                object-contain
              "
            />
          </Link>

          {/* Menu */}
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
      )}
    </>
  );
}