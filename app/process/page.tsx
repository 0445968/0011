import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { CaseStudy } from '@/components/portfolio/CaseStudy';

export const metadata: Metadata = {
  title: 'Process',
  description:
    'How Design Blade builds projects — from discovery and design systems to prototyping and incremental delivery, with measurable results.',
};

export default function ProcessPage() {
  return (
    <>
      <PageHeader
        eyebrow="Process · Case Study"
        title="How projects are built."
        description="Discovery, design systems, prototyping, and incremental delivery — measured at every step."
      />
      <CaseStudy />
    </>
  );
}
