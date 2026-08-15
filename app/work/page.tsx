import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { Projects } from '@/components/portfolio/Projects';

export const metadata: Metadata = {
  title: 'Work',
  description:
    'Selected projects from Design Blade — SaaS platforms, ecommerce, fintech, branding, and editorial websites designed and built end-to-end.',
};

export default function WorkPage() {
  return (
    <>
      <PageHeader
        eyebrow="Selected Work"
        title="Projects shipped, not just dreamed up."
        description="A portfolio of websites, products, and brand systems designed and built end-to-end."
      />
      <Projects />
    </>
  );
}
