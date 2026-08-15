import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
}

export function SettingsCard({
  title,
  description,
  children,
  className,
  titleClassName,
  descriptionClassName,
}: SettingsCardProps) {
  return (
    <section
      className={cn(
        `
          relative
          h-full
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-card
          p-4
          transition-colors
          hover:border-primary/20
        `,
        className
      )}
    >
      <div className="relative z-10">
        <div className="mb-3">
          <h3
            className={cn(
              `
                font-heading
                text-base
                font-semibold
              `,
              titleClassName
            )}
          >
            {title}
          </h3>

          <p
            className={cn(
              `
                mt-1
                text-xs
                leading-5
                text-muted-foreground
              `,
              descriptionClassName
            )}
          >
            {description}
          </p>
        </div>

        {children}
      </div>
    </section>
  );
}