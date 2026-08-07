import type { Metadata } from 'next';
import { BlogList } from '@/components/blog/BlogList';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    'Notes on design, engineering, and craft from the Atelier studio — essays on typography, process, UX, and building for the long game.',
  openGraph: {
    title: 'Journal — Atelier',
    description:
      'Notes on design, engineering, and craft from the Atelier studio.',
  },
};

export default function BlogPage() {
  return <BlogList />;
}
