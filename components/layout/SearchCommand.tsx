'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const [query, setQuery] = useState('');

  const [selected, setSelected] =
    useState<SearchResult | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  /* ---------------------------------------------------------------------- */
  /* Search results                                                         */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Focus search input                                                     */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) return;

    const timeout = window.setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open]);

  /* ---------------------------------------------------------------------- */
  /* Close when clicking outside                                            */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(
          event.target as Node
        )
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

  /* ---------------------------------------------------------------------- */
  /* Escape key                                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, [setOpen]);

  /* ---------------------------------------------------------------------- */
  /* Selected result                                                        */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!results.length) {
      setSelected(null);
      return;
    }

    if (!selected) {
      setSelected(results[0]);
      return;
    }

    const selectedStillExists =
      results.some(
        (item) => item.id === selected.id
      );

    if (!selectedStillExists) {
      setSelected(results[0]);
    }
  }, [results, selected]);

  /* ---------------------------------------------------------------------- */
  /* Full search                                                            */
  /* ---------------------------------------------------------------------- */

  const openFullSearch = () => {
    setOpen(false);

    router.push('/search');
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      ref={searchRef}
      className="relative"
    >
      {/* Search button */}
      <button
        type="button"
        onClick={() => {
          const next = !open;

          setOpen(next);

          if (next) {
            onOpen?.();
          }
        }}
        aria-label="Search"
        aria-expanded={open}
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
              height: 640,
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
                flex
                h-full
                flex-col
                py-8
              "
            >
              {/* Search input */}
              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-3
                  border-b
                  border-border
                  pb-5
                "
              >
                <Search
                  size={18}
                  className="
                    shrink-0
                    text-muted-foreground
                  "
                />

                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) =>
                    setQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search projects, services, resources..."
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
                  min-h-0
                  flex-1
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

              {/* Full search */}
              <button
                type="button"
                onClick={openFullSearch}
                className="
                  mt-6
                  flex
                  shrink-0
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

                <span>
                  Open full search
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}