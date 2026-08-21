'use client';

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  FileText,
  FlaskConical,
  HelpCircle,
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
  href: string;
  type: SearchResultType;
  category?: string;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim();
}

function getSearchScore(
  result: SearchResult,
  query: string
) {
  const normalizedQuery =
    normalize(query);

  const title = normalize(
    result.title
  );

  const description =
    normalize(
      result.description
    );

  const category =
    normalize(
      result.category ?? ''
    );

  let score = 0;

  if (
    title === normalizedQuery
  ) {
    score += 100;
  }

  if (
    title.startsWith(
      normalizedQuery
    )
  ) {
    score += 60;
  }

  if (
    title.includes(
      normalizedQuery
    )
  ) {
    score += 40;
  }

  if (
    description.includes(
      normalizedQuery
    )
  ) {
    score += 15;
  }

  if (
    category.includes(
      normalizedQuery
    )
  ) {
    score += 10;
  }

  const queryWords =
    normalizedQuery
      .split(/\s+/)
      .filter(Boolean);

  queryWords.forEach(
    (word) => {
      if (
        title.includes(word)
      ) {
        score += 10;
      }

      if (
        description.includes(
          word
        )
      ) {
        score += 4;
      }

      if (
        category.includes(
          word
        )
      ) {
        score += 3;
      }
    }
  );

  return score;
}

function getTypeIcon(
  type: SearchResultType
) {
  switch (type) {
    case 'FAQ':
      return HelpCircle;

    case 'Guide':
      return BookOpen;

    case 'Article':
      return FileText;

    case 'Assessment':
      return FlaskConical;

    case 'Tool':
    default:
      return Wrench;
  }
}

export default function HelpSearchPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const urlQuery =
    searchParams.get('q') ??
    '';

  const [
    query,
    setQuery,
  ] = useState(urlQuery);

  const [
    activeQuery,
    setActiveQuery,
  ] = useState(urlQuery);

  /* ---------------------------------------------------------------------- */
  /* Keep page in sync with ?q=                                             */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    const nextQuery =
      searchParams.get('q') ??
      '';

    setQuery(nextQuery);
    setActiveQuery(
      nextQuery
    );
  }, [searchParams]);

  /* ---------------------------------------------------------------------- */
  /* Search index                                                           */
  /* ---------------------------------------------------------------------- */

  const searchIndex =
    useMemo<SearchResult[]>(
      () => {
        const faqResults =
          faqCategories.flatMap(
            (category) =>
              category.items.map(
                (
                  item,
                  index
                ) => ({
                  id: `faq-${category.id}-${index}`,
                  title:
                    item.question,
                  description:
                    item.answer,
                  href: `/help/faq#${category.id}`,
                  type: 'FAQ' as const,
                  category:
                    category.label,
                })
              )
          );

        const resourceResults =
          resources
            .filter(
              (resource) =>
                resource.type ===
                  'guide' ||
                resource.type ===
                  'article'
            )
            .map((resource) => ({
              id: `resource-${resource.id}`,
              title:
                resource.title,
              description:
                resource.description,
              href:
                resource.href,
              type:
                resource.type ===
                'guide'
                  ? ('Guide' as const)
                  : ('Article' as const),
              category:
                resource.category,
            }));

        const labResults =
          labItems
            .filter(
              (item) =>
                item.status ===
                'active'
            )
            .map((item) => ({
              id: `lab-${item.id}`,
              title:
                item.title,
              description:
                item.description,
              href:
                item.href,
              type:
                item.type ===
                'assessment'
                  ? ('Assessment' as const)
                  : ('Tool' as const),
              category:
                item.type ===
                'assessment'
                  ? 'Assessment'
                  : 'Free Tool',
            }));

        return [
          ...faqResults,
          ...resourceResults,
          ...labResults,
        ];
      },
      []
    );

  /* ---------------------------------------------------------------------- */
  /* Search results                                                         */
  /* ---------------------------------------------------------------------- */

  const results =
    useMemo(() => {
      if (
        !activeQuery.trim()
      ) {
        return [];
      }

      return searchIndex
        .map((result) => ({
          result,
          score:
            getSearchScore(
              result,
              activeQuery
            ),
        }))
        .filter(
          ({ score }) =>
            score > 0
        )
        .sort(
          (a, b) =>
            b.score -
            a.score
        )
        .map(
          ({ result }) =>
            result
        );
    }, [
      activeQuery,
      searchIndex,
    ]);

  const groupedCounts =
    useMemo(() => {
      return results.reduce(
        (
          counts,
          result
        ) => {
          counts[
            result.type
          ] =
            (counts[
              result.type
            ] ?? 0) + 1;

          return counts;
        },
        {} as Partial<
          Record<
            SearchResultType,
            number
          >
        >
      );
    }, [results]);

  /* ---------------------------------------------------------------------- */
  /* Search actions                                                         */
  /* ---------------------------------------------------------------------- */

  const navigateToSearch = (
    value: string
  ) => {
    const trimmed =
      value.trim();

    if (!trimmed) {
      router.push(
        '/help/search'
      );

      return;
    }

    router.push(
      `/help/search?q=${encodeURIComponent(
        trimmed
      )}`
    );
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    navigateToSearch(
      query
    );
  };

  const runSearch = (
    value: string
  ) => {
    setQuery(value);
    setActiveQuery(
      value
    );

    navigateToSearch(
      value
    );
  };

  return (
    <main
      className="
        min-h-screen
        bg-background
      "
    >
      {/* ------------------------------------------------------------ */}
      {/* Hero                                                         */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-b
          border-border
          bg-[#1600A2]
          pb-14
          pt-28
          text-white
          sm:pb-16
          sm:pt-32
          lg:pb-20
          lg:pt-36
        "
      >
        <div className="container-page">
          <Link
            href="/help"
            className="
              group
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-white/70
              transition-colors
              hover:text-white
            "
          >
            <ArrowLeft
              size={15}
              strokeWidth={2}
              className="
                transition-transform
                duration-200
                group-hover:-translate-x-1
              "
            />

            Help Center
          </Link>

          <div
            className="
              mt-8
              max-w-3xl
            "
          >
            <p
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-[#BBFF1B]
                sm:text-xs
              "
            >
              Search
            </p>

            <h1
              className="
                mt-4
                text-balance
                font-serif
                text-4xl
                font-semibold
                leading-[0.98]
                tracking-[-0.045em]
                sm:text-5xl
                md:text-6xl
              "
            >
              Find the answer you
              need.
            </h1>

            <p
              className="
                mt-6
                max-w-2xl
                text-base
                leading-7
                text-white/70
                sm:text-lg
                sm:leading-8
              "
            >
              Search FAQs, guides,
              articles, free tools,
              and assessments from
              across the Design Blade
              Help Center.
            </p>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Search bar                                                 */}
          {/* ---------------------------------------------------------- */}

          <form
            onSubmit={handleSubmit}
            className="
              relative
              mt-9
              w-full
              max-w-[680px]
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
              type="search"
              value={query}
              onChange={(
                event
              ) =>
                setQuery(
                  event.target
                    .value
                )
              }
              placeholder="Search articles, guides, FAQs and tools..."
              aria-label="Search the Help Center"
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
                !py-0
                !pl-[52px]
                !pr-[110px]
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

            <button
              type="submit"
              className="
                absolute
                right-[5px]
                top-1/2
                inline-flex
                h-[46px]
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-primary
                px-5
                text-sm
                font-semibold
                text-white
                transition-opacity
                hover:opacity-90
              "
            >
              Search
            </button>
          </form>

          {/* Suggestions */}

          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <span
              className="
                mr-1
                text-xs
                text-white/50
              "
            >
              Try:
            </span>

            {[
              'Pricing',
              'Brand strategy',
              'Rebranding',
              'Logo',
              'Timeline',
            ].map(
              (suggestion) => (
                <button
                  key={
                    suggestion
                  }
                  type="button"
                  onClick={() =>
                    runSearch(
                      suggestion
                    )
                  }
                  className="
                    rounded-full
                    border
                    border-white/15
                    bg-white/[0.06]
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-white/80
                    transition-colors
                    hover:border-[#BBFF1B]/70
                    hover:text-[#BBFF1B]
                  "
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Search results                                               */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          py-14
          sm:py-16
          lg:py-20
        "
      >
        <div className="container-page">
          {!activeQuery ? (
            <SearchStartState />
          ) : results.length >
            0 ? (
            <>
              {/* Results header */}

              <div
                className="
                  flex
                  flex-col
                  gap-5
                  border-b
                  border-border
                  pb-7
                  md:flex-row
                  md:items-end
                  md:justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-primary
                    "
                  >
                    Search results
                  </p>

                  <h2
                    className="
                      mt-2
                      font-serif
                      text-3xl
                      font-semibold
                      tracking-[-0.035em]
                      text-foreground
                    "
                  >
                    Results for{' '}
                    &ldquo;
                    {activeQuery}
                    &rdquo;
                  </h2>

                  <p
                    className="
                      mt-2
                      text-sm
                      text-muted-foreground
                    "
                  >
                    {results.length}{' '}
                    {results.length ===
                    1
                      ? 'result'
                      : 'results'}
                  </p>
                </div>

                {/* Counts */}

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {(
                    [
                      'FAQ',
                      'Guide',
                      'Article',
                      'Tool',
                      'Assessment',
                    ] as SearchResultType[]
                  ).map(
                    (type) => {
                      const count =
                        groupedCounts[
                          type
                        ];

                      if (!count) {
                        return null;
                      }

                      return (
                        <span
                          key={type}
                          className="
                            rounded-full
                            border
                            border-border
                            bg-card
                            px-3
                            py-1.5
                            text-[11px]
                            font-medium
                            text-muted-foreground
                          "
                        >
                          {type}{' '}

                          <strong
                            className="
                              ml-1
                              font-semibold
                              text-foreground
                            "
                          >
                            {count}
                          </strong>
                        </span>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Results list */}

              <div
                className="
                  mt-8
                  overflow-hidden
                  rounded-3xl
                  border
                  border-border
                  bg-card
                "
              >
                {results.map(
                  (
                    result,
                    index
                  ) => {
                    const Icon =
                      getTypeIcon(
                        result.type
                      );

                    return (
                      <Link
                        key={
                          result.id
                        }
                        href={
                          result.href
                        }
                        className={`
                          group
                          grid
                          gap-5
                          p-6
                          transition-colors
                          hover:bg-secondary/25
                          sm:p-7
                          md:grid-cols-[48px_minmax(0,1fr)_40px]
                          md:items-start
                          ${
                            index !==
                            0
                              ? 'border-t border-border'
                              : ''
                          }
                        `}
                      >
                        <div
                          className="
                            flex
                            h-11
                            w-11
                            items-center
                            justify-center
                            rounded-2xl
                            bg-primary/10
                            text-primary
                          "
                        >
                          <Icon
                            size={19}
                            strokeWidth={2}
                          />
                        </div>

                        <div
                          className="
                            min-w-0
                          "
                        >
                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >
                            <span
                              className="
                                text-[9px]
                                font-semibold
                                uppercase
                                tracking-[0.14em]
                                text-primary
                              "
                            >
                              {result.type}
                            </span>

                            {result.category && (
                              <>
                                <span
                                  aria-hidden="true"
                                  className="
                                    h-1
                                    w-1
                                    rounded-full
                                    bg-muted-foreground/35
                                  "
                                />

                                <span
                                  className="
                                    text-[11px]
                                    text-muted-foreground
                                  "
                                >
                                  {
                                    result.category
                                  }
                                </span>
                              </>
                            )}
                          </div>

                          <h3
                            className="
                              mt-2
                              text-lg
                              font-semibold
                              tracking-[-0.025em]
                              text-foreground
                            "
                          >
                            {result.title}
                          </h3>

                          <p
                            className="
                              mt-2
                              line-clamp-3
                              max-w-3xl
                              text-sm
                              leading-6
                              text-muted-foreground
                            "
                          >
                            {
                              result.description
                            }
                          </p>
                        </div>

                        <div
                          className="
                            hidden
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-border
                            text-muted-foreground
                            transition-all
                            duration-200
                            group-hover:border-[#BBFF1B]
                            group-hover:bg-[#BBFF1B]
                            group-hover:text-black
                            md:flex
                          "
                        >
                          <ArrowRight
                            size={15}
                            strokeWidth={2}
                            className="
                              transition-transform
                              duration-200
                              group-hover:translate-x-1
                            "
                          />
                        </div>
                      </Link>
                    );
                  }
                )}
              </div>
            </>
          ) : (
            <NoResults
              query={activeQuery}
              onSuggestion={
                runSearch
              }
            />
          )}
        </div>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Initial state                                                              */
/* -------------------------------------------------------------------------- */

function SearchStartState() {
  return (
    <div
      className="
        grid
        gap-8
        lg:grid-cols-[0.72fr_1.28fr]
        lg:gap-16
      "
    >
      <div
        className="
          max-w-md
        "
      >
        <p
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-primary
          "
        >
          Search everything
        </p>

        <h2
          className="
            mt-2
            font-serif
            text-3xl
            font-semibold
            tracking-[-0.035em]
            text-foreground
          "
        >
          One search across the
          Help Center.
        </h2>

        <p
          className="
            mt-4
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          Search questions, guides,
          articles, Studio Lab tools,
          and assessments without
          needing to know where the
          information lives first.
        </p>
      </div>

      <div
        className="
          grid
          gap-4
          sm:grid-cols-2
        "
      >
        <SearchTypeCard
          icon={HelpCircle}
          title="FAQs"
          description="Quick answers to common questions."
          href="/help/faq"
        />

        <SearchTypeCard
          icon={BookOpen}
          title="Guides"
          description="Longer practical resources and walkthroughs."
          href="/help/guides"
        />

        <SearchTypeCard
          icon={FileText}
          title="Articles"
          description="Ideas and deeper thinking from the Journal."
          href="/help/articles"
        />

        <SearchTypeCard
          icon={Wrench}
          title="Free tools"
          description="Interactive tools and assessments from Studio Lab."
          href="/help/tools"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Search type card                                                           */
/* -------------------------------------------------------------------------- */

interface SearchTypeCardProps {
  icon: typeof Search;
  title: string;
  description: string;
  href: string;
}

function SearchTypeCard({
  icon: Icon,
  title,
  description,
  href,
}: SearchTypeCardProps) {
  return (
    <Link
      href={href}
      className="
        group
        rounded-3xl
        border
        border-border
        bg-card
        p-6
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-primary/35
      "
    >
      <div
        className="
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          bg-primary/10
          text-primary
        "
      >
        <Icon
          size={17}
          strokeWidth={2}
        />
      </div>

      <h3
        className="
          mt-5
          text-lg
          font-semibold
          tracking-[-0.025em]
          text-foreground
        "
      >
        {title}
      </h3>

      <p
        className="
          mt-2
          text-sm
          leading-6
          text-muted-foreground
        "
      >
        {description}
      </p>

      <span
        className="
          mt-5
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-primary
        "
      >
        Browse

        <ArrowRight
          size={14}
          strokeWidth={2}
          className="
            transition-transform
            duration-200
            group-hover:translate-x-1
          "
        />
      </span>
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* No results                                                                 */
/* -------------------------------------------------------------------------- */

interface NoResultsProps {
  query: string;
  onSuggestion:
    (value: string) => void;
}

function NoResults({
  query,
  onSuggestion,
}: NoResultsProps) {
  return (
    <div
      className="
        rounded-3xl
        border
        border-border
        bg-card
        px-6
        py-14
        text-center
        sm:px-8
        sm:py-16
      "
    >
      <div
        className="
          mx-auto
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-primary/10
          text-primary
        "
      >
        <Search
          size={20}
          strokeWidth={2}
        />
      </div>

      <h2
        className="
          mt-6
          font-serif
          text-3xl
          font-semibold
          tracking-[-0.035em]
          text-foreground
        "
      >
        No results for{' '}
        &ldquo;
        {query}
        &rdquo;
      </h2>

      <p
        className="
          mx-auto
          mt-3
          max-w-lg
          text-sm
          leading-6
          text-muted-foreground
        "
      >
        Try a broader term,
        check the wording, or
        browse one of the main
        Help Center sections.
      </p>

      <div
        className="
          mt-7
          flex
          flex-wrap
          justify-center
          gap-2
        "
      >
        {[
          'Brand',
          'Pricing',
          'Logo',
          'Rebrand',
          'Timeline',
        ].map(
          (suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() =>
                onSuggestion(
                  suggestion
                )
              }
              className="
                rounded-full
                border
                border-border
                bg-background
                px-3
                py-2
                text-xs
                font-medium
                text-muted-foreground
                transition-colors
                hover:border-primary/40
                hover:text-primary
              "
            >
              {suggestion}
            </button>
          )
        )}
      </div>

      <Link
        href="/help/contact"
        className="
          group
          mt-8
          inline-flex
          items-center
          gap-2
          text-sm
          font-semibold
          text-primary
        "
      >
        Still need help? Contact us

        <ArrowRight
          size={14}
          strokeWidth={2}
          className="
            transition-transform
            duration-200
            group-hover:translate-x-1
          "
        />
      </Link>
    </div>
  );
}