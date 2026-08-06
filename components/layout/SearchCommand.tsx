'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Link from 'next/link';

import { AnimatePresence, motion } from 'framer-motion';
import { Search } from 'lucide-react';

import {
  searchIndex,
  type SearchResult,
} from '@/data/search';

import { SearchResults } from './SearchResults';
import { SearchPreview } from './SearchPreview';

export function SearchCommand({
  open,
  setOpen,
  onOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  onOpen?: () => void;
}) {
  const [query, setQuery] = useState('');

  const [selected, setSelected] =
    useState<SearchResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);


  const results = useMemo(() => {
    const value = query.trim().toLowerCase();

    if (!value) {
      return searchIndex.slice(0, 8);
    }

    return searchIndex
      .filter((item) => {
        const searchable = [
          item.title,
          item.description,
          item.category,
          ...item.tags,
        ]
          .join(' ')
          .toLowerCase();

        return searchable.includes(value);
      })
      .slice(0, 10);

  }, [query]);


  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);


  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  if (open) {
    document.addEventListener(
      'mousedown',
      handleClickOutside
    );
  }

  return () => {
    document.removeEventListener(
      'mousedown',
      handleClickOutside
    );
  };
}, [open, setOpen]);

  
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener(
      'keydown',
      handleEscape
    );

    return () =>
      window.removeEventListener(
        'keydown',
        handleEscape
      );
  }, [setOpen]);


  useEffect(() => {
    if (!selected && results.length) {
      setSelected(results[0]);
    }

    if (
      selected &&
      !results.some(
        (item) => item.id === selected.id
      )
    ) {
      setSelected(results[0] ?? null);
    }

  }, [results, selected]);


  return (
    <div
  ref={searchRef}
  className="relative"
>

      {/* Search button */}
      <button
        onClick={() => {
          const next = !open;

          setOpen(next);

          if (next) {
            onOpen?.();
          }
        }}
        aria-label="Search"
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-full
          text-muted-foreground
          transition-colors
          hover:text-foreground
        "
      >
        <Search size={18} />
      </button>


      <AnimatePresence>
        {open && (

          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}

            animate={{
              opacity: 1,
              height: 'auto',
            }}

            exit={{
              opacity: 0,
              height: 0,
            }}

            transition={{
              duration: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}

            className="
  fixed
  left-0
  right-0
  top-16
  z-50
  h-[560px]
  overflow-hidden
  border-t
  border-border
  bg-background
  shadow-xl
  lg:top-20
"
          >

            <div
              className="
                container-page
                h-full
                py-8
              "
            >

              {/* Search input */}
              <div
                className="
                  flex
                  items-center
                  gap-3
                  border-b
                  border-border
                  pb-5
                "
              >

                <Search
                  size={18}
                  className="text-muted-foreground"
                />

                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="
                    Search projects, services, resources...
                  "
                  className="
                    w-full
                    bg-transparent
                    text-sm
                    outline-none
                    placeholder:text-muted-foreground
                  "
                />

              </div>


              {/* Results + Preview */}
<div
  className="
    mt-6
    grid
    h-[540px]
    grid-cols-2
    overflow-hidden
  "
>

  <SearchResults
    results={results}
    selected={selected}
    setSelected={setSelected}
  />

  <SearchPreview
    selected={selected}
  />

</div>


{/* Full search button */}
<Link
  href="/search"
  onClick={() => setOpen(false)}
  className="
    mt-6
    flex
    items-center
    justify-center
    gap-2
    border-t
    border-border
    pt-5
    text-sm
    font-medium
    text-[#0b65f3]
    transition-colors
    hover:text-[#0955cc]
  "
>
  <Search size={16} />
  Open full search
</Link>

            </div>

          </motion.div>

        )}
      </AnimatePresence>

    </div>
  );
}