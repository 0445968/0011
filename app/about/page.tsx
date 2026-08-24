import type { Metadata } from 'next';

import { AboutMission } from '@/components/about/AboutMission';
import { AboutWhyUs } from '@/components/about/AboutWhyUs';
import { AboutFaq } from '@/components/about/AboutFaq';
import { AboutGetStarted } from '@/components/about/AboutGetStarted';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Bivi is a graphic design and brand strategy studio based in Houston, Texas, creating distinctive identities, visual systems, and brand experiences.',
};

export default function AboutPage() {
  return (
    <main>
      <AboutMission />
      <AboutWhyUs />
      <AboutFaq />
      <AboutGetStarted />
    </main>
  );
}