'use client';

import { AboutCustomers } from './about/AboutCustomers';
import { AboutFeature } from './about/AboutFeature';

export function About() {
  return (
    <section
      id="about"
      className="
        relative
        overflow-hidden
        bg-background
        py-20
        sm:py-28
        lg:py-36
      "
    >
      <div className="container-page">
        <AboutCustomers />
        <AboutFeature />
      </div>
    </section>
  );
}