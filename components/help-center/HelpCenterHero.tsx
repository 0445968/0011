'use client';

import {
  FormEvent,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  useRouter,
} from 'next/navigation';

import {
  ArrowRight,
  BookOpen,
  FileText,
  Search,
  Wrench,
} from 'lucide-react';

import {
  faqCategories,
} from '@/data/faq';

import {
  resources,
} from '@/data/resources';

import {
  labItems,
} from '@/data/studio-lab/registry';

type SearchResultType =
  | 'FAQ'
  | 'Guide'
  | 'Article'
  | 'Tool'
  | 'Assessment';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: SearchResultType;
  href: string;
}

const MAX_RESULTS = 7;

/*
 * Change this path to whichever image
 * you want to use behind the Help Center hero.
 */
const BACKGROUND_IMAGE =
  '/images/help/help-center-hero.jpg';

function getTypeIcon(
  type: SearchResultType
) {
  switch (type) {
    case 'Guide':
      return BookOpen;

    case 'Article':
      return FileText;

    case 'Tool':
    case 'Assessment':
      return Wrench;

    case 'FAQ':
    default:
      return Search;
  }
}

export function HelpCenterHero() {
  const router = useRouter();

  const [
    query,
    setQuery,
  ] = useState('');

  const [
    isFocused,
    setIsFocused,
  ] = useState(false);

  /* ---------------------------------------------------------------------- */
  /* Search index                                                           */
  /* ---------------------------------------------------------------------- */

  const searchItems =
    useMemo<SearchResult[]>(() => {
      const faqItems =
        faqCategories.flatMap(
          (category) =>
            category.items.map(
              (
                item,
                index
              ): SearchResult => ({
                id: `faq-${category.id}-${index}`,
                title:
                  item.question,
                description:
                  item.answer,
                type: 'FAQ',
                href: `/help/faq#${category.id}`,
              })
            )
        );

      const resourceItems =
        resources.map(
          (
            resource
          ): SearchResult => {
            const type: SearchResultType =
              resource.type ===
              'guide'
                ? 'Guide'
                : resource.type ===
                    'article'
                  ? 'Article'
                  : 'Tool';

            return {
              id: `resource-${resource.id}`,
              title:
                resource.title,
              description:
                resource.description,
              type,
              href:
                resource.href,
            };
          }
        );

      const studioLabItems =
        labItems
          .filter(
            (item) =>
              item.status ===
              'active'
          )
          .map(
            (
              item
            ): SearchResult => ({
              id: `lab-${item.id}`,
              title:
                item.title,
              description:
                item.description,
              type:
                item.type ===
                'assessment'
                  ? 'Assessment'
                  : 'Tool',
              href: item.href,
            })
          );

      return [
        ...faqItems,
        ...resourceItems,
        ...studioLabItems,
      ];
    }, []);

  /* ---------------------------------------------------------------------- */
  /* Search results                                                         */
  /* ---------------------------------------------------------------------- */

  const results =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      if (
        normalizedQuery.length <
        2
      ) {
        return [];
      }

      return searchItems
        .map((item) => {
          const title =
            item.title.toLowerCase();

          const description =
            item.description.toLowerCase();

          let score = 0;

          if (
            title ===
            normalizedQuery
          ) {
            score += 100;
          }

          if (
            title.startsWith(
              normalizedQuery
            )
          ) {
            score += 50;
          }

          if (
            title.includes(
              normalizedQuery
            )
          ) {
            score += 25;
          }

          if (
            description.includes(
              normalizedQuery
            )
          ) {
            score += 10;
          }

          return {
            ...item,
            score,
          };
        })
        .filter(
          (item) =>
            item.score > 0
        )
        .sort(
          (a, b) =>
            b.score -
            a.score
        )
        .slice(
          0,
          MAX_RESULTS
        );
    }, [
      query,
      searchItems,
    ]);

  const showResults =
    isFocused &&
    query.trim().length >= 2;

  /* ---------------------------------------------------------------------- */
  /* Submit                                                                 */
  /* ---------------------------------------------------------------------- */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedQuery =
      query.trim();

    if (!trimmedQuery) {
      return;
    }

    router.push(
      `/help/search?q=${encodeURIComponent(
        trimmedQuery
      )}`
    );
  };

  /* ---------------------------------------------------------------------- */
  /* Render                                                                 */
  /* ---------------------------------------------------------------------- */

  return (
    <section
      className="
        relative
        overflow-visible
        bg-[#1600A2]
        pt-32
        text-white
        md:pt-36
        lg:pt-40
      "
    >
      {/* ---------------------------------------------------------------- */}
      {/* Background image                                                 */}
      {/* ---------------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          overflow-hidden
        "
      >
        <div
          className="
            absolute
            inset-0
            bg-cover
            bg-center
            bg-no-repeat
          "
          style={{
            backgroundImage:
              `url(${BACKGROUND_IMAGE})`,
          }}
        />

        {/* Main dark overlay */}

        <div
          className="
            absolute
            inset-0
            bg-[#1600A2]/30
          "
        />

        {/* Blue tonal overlay */}

        <div
          className="
            absolute
            inset-0
            bg-gradient-to-r
            from-[#1600A2]/80
            via-[#0B65F3]/30
            to-[#1600A2]/75
          "
        />

        {/* Bottom divider */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            h-px
            bg-white/15
          "
        />
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Content                                                          */}
      {/* ---------------------------------------------------------------- */}

      <div
        className="
          container-page
          relative
          z-10
        "
      >
        <div
          className="
            mx-auto
            max-w-4xl
            pb-12
            text-center
            sm:pb-14
            lg:pb-16
          "
        >
          {/* Eyebrow */}

          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.22em]
              text-[#BBFF1B]
              sm:text-[11px]
            "
          >
            Bivi Help Center
          </p>

          {/* Heading */}

          <h1
            className="
              mt-3
              text-balance
              font-serif
              text-4xl
              font-medium
              leading-[0.98]
              tracking-[-0.045em]
              sm:text-5xl
              md:text-[3.5rem]
            "
          >
            How can we help?
          </h1>

          {/* Description */}

          <p
            className="
              mx-auto
              mt-4
              max-w-xl
              text-sm
              leading-6
              text-white/70
              sm:text-[15px]
              sm:leading-7
            "
          >
            Find answers, explore brand
            and design guides, use free
            tools, or get in touch with
            Bivi.
          </p>

          {/* ------------------------------------------------------------ */}
{/* Search                                                       */}
{/* ------------------------------------------------------------ */}

<div
  className="
    relative
    mx-auto
    mt-7
    w-full
    max-w-[680px]
    text-left
  "
>
  <form
    onSubmit={handleSubmit}
    className="
      relative
      w-full
    "
  >
    <Search
      aria-hidden="true"
      size={18}
      strokeWidth={2}
      className="
        pointer-events-none
        absolute
        left-5
        top-1/2
        z-10
        -translate-y-1/2
        text-black/50
      "
    />

    <input
      value={query}
      onChange={(event) =>
        setQuery(
          event.target.value
        )
      }
      onFocus={() =>
        setIsFocused(true)
      }
      onBlur={() => {
        window.setTimeout(
          () =>
            setIsFocused(
              false
            ),
          140
        );
      }}
      type="search"
      placeholder="Search articles, guides, FAQs and tools..."
      aria-label="Search the Bivi Help Center"
      className="
        !m-0
        !h-[56px]
        !min-h-0
        w-full
        appearance-none
        rounded-full
        border
        border-white/20
        bg-white
        !px-5
        !py-0
        !pl-[52px]
        text-[15px]
        font-medium
        leading-none
        text-black
        shadow-[0_12px_40px_rgba(0,0,0,0.15)]
        outline-none
        transition
        duration-300
        placeholder:text-black/40
        focus:border-[#BBFF1B]
        focus:ring-4
        focus:ring-[#BBFF1B]/20
      "
    />
  </form>

  {/* ---------------------------------------------------------- */}
  {/* Results                                                    */}
  {/* ---------------------------------------------------------- */}

  {showResults && (
    <div
      className="
        absolute
        inset-x-0
        top-[calc(100%+8px)]
        z-[80]
        overflow-hidden
        rounded-2xl
        border
        border-border
        bg-background
        text-foreground
        shadow-2xl
      "
    >
      {results.length > 0 ? (
        <>
          <div
            className="
              border-b
              border-border
              px-5
              py-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-muted-foreground
            "
          >
            Suggested results
          </div>

          <div className="p-2">
            {results.map(
              (result) => {
                const Icon =
                  getTypeIcon(
                    result.type
                  );

                return (
                  <Link
                    key={result.id}
                    href={result.href}
                    className="
                      group
                      flex
                      gap-3
                      rounded-lg
                      px-3
                      py-3
                      transition-colors
                      duration-200
                      hover:bg-secondary/60
                    "
                  >
                    <div
                      className="
                        mt-0.5
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-primary/10
                        text-primary
                      "
                    >
                      <Icon
                        size={15}
                        strokeWidth={2}
                      />
                    </div>

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2
                        "
                      >
                        <span
                          className="
                            truncate
                            text-sm
                            font-semibold
                          "
                        >
                          {result.title}
                        </span>

                        <span
                          className="
                            shrink-0
                            rounded-full
                            bg-[#BBFF1B]
                            px-2
                            py-0.5
                            text-[8px]
                            font-bold
                            uppercase
                            tracking-[0.1em]
                            text-black
                          "
                        >
                          {result.type}
                        </span>
                      </div>

                      <p
                        className="
                          mt-1
                          line-clamp-1
                          text-xs
                          leading-5
                          text-muted-foreground
                        "
                      >
                        {
                          result.description
                        }
                      </p>
                    </div>

                    <ArrowRight
                      size={15}
                      className="
                        mt-2
                        shrink-0
                        text-muted-foreground
                        transition-transform
                        duration-200
                        group-hover:translate-x-1
                        group-hover:text-primary
                      "
                    />
                  </Link>
                );
              }
            )}
          </div>
        </>
      ) : (
        <div
          className="
            px-6
            py-7
            text-center
          "
        >
          <p
            className="
              text-sm
              font-semibold
            "
          >
            No help articles found.
          </p>

          <p
            className="
              mt-1
              text-xs
              text-muted-foreground
            "
          >
            Try another search or
            contact Bivi
            directly.
          </p>

          <Link
            href="/help/contact"
            className="
              mt-4
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-primary
            "
          >
            Contact Bivi

            <ArrowRight
              size={14}
            />
          </Link>
        </div>
      )}
    </div>
  )}
</div>

          {/* ------------------------------------------------------------ */}
          {/* Suggested searches                                           */}
          {/* ------------------------------------------------------------ */}

          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              justify-center
              gap-x-2
              gap-y-2
              text-[11px]
              text-white/60
            "
          >
            <span>
              Popular:
            </span>

            {[
              'Pricing',
              'Brand strategy',
              'Rebranding',
              'Project timeline',
            ].map(
              (suggestion) => (
                <button
                  key={
                    suggestion
                  }
                  type="button"
                  onClick={() => {
                    setQuery(
                      suggestion
                    );

                    setIsFocused(
                      true
                    );
                  }}
                  className="
                    rounded-full
                    border
                    border-white/20
                    px-2.5
                    py-1
                    text-white/80
                    transition
                    duration-200
                    hover:border-[#BBFF1B]
                    hover:bg-[#BBFF1B]
                    hover:text-black
                  "
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}