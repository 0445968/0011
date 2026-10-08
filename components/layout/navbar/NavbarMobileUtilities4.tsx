'use client';

import Link from 'next/link';

import {
  Menu,
} from 'lucide-react';

import { NavbarAccountControls } from './NavbarAccountControls';

import type {
  NavbarMobileUtilitiesProps,
} from './NavbarMobileUtilities';

export function NavbarMobileUtilities4({
  surfaceActive,
  open,
  setOpen,
  settingsOpen,
  onSignup,
}: NavbarMobileUtilitiesProps) {
  const panelOpen =
    open ||
    settingsOpen;

  const handleMenu = () => {
    setOpen(true);
  };

  return (
    <>
      {!surfaceActive &&
        !panelOpen && (
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
              <NavbarAccountControls
                surfaceActive={false}
                onSignup={onSignup}
                mobile
                mobileMode="signup"
              />

              <NavbarAccountControls
                surfaceActive={false}
                onSignup={onSignup}
                mobile
                mobileMode="account"
              />

              <button
                type="button"
                onClick={
                  handleMenu
                }
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
                  hover:bg-white/[0.08]
                "
              >
                <Menu
                  size={22}
                  strokeWidth={2.25}
                />
              </button>
            </div>
          </div>
        )}

      {surfaceActive &&
        !panelOpen && (
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
            "
          >
            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-x-0
                top-0
                h-[66px]
                rounded-b-[7px]
                bg-black
              "
            />

            <svg
              aria-hidden="true"
              viewBox="0 0 375 100"
              preserveAspectRatio="none"
              className="
                pointer-events-none
                absolute
                inset-0
                z-[1]
                h-full
                w-full
                overflow-visible
              "
            >
              <defs>
                <linearGradient
                  id="mobileNavbarGlass4"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#FFFFFF"
                    stopOpacity="0.94"
                  />

                  <stop
                    offset="100%"
                    stopColor="#FFFFFF"
                    stopOpacity="1"
                  />
                </linearGradient>
              </defs>

              <path
                fill="url(#mobileNavbarGlass4)"
                stroke="#000000"
                strokeWidth="1"
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
                fill="url(#mobileNavbarGlass4)"
                stroke="#000000"
                strokeWidth="2"
              />
            </svg>

            {/* ACCOUNT */}
            <div className="absolute left-5 top-[32px] z-10 -translate-y-1/2">
              <NavbarAccountControls
                surfaceActive
                onSignup={onSignup}
                mobile
                mobileMode="account"
                align="left"
              />
            </div>

            {/* CENTER LOGO */}
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

            <div
              className="
                absolute
                right-4
                top-[32px]
                z-10
                flex
                -translate-y-1/2
                items-center
                gap-1
              "
            >
              <NavbarAccountControls
                surfaceActive
                onSignup={onSignup}
                mobile
                mobileMode="signup"
              />

              <button
                type="button"
                onClick={
                  handleMenu
                }
                aria-label="Open menu"
                aria-expanded={open}
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  text-black
                  transition-colors
                  hover:bg-black/[0.05]
                "
              >
                <Menu
                  size={22}
                  strokeWidth={2.25}
                />
              </button>
            </div>
          </div>
        )}
    </>
  );
}