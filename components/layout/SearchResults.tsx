'use client';

import { ArrowUpRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

import {
  searchTypeLabels,
  type SearchResult,
} from '@/data/search';

import Link from 'next/link';

interface SearchResultsProps {
  results: SearchResult[];
  selected: SearchResult | null;
  setSelected: (item: SearchResult) => void;
}

export function SearchResults({
  results,
  selected,
  setSelected,
}: SearchResultsProps) {
  return (
    <div
      className="
        max-h-[460px]
        overflow-y-auto
        scrollbar-transparent
        p-3
      "
    >
      {results.length ? (
        results.map((item) => (
          <button
            key={item.id}
            onMouseEnter={() => setSelected(item)}
            onClick={() => {
              window.location.href = item.href;
            }}
            className={cn(
              `
              group
              flex
              w-full
              items-start
              justify-between
              rounded-xl
              px-3
              py-3
              text-left
              transition-colors
              hover:bg-muted
              `,
              selected?.id === item.id &&
                'bg-muted'
            )}
          >
            <div>
              <span
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-widest
                  text-primary
                "
              >
                {searchTypeLabels[item.type]}
              </span>

              <h4
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                {item.title}
              </h4>

              <p
                className="
                  mt-1
                  line-clamp-2
                  text-xs
                  leading-relaxed
                  text-muted-foreground
                "
              >
                {item.description}
              </p>

              {item.badge && (
                <span
                  className="
                    mt-2
                    inline-flex
                    rounded-full
                    bg-primary/10
                    px-2
                    py-0.5
                    text-[10px]
                    font-medium
                    text-primary
                  "
                >
                  {item.badge}
                </span>
              )}
            </div>

            <ArrowUpRight
              size={15}
              className="
                opacity-0
                transition-opacity
                group-hover:opacity-100
              "
            />
          </button>
        ))
      ) : (
        <div
          className="
            py-10
            text-center
            text-sm
            text-muted-foreground
          "
        >
          No results found
        </div>
      )}
    </div>
  );
}