'use client';

import { NavbarMobileUtilities1 } from './NavbarMobileUtilities1';
import { NavbarMobileUtilities2 } from './NavbarMobileUtilities2';
import { NavbarMobileUtilities3 } from './NavbarMobileUtilities3';

const MOBILE_NAV_DESIGN: 1 | 2 | 3 = 3;

export type NavbarMobileUtilitiesProps = {
  surfaceActive: boolean;
  open: boolean;
  setOpen: (value: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (value: boolean) => void;
  settingsOpen: boolean;
  onSearchOpen: () => void;
};

export function NavbarMobileUtilities(
  props: NavbarMobileUtilitiesProps
) {
  if (MOBILE_NAV_DESIGN === 1) {
    return <NavbarMobileUtilities1 {...props} />;
  }

  if (MOBILE_NAV_DESIGN === 2) {
    return <NavbarMobileUtilities2 {...props} />;
  }

  return <NavbarMobileUtilities3 {...props} />;
}