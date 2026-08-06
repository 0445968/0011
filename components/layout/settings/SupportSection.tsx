'use client';

import {
  Bug,
  Lightbulb,
  LifeBuoy,
  FileText,
} from 'lucide-react';

import { SettingsCard } from './SettingsCard';

const actions = [
  {
    title: 'Report a bug',
    description: 'Found something that is not working?',
    icon: Bug,
    href: '/support/bug',
  },
  {
    title: 'Request a feature',
    description: 'Help shape future updates.',
    icon: Lightbulb,
    href: '/support/feature-request',
  },
  {
    title: 'Documentation',
    description: 'Browse guides and tutorials.',
    icon: FileText,
    href: '/docs',
  },
  {
    title: 'Contact support',
    description: 'Need help? Get in touch.',
    icon: LifeBuoy,
    href: '/contact',
  },
];

export function SupportSection() {
  return (
    <SettingsCard
      title="Support"
      description="Need help or have feedback?"
    >
      <div className="grid gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <a
              key={action.title}
              href={action.href}
              className="
                flex
                items-center
                gap-4
                rounded-2xl
                border
                border-border
                p-4
                transition-all
                hover:border-primary/40
                hover:bg-muted/30
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-xl
                  bg-primary/10
                "
              >
                <Icon
                  size={20}
                  className="text-primary"
                />
              </div>

              <div>
                <p className="font-medium">
                  {action.title}
                </p>

                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </SettingsCard>
  );
}