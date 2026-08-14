import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ResourceLibrary } from '@/components/resources/ResourceLibrary';

export const metadata: Metadata = {
  title: 'Resource Library',
  description:
    'A free library of downloadable design guides, interactive tools, and curated links for designers and founders — color systems, brand identity, trademarks, patents, naming, and more.',
};

export default function ResourcesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32" />}>
      <ResourceLibrary />
    </Suspense>
  );
}
