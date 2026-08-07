import type { TemplateCategory as TemplateCategoryType } from '@/data/templates';

interface TemplateCategoryProps {
  category: TemplateCategoryType;
  count?: number;
}

export function TemplateCategory({ category, count }: TemplateCategoryProps) {
  const displayCount = count ?? category.count;
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-serif text-lg font-semibold tracking-tight">
        {category.name}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {category.description}
      </p>
      <p className="mt-3 text-xs font-medium uppercase tracking-widest text-muted-foreground/70">
        {displayCount} {displayCount === 1 ? 'template' : 'templates'}
      </p>
    </div>
  );
}
