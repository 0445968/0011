import type { Metadata } from 'next';
import { Contact } from '@/components/portfolio/Contact';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Start a project with Design Blade — have an idea, or curious about a resource? Send a note and hear back within a day.',
};

export default function ContactPage() {
  return (
    <div className="pt-16 md:pt-24">
      <Contact />
    </div>
  );
}
