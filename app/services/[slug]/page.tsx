import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AboutCustomers } from '@/components/home/about/AboutCustomers';

import { ServiceCapabilities } from '@/components/services/service-page/ServiceCapabilities';
import { ServiceCTA } from '@/components/services/service-page/ServiceCTA';
import { ServiceFeature } from '@/components/services/service-page/ServiceFeature';
import { ServiceHero } from '@/components/services/service-page/ServiceHero';
import { ServiceProductStrip } from '@/components/services/service-page/ServiceProductStrip';
import { ServiceShowcase } from '@/components/services/service-page/ServiceShowcase';
import { ServiceUseCases } from '@/components/services/service-page/ServiceUseCases';

import {
  getServicePage,
  getServicePageSlugs,
} from '@/data/servicePages';

type ServicePageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getServicePageSlugs().map(
    (slug) => ({
      slug,
    })
  );
}

export function generateMetadata({
  params,
}: ServicePageProps): Metadata {
  const service = getServicePage(
    params.slug
  );

  if (!service) {
    return {
      title: 'Service Not Found',
    };
  }

  return {
    title: service.seo.title,
    description:
      service.seo.description,
  };
}

export default function ServicePage({
  params,
}: ServicePageProps) {
  const service = getServicePage(
    params.slug
  );

  if (!service) {
    notFound();
  }

  return (
    <main
      className="
        overflow-hidden
        bg-[#010008]
      "
    >
      <ServiceHero
        service={service}
      />

      <ServiceProductStrip
        service={service}
      />

      <ServiceShowcase
        service={service}
      />

      <ServiceFeature
        service={service}
      />

      <ServiceUseCases
        service={service}
      />

      <ServiceCapabilities
        service={service}
      />





      <ServiceCTA
        service={service}
      />
    </main>
  );
}