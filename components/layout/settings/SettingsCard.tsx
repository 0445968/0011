import { ReactNode } from 'react';

interface SettingsCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function SettingsCard({
  title,
  description,
  children,
}: SettingsCardProps) {
  return (
    <section
      className="
        h-full
        rounded-3xl
        border
        border-border
        bg-card
        p-6
        transition-colors
        hover:border-primary/20
      "
    >
      <div className="mb-6">
        <h3 className="font-heading text-xl font-semibold">
          {title}
        </h3>

        <p className="mt-2 text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}