'use client';

import { NavbarMobileUtilities4 } from './NavbarMobileUtilities4';

export type NavbarMobileUtilitiesProps = {
  surfaceActive: boolean;

  open: boolean;
  setOpen: (
    value: boolean
  ) => void;

  settingsOpen: boolean;

  onLogin: () => void;
  onSignup: () => void;
};

export function NavbarMobileUtilities(
  props: NavbarMobileUtilitiesProps
) {
  return (
    <NavbarMobileUtilities4
      {...props}
    />
  );
}