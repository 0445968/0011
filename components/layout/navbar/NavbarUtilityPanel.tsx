'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useRouter } from 'next/navigation';

import { Search } from 'lucide-react';

import {
  searchIndex,
  type SearchResult,
} from '@/data/search';

import { SearchResults } from '../SearchResults';
import { SearchPreview } from '../SearchPreview';
import { SettingsPanel } from '../settings/SettingsPanel';

type UtilityMode =
  | 'search'
  | 'settings'
  | null;

interface NavbarUtilityPanelProps {
  mode: UtilityMode;
  onClose: () => void;
}

export function NavbarUtilityPanel({
  mode,
  onClose,
}: NavbarUtilityPanelProps) {
  const router = useRouter();

  const panelRef =
    useRef<HTMLDivElement>(null);

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [query, setQuery] =
    useState('');

  const [selected, setSelected] =
    useState<SearchResult | null>(null);

  const open = mode !== null;

  /* ---------------------------------------------------------------------- */
  /* Search results                                                         */
  /* ---------------------------------------------------------------------- */

  const results = useMemo(() => {
    const value =
      query.trim().toLowerCase();

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

        return searchable.includes(
          value
        );
      })
      .slice(0, 10);
  }, [query]);

  /* ---------------------------------------------------------------------- */
  /* Search selection                                                       */
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
        (item) =>
          item.id === selected.id
      );

    if (!selectedStillExists) {
      setSelected(results[0]);
    }
  }, [
    results,
    selected,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Focus search when switching to Search                                  */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (mode !== 'search') {
      return;
    }

    /*
     * requestAnimationFrame waits until
     * Search content has rendered.
     */
    const frame =
      window.requestAnimationFrame(
        () => {
          inputRef.current?.focus();
        }
      );

    return () => {
      window.cancelAnimationFrame(
        frame
      );
    };
  }, [mode]);

  /* ---------------------------------------------------------------------- */
  /* Outside click                                                          */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as HTMLElement | null;

      if (!target) {
        return;
      }

      /*
       * Clicking either navbar utility
       * icon must NOT close the shell
       * before the other content opens.
       */
      if (
        target.closest(
          '[data-navbar-utility-trigger]'
        )
      ) {
        return;
      }

      if (
        panelRef.current?.contains(
          target
        )
      ) {
        return;
      }

      onClose();
    };

    document.addEventListener(
      'mousedown',
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleClickOutside
      );
    };
  }, [
    open,
    onClose,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Escape                                                                 */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (
      event: KeyboardEvent
    ) => {
      if (event.key === 'Escape') {
        onClose();
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
  }, [
    open,
    onClose,
  ]);

  /* ---------------------------------------------------------------------- */
  /* Full search                                                            */
  /* ---------------------------------------------------------------------- */

  const openFullSearch = () => {
    onClose();

    router.push('/search');
  };

  /* ---------------------------------------------------------------------- */
  /* Closed                                                                 */
  /* ---------------------------------------------------------------------- */

  if (!open) {
    return null;
  }

  /* ---------------------------------------------------------------------- */
  /* Panel                                                                  */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      ref={panelRef}
      data-navbar-utility-panel
      className="
        fixed
        left-0
        right-0
        top-16
        z-50
        h-[640px]
        overflow-hidden
        border-t
        border-border
        bg-background
        shadow-xl
        lg:top-20
      "
    >
      {/* --------------------------------------------------------------- */}
      {/* Search content                                                  */}
      {/* --------------------------------------------------------------- */}

      {mode === 'search' && (
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

          {/* Open full search */}
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
              text-[#0B65F3]
              hover:text-[#0955cc]
            "
          >
            <Search size={16} />

            <span>
              Open full search
            </span>
          </button>
        </div>
      )}

      {/* --------------------------------------------------------------- */}
      {/* Settings content                                                */}
      {/* --------------------------------------------------------------- */}

      {mode === 'settings' && (
        <SettingsPanel
          onClose={onClose}
        />
      )}
    </div>
  );
}