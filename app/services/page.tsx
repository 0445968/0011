import type { Metadata } from 'next';

import { AboutCustomers } from '@/components/home/about/AboutCustomers';

import { ServicesPageHero } from '@/components/services/ServicesPageHero';
import { ServiceTypeSection } from '@/components/services/ServiceTypeSection';

import { BackToTopButton } from '@/components/services/BackToTopButton';

import { services } from '@/data/services';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Branding, creative direction, packaging, presentations, print, web and digital, mobile apps, campaigns, social media, and email design from Bivi.',
};

export default function ServicesPage() {
  return (
    <main
      className="
        overflow-hidden
        bg-[#010008]
      "
    >
      <ServicesPageHero />

      {services.map((service, index) => (
        <ServiceTypeSection
          key={service.id}
          service={service}
          index={index}
          anchorId={
            service.id === 'web-design'
              ? 'web-digital'
              : service.id
          }
        />
      ))}

      <AboutCustomers />

      <BackToTopButton />
    </main>
  );
}