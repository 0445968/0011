'use client';

import { ArrowUpRight } from 'lucide-react';

import type { SearchResult } from '@/data/search';

export function SearchPreview({
  selected,
}: {
  selected: SearchResult | null;
}) {
  if (!selected) {
    return (
      <div
        className="
          flex
          h-full
          min-h-0
          items-center
          justify-center
          text-sm
          text-muted-foreground
        "
      >
        Search Design Blade
      </div>
    );
  }

  return (
    <div
      className="
        flex
        h-full
        min-h-0
        flex-col
        overflow-hidden
        px-5
        py-4
      "
    >
      {/* Preview image */}
      {selected.image && (
        <div
          className="
            h-[250px]
            w-[80%]
            shrink-0
            overflow-hidden
            rounded-2xl
            bg-muted
            lg:h-[280px]
          "
        >
          <img
            src={selected.image}
            alt={selected.title}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-500
              hover:scale-105
            "
          />
        </div>
      )}

      {/* Content */}
      <div
        className="
          flex
          min-h-0
          flex-1
          flex-col
        "
      >
        <h3
          className="
            mt-4
            font-heading
            text-lg
            font-semibold
          "
        >
          {selected.title}
        </h3>

        <p
          className="
            mt-2
            line-clamp-3
            text-sm
            leading-relaxed
            text-muted-foreground
          "
        >
          {selected.description}
        </p>

        <a
          href={selected.href}
          className="
            mt-4
            inline-flex
            items-center
            gap-2
            self-start
            text-sm
            font-medium
            text-primary
          "
        >
          View more

          <ArrowUpRight
            size={14}
          />
        </a>
      </div>
    </div>
  );
}