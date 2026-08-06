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
    <div className="p-5">

      {selected.image && (
        <div
          className="
            aspect-video
            overflow-hidden
            rounded-2xl
            bg-muted
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

      <h3
        className="
          mt-5
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
          mt-5
          inline-flex
          items-center
          gap-2
          text-sm
          font-medium
          text-primary
        "
      >
        View more
        <ArrowUpRight size={14}/>
      </a>

    </div>
  );
}