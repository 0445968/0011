'use client';

import {
  Bug,
  FileText,
  LifeBuoy,
  Lightbulb,
} from 'lucide-react';

import { SettingsCard } from './SettingsCard';

const actions = [
  {
    title: 'Report a bug',
    description: 'Something not working?',
    icon: Bug,
    href: '/support/bug',
  },
  {
    title: 'Request a feature',
    description: 'Suggest an improvement.',
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
    description: 'Get in touch with us.',
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
      <div
        className="
          grid
          grid-cols-2
          gap-2
        "
      >
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <a
              key={action.title}
              href={action.href}
              className="
                flex
                min-w-0
                items-center
                gap-2.5
                rounded-xl
                border
                border-border
                p-2.5
                transition-all
                hover:border-primary/40
                hover:bg-muted/30
              "
            >
              <div
                className="
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  bg-primary/10
                "
              >
                <Icon
                  size={15}
                  className="text-primary"
                />
              </div>

              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-xs
                    font-medium
                  "
                >
                  {action.title}
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-[11px]
                    text-muted-foreground
                  "
                >
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