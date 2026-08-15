import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Services } from '@/components/portfolio/Services';

export const metadata: Metadata = {
  title: 'Services',
  description:
    'Website design, frontend development, UI/UX, branding systems, SaaS applications, and creative direction — a full-stack creative practice from Design Blade.',
};

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="A full-stack creative practice."
        description="From first sketch to shipped product — design, build, and the systems that keep them consistent at scale."
      />
      <Services />
    </>
  );
}
