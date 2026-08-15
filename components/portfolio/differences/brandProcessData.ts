export interface BrandProcessItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  preview: string;
  x: string;
  y: string;
}

const basePath = '/images/differences/brand-process';

export const brandProcessItems: BrandProcessItem[] = [
  {
    id: 'strategy',
    title: 'Strategy',
    description:
      'We define positioning, audience, goals, and the strategic direction the brand needs to own.',
    icon: `${basePath}/icons/strategy.png`,
    preview: `${basePath}/previews/strategy.jpg`,
    x: '8%',
    y: '50%',
  },
  {
    id: 'discovery',
    title: 'Discovery',
    description:
      'Research reveals audience insights, market context, competitors, and opportunities.',
    icon: `${basePath}/icons/discovery.png`,
    preview: `${basePath}/previews/discovery.jpg`,
    x: '35%',
    y: '57%',
  },
  {
    id: 'concept',
    title: 'Concept',
    description:
      'Insights become creative territories that establish the personality and direction of the brand.',
    icon: `${basePath}/icons/concept.png`,
    preview: `${basePath}/previews/concept.jpg`,
    x: '43%',
    y: '30%',
  },
  {
    id: 'identity',
    title: 'Identity',
    description:
      'Logo, typography, color, imagery, and graphic elements become one recognizable visual language.',
    icon: `${basePath}/icons/identity.png`,
    preview: `${basePath}/previews/identity.jpg`,
    x: '67.5%',
    y: '16%',
  },
  {
    id: 'voice',
    title: 'Voice',
    description:
      'Messaging, tone, and verbal personality shape how the brand communicates.',
    icon: `${basePath}/icons/voice.png`,
    preview: `${basePath}/previews/voice.jpg`,
    x: '35%',
    y: '85%',
  },
  {
    id: 'applications',
    title: 'Applications',
    description:
      'The identity is tested across the touchpoints where people actually experience the brand.',
    icon: `${basePath}/icons/applications.png`,
    preview: `${basePath}/previews/applications.jpg`,
    x: '57%',
    y: '70%',
  },
  {
    id: 'brand-system',
    title: 'Brand System',
    description:
      'Everything becomes a flexible system of guidelines, assets, components, and templates.',
    icon: `${basePath}/icons/brand-system.png`,
    preview: `${basePath}/previews/brand-system.jpg`,
    x: '67.5%',
    y: '44%',
  },
  {
    id: 'end-user',
    title: 'End User',
    description:
      'The result is a clear and consistent brand experience for the people it was created to reach.',
    icon: `${basePath}/icons/end-user.png`,
    preview: `${basePath}/previews/end-user.jpg`,
    x: '94%',
    y: '50%',
  },
];