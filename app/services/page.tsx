import type { Metadata } from 'next';

import { AboutCustomers } from '@/components/home/about/AboutCustomers';

import { ServicesPageHero } from '@/components/services/ServicesPageHero';
import { ServiceTypeSection } from '@/components/services/ServiceTypeSection';
import { ServiceCTA } from '@/components/services/service-page/ServiceCTA';

import { services } from '@/data/services';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Branding, creative direction, web and digital, campaigns, print, packaging, social media, email, and more from Bivi.',
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

      {services.map((service) => (
        <ServiceTypeSection
          key={service.id}
          service={service}
          anchorId={
            service.id === 'web-design'
              ? 'web-digital'
              : service.id
          }
        />
      ))}

      <ServiceCTA
        service={{
          title: 'Services',
        } as any}
      />
    </main>
  );
}