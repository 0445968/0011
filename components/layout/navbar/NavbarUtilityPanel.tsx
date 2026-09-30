'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  X,
} from 'lucide-react';

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
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [selected, setSelected] =
    useState<SearchResult | null>(null);

  const open = mode !== null;

  const results = useMemo(() => {
    const value = query
      .trim()
      .toLowerCase();

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

  /*
   * Autofocus Search on desktop only.
   *
   * Mobile users must tap the input before
   * the keyboard opens.
   */
  useEffect(() => {
    if (mode !== 'search') {
      return;
    }

    const desktopQuery =
      window.matchMedia(
        '(min-width: 1024px)'
      );

    if (!desktopQuery.matches) {
      return;
    }

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

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClickOutside = (
      event: MouseEvent
    ) => {
      /*
       * Full-screen mobile panels should
       * only close using their X button.
       */
      const mobileQuery =
        window.matchMedia(
          '(max-width: 1023px)'
        );

      if (mobileQuery.matches) {
        return;
      }

      const target =
        event.target as HTMLElement | null;

      if (!target) {
        return;
      }

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

  /*
   * Prevent the page behind the full-screen
   * mobile panel from scrolling.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const mobileQuery =
      window.matchMedia(
        '(max-width: 1023px)'
      );

    if (!mobileQuery.matches) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  const openFullSearch = () => {
    onClose();
    router.push('/search');
  };

  if (!open) {
    return null;
  }

  return (
    <div
      ref={panelRef}
      data-navbar-utility-panel
      className="
        fixed
        inset-0
        z-[100]
        h-dvh
        overflow-hidden
        bg-background

        lg:left-0
        lg:right-0
        lg:top-20
        lg:h-[640px]
        lg:border-t
        lg:border-border
        lg:shadow-xl
      "
    >
      {/* Mobile close button */}

      <button
        type="button"
        onClick={onClose}
        aria-label={
          mode === 'search'
            ? 'Close search'
            : 'Close settings'
        }
        className="
          absolute
          right-5
          top-5
          z-[110]

          flex
          h-11
          w-11
          items-center
          justify-center

          rounded-full
          border
          border-border
          bg-background
          text-foreground
          shadow-sm

          transition-colors
          duration-150
          hover:bg-secondary

          lg:hidden
        "
      >
        <X
          size={21}
          strokeWidth={2.25}
        />
      </button>

      {/* Search */}

      {mode === 'search' && (
        <div
          className="
            container-page
            flex
            h-full
            flex-col
            pb-5
            pt-20

            sm:pb-6

            lg:py-8
          "
        >
          <div
            className="
              flex
              shrink-0
              items-center
              gap-3
              border-b
              border-border
              pb-4

              lg:pb-5
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
              aria-label="Search"
              enterKeyHint="search"
              className="
                w-full
                bg-transparent
                text-sm
                outline-none
                placeholder:text-muted-foreground
              "
            />
          </div>

          <div
            className="
              mt-5
              grid
              min-h-0
              flex-1
              grid-cols-1
              overflow-hidden

              lg:mt-6
              lg:grid-cols-2
            "
          >
            <SearchResults
              results={results}
              selected={selected}
              setSelected={
                setSelected
              }
            />

            <div
              className="
                hidden
                min-h-0
                lg:block
              "
            >
              <SearchPreview
                selected={selected}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={openFullSearch}
            className="
              mt-4
              flex
              shrink-0
              items-center
              justify-center
              gap-2
              border-t
              border-border
              pt-4
              text-sm
              font-medium
              text-[#0B65F3]

              hover:text-[#0955cc]

              lg:mt-6
              lg:pt-5
            "
          >
            <Search size={16} />
            <span>
              Open full search
            </span>
          </button>
        </div>
      )}

      {/* Settings */}

      {mode === 'settings' && (
        <div
          className="
            h-full
            overflow-y-auto
            pt-16

            lg:pt-0
          "
        >
          <SettingsPanel
            onClose={onClose}
          />
        </div>
      )}
    </div>
  );
}