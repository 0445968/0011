import type { Metadata } from 'next';
import { IntegrationsBrowser } from '@/components/portfolio/IntegrationsBrowser';

export const metadata: Metadata = {
  title: 'Integrations',
  description:
    'Every tool Design Blade builds with — design, development, project management, and branding integrations, browsable by type.',
};

export default function IntegrationsPage() {
  return <IntegrationsBrowser />;
}
