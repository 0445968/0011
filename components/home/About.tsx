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
        pt-20
        pb-8
        sm:pt-28
        sm:pb-10
        lg:pt-36
        lg:pb-12
      "
    >
      <div className="container-page">
        <AboutCustomers />
        <AboutFeature />
      </div>
    </section>
  );
}