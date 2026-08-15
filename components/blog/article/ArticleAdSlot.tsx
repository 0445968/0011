type ArticleAdSize =
  | 'medium'
  | 'tall';

interface ArticleAdSlotProps {
  size: ArticleAdSize;
  placement: string;
}

const sizeClasses: Record<
  ArticleAdSize,
  string
> = {
  medium: `
    aspect-[6/5]
    min-h-[220px]
  `,

  tall: `
    min-h-[520px]
  `,
};

const sizeLabels: Record<
  ArticleAdSize,
  string
> = {
  medium: '300 × 250',
  tall: '300 × 600',
};

export function ArticleAdSlot({
  size,
  placement,
}: ArticleAdSlotProps) {
  return (
    <div
      data-ad-placement={placement}
      className="w-full"
    >
      <p
        className="
          mb-3
          text-[9px]
          font-medium
          uppercase
          tracking-[0.18em]
          text-muted-foreground/50
        "
      >
        Advertisement
      </p>

      <div
        className={`
          flex
          w-full
          items-center
          justify-center
          overflow-hidden
          rounded-2xl
          border
          border-dashed
          border-border
          bg-secondary/20
          ${sizeClasses[size]}
        `}
      >
        <span
          className="
            text-[9px]
            font-medium
            uppercase
            tracking-[0.16em]
            text-muted-foreground/30
          "
        >
          {sizeLabels[size]}
        </span>
      </div>
    </div>
  );
}