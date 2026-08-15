'use client';

interface JournalCategoryNavProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function JournalCategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
}: JournalCategoryNavProps) {
  return (
    <nav
      className="
        scrollbar-none
        flex
        items-center
        gap-7
        overflow-x-auto
        border-b
        border-border
        py-4
        md:gap-8
      "
      aria-label="Journal categories"
    >
      {categories.map((category) => {
        const isActive = activeCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`
              relative
              shrink-0
              py-1
              text-sm
              font-medium
              transition-colors
              duration-300
              ${
                isActive
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            {category}

            <span
              aria-hidden="true"
              className={`
                absolute
                -bottom-[17px]
                left-0
                h-[2px]
                bg-accent
                transition-all
                duration-300
                ease-out
                ${
                  isActive
                    ? 'w-full opacity-100'
                    : 'w-0 opacity-0'
                }
              `}
            />
          </button>
        );
      })}
    </nav>
  );
}