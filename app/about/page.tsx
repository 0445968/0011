import type { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { About } from '@/components/portfolio/About';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Design Blade is an independent creative studio for teams who care about the details others overlook — design philosophy, development approach, and expertise.',
};

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="An independent studio for teams who care about the details."
        description="Design Blade works at the intersection of editorial design and modern web technology — turning ambitious ideas into shipped, polished products."
      />
      <About />
    </>
  );
}
