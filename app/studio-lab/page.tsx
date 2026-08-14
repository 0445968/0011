import type { Metadata } from 'next';
import { StudioLabLanding } from '@/components/studio-lab/StudioLabLanding';

export const metadata: Metadata = {
  title: 'Studio Lab',
  description:
    'Interactive tools and brand assessments you can use right now. Invoice generators, color palettes, typing tests, brand health scores, and more.',
};

export default function StudioLabPage() {
  return <StudioLabLanding />;
}
