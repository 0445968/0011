'use client';

import {
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import {
  ArrowLeft,
  ArrowUpRight,
  Search,
} from 'lucide-react';

import {
  featuredTools,
  getResourcesByType,
  resourceTopics,
  resources,
  resourceTypes,
  type Resource,
} from '@/data/resources';

import { ResourceCard } from '@/components/resources/ResourceCard';

/* ========================================================= */
/* HELPERS */
/* ========================================================= */

function matchesSearch(
  resource: Resource,
  query: string
) {
  if (!query.trim()) {
    return true;
  }

  const q =
    query
      .trim()
      .toLowerCase();

  return (
    resource.title
      .toLowerCase()
      .includes(q) ||
    resource.description
      .toLowerCase()
      .includes(q) ||
    resource.category
      .toLowerCase()
      .includes(q) ||
    resource.tags.some((tag) =>
      tag
        .toLowerCase()
        .includes(q)
    )
  );
}

function sortResources(
  list: Resource[]
) {
  return [...list].sort(
    (a, b) =>
      a.title.localeCompare(
        b.title
      )
  );
}

/* ========================================================= */
/* FEATURED TOOL CARD */
/* ========================================================= */

function FeaturedToolCard({
  resource,
  index,
}: {
  resource: Resource;
  index: number;
}) {
  const content = (
    <>
      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >
        <span
          className="
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-muted-foreground
          "
        >
          {resource.category}
        </span>

        <ArrowUpRight
          size={17}
          strokeWidth={1.75}
          className="
            shrink-0
            text-muted-foreground
            transition-transform
            duration-300
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
            group-hover:text-foreground
          "
        />
      </div>

      <h3
        className="
          mt-auto
          pt-8
          font-heading
          text-lg
          font-semibold
          leading-tight
          tracking-[-0.025em]
          text-foreground
        "
      >
        {resource.title}
      </h3>
    </>
  );

  const className = `
    group
    flex
    min-h-[170px]
    flex-col
    rounded-2xl
    border
    border-border
    bg-card
    p-5
    transition-all
    duration-300
    hover:-translate-y-1
    hover:border-foreground/20
    hover:shadow-sm
  `;

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay:
          index * 0.04,
        ease: [
          0.16,
          1,
          0.3,
          1,
        ],
      }}
    >
      {resource.external ? (
        <a
          href={resource.href}
          target="_blank"
          rel="noreferrer"
          className={className}
        >
          {content}
        </a>
      ) : (
        <Link
          href={resource.href}
          className={className}
        >
          {content}
        </Link>
      )}
    </motion.div>
  );
}

/* ========================================================= */
/* SIMPLE TOOL LINK */
/* ========================================================= */

function ToolLink({
  resource,
}: {
  resource: Resource;
}) {
  const className = `
    group
    inline-flex
    items-center
    gap-1.5
    text-[15px]
    leading-6
    text-muted-foreground
    transition-colors
    hover:text-foreground
  `;

  const content = (
    <>
      <span>
        {resource.title}
      </span>

      {resource.external && (
        <ArrowUpRight
          size={12}
          className="
            opacity-40
            transition-all
            group-hover:-translate-y-0.5
            group-hover:translate-x-0.5
            group-hover:opacity-100
          "
        />
      )}
    </>
  );

  if (resource.external) {
    return (
      <a
        href={resource.href}
        target="_blank"
        rel="noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={resource.href}
      className={className}
    >
      {content}
    </Link>
  );
}

/* ========================================================= */
/* TOOLS VIEW */
/* ========================================================= */

function ToolsView({
  query,
}: {
  query: string;
}) {
  const tools = useMemo(
    () =>
      resources.filter(
        (resource) =>
          resource.type ===
          'tool'
      ),
    []
  );

  const matchingTools =
    useMemo(
      () =>
        tools.filter(
          (resource) =>
            matchesSearch(
              resource,
              query
            )
        ),
      [
        tools,
        query,
      ]
    );

  const visibleFeatured =
    useMemo(
      () =>
        featuredTools
          .filter(
            (resource) =>
              matchesSearch(
                resource,
                query
              )
          )
          .slice(0, 8),
      [query]
    );

  const groupedTools =
    useMemo(() => {
      const groups =
        new Map<
          string,
          Resource[]
        >();

      matchingTools.forEach(
        (resource) => {
          const current =
            groups.get(
              resource.category
            ) ?? [];

          current.push(
            resource
          );

          groups.set(
            resource.category,
            current
          );
        }
      );

      return Array.from(
        groups.entries()
      )
        .map(
          ([
            category,
            items,
          ]) => ({
            category,
            items:
              sortResources(
                items
              ),
          })
        )
        .sort(
          (a, b) =>
            a.category.localeCompare(
              b.category
            )
        );
    }, [matchingTools]);

  if (
    matchingTools.length === 0
  ) {
    return (
      <div
        className="
          mt-12
          rounded-2xl
          border
          border-dashed
          border-border
          bg-card/50
          py-20
          text-center
        "
      >
        <p
          className="
            font-heading
            text-xl
            text-muted-foreground
          "
        >
          No tools match your search.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Featured tools */}
      {visibleFeatured.length >
        0 && (
          <section className="mt-12">
            <div
              className="
              flex
              items-end
              justify-between
              gap-6
              border-b
              border-border
              pb-5
            "
            >
              <div>
                <p
                  className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-muted-foreground
                "
                >
                  Featured
                </p>

                <h2
                  className="
                  mt-2
                  font-heading
                  text-2xl
                  font-semibold
                  tracking-tight
                  sm:text-3xl
                "
                >
                  Featured tools
                </h2>
              </div>
            </div>

            <div
              className="
              mt-6
              grid
              gap-4
              sm:grid-cols-2
              lg:grid-cols-4
            "
            >
              {visibleFeatured.map(
                (
                  resource,
                  index
                ) => (
                  <FeaturedToolCard
                    key={
                      resource.id
                    }
                    resource={
                      resource
                    }
                    index={index}
                  />
                )
              )}
            </div>
          </section>
        )}

      {/* All tools */}
      <section className="pb-24 pt-16">
        <div
          className="
            border-b
            border-border
            pb-5
          "
        >
          <p
            className="
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-muted-foreground
            "
          >
            Directory
          </p>

          <h2
            className="
              mt-2
              font-heading
              text-2xl
              font-semibold
              tracking-tight
              sm:text-3xl
            "
          >
            All tools
          </h2>
        </div>

        <div
          className="
            grid
            gap-x-12
            gap-y-12
            pt-8
            sm:grid-cols-2
            lg:grid-cols-3
            xl:grid-cols-4
          "
        >
          {groupedTools.map(
            ({
              category,
              items,
            }) => (
              <div
                key={category}
                className="
                  min-w-0
                "
              >
                <h3
                  className="
                    border-b
                    border-border
                    pb-3
                    text-xs
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-foreground
                  "
                >
                  {category}
                </h3>

                <div
                  className="
                    mt-4
                    flex
                    flex-col
                    items-start
                    gap-2.5
                  "
                >
                  {items.map(
                    (
                      resource
                    ) => (
                      <ToolLink
                        key={
                          resource.id
                        }
                        resource={
                          resource
                        }
                      />
                    )
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </section>
    </>
  );
}

/* ========================================================= */
/* RESOURCE LIBRARY */
/* ========================================================= */

export function ResourceLibrary() {
  const searchParams =
    useSearchParams();

  const initialType =
    searchParams.get(
      'type'
    ) ?? 'all';

  const [type, setType] =
    useState(
      resourceTypes.some(
        (item) =>
          item.id ===
          initialType
      )
        ? initialType
        : 'all'
    );

  const [topic, setTopic] =
    useState('all');

  const [query, setQuery] =
    useState('');

  const filtered =
    useMemo(() => {
      let list =
        getResourcesByType(
          type
        );

      if (
        topic !== 'all' &&
        type !== 'tool'
      ) {
        const selectedTopic =
          resourceTopics.find(
            (item) =>
              item.id ===
              topic
          );

        if (selectedTopic) {
          list =
            list.filter(
              (resource) =>
                resource.category.toLowerCase() ===
                selectedTopic.name.toLowerCase()
            );
        }
      }

      if (query.trim()) {
        list =
          list.filter(
            (resource) =>
              matchesSearch(
                resource,
                query
              )
          );
      }

      return list;
    }, [
      type,
      topic,
      query,
    ]);

  const tabs: {
    id: string;
    label: string;
  }[] = [
      {
        id: 'all',
        label: 'All',
      },
      ...resourceTypes.map(
        (item) => ({
          id: item.id,
          label: item.label,
        })
      ),
    ];

  const isToolsView =
    type === 'tool';

  return (
    <div
      className="
        min-h-screen
        pt-28
        md:pt-32
      "
    >
      <div className="container-page">
        <Link
          href="/"
          className="
            group
            inline-flex
            items-center
            gap-2
            text-sm
            font-medium
            text-muted-foreground
            transition-colors
            hover:text-foreground
          "
        >
          <ArrowLeft
            size={16}
            className="
              transition-transform
              duration-300
              group-hover:-translate-x-1
            "
          />

          Back home
        </Link>

        {/* Hero */}
        <motion.div
          initial={{
            opacity: 0,
            y: 24,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
            ease: [
              0.16,
              1,
              0.3,
              1,
            ],
          }}
          className="
            mt-8
            max-w-3xl
          "
        >
          <span
            className="
              flex
              items-center
              gap-3
              text-xs
              font-semibold
              uppercase
              tracking-widest
              text-muted-foreground
            "
          >
            <span
              className="
                h-px
                w-8
                bg-accent
              "
            />

            {isToolsView
              ? 'Tools'
              : 'Resource Library'}
          </span>

          <h1
            className="
              mt-6
              text-balance
              font-heading
              text-5xl
              font-semibold
              leading-[1.02]
              tracking-tight
              sm:text-6xl
              md:text-7xl
            "
          >
            {isToolsView
              ? 'Useful tools, all in one place.'
              : 'Guides, tools & curated links.'}
          </h1>

          <p
            className="
              mt-6
              max-w-xl
              text-lg
              leading-relaxed
              text-muted-foreground
            "
          >
            {isToolsView
              ? 'A growing collection of free tools and calculators for design, business, finance, marketing, and everyday work.'
              : 'A free, growing library of downloadable guides, interactive tools, and hand-picked external resources for designers and founders — from color systems to trademarks.'}
          </p>
        </motion.div>

        {/* Search */}
        <div
          className="
            mt-12
            max-w-xl
          "
        >
          <div className="relative">
            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-muted-foreground
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
              placeholder={
                isToolsView
                  ? 'Search tools…'
                  : 'Search resources, tools, topics…'
              }
              className="
                w-full
                rounded-full
                border
                border-input
                bg-background
                py-3
                pl-12
                pr-4
                text-sm
                text-foreground
                outline-none
                transition-colors
                placeholder:text-muted-foreground/60
                focus:border-foreground/40
                focus:ring-2
                focus:ring-ring/30
              "
            />
          </div>
        </div>

        {/* Type tabs */}
        <div
          className="
            mt-8
            flex
            flex-wrap
            gap-2
          "
        >
          {tabs.map(
            (tab) => {
              const count =
                tab.id ===
                  'all'
                  ? resources.length
                  : resources.filter(
                    (
                      resource
                    ) =>
                      resource.type ===
                      tab.id
                  ).length;

              const isActive =
                type === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setType(
                      tab.id
                    );

                    if (
                      tab.id ===
                      'tool'
                    ) {
                      setTopic(
                        'all'
                      );
                    }
                  }}
                  className={`
                    rounded-full
                    border
                    px-4
                    py-2
                    text-sm
                    font-medium
                    transition-colors
                    duration-300
                    ${isActive
                      ? `
                          border-primary
                          bg-primary
                          text-primary-foreground
                        `
                      : `
                          border-border
                          bg-card
                          text-muted-foreground
                          hover:border-foreground/30
                          hover:text-foreground
                        `
                    }
                  `}
                >
                  {tab.label}

                  <span
                    className={`
                      ml-2
                      text-xs
                      ${isActive
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground/60'
                      }
                    `}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* Topic filters:
            keep these for normal resource views,
            but tools now use the grouped directory. */}
        {!isToolsView && (
          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <span
              className="
                text-xs
                font-semibold
                uppercase
                tracking-widest
                text-muted-foreground
              "
            >
              Topic:
            </span>

            {[
              {
                id: 'all',
                name: 'All',
              },
              ...resourceTopics,
            ].map(
              (item) => (
                <button
                  key={
                    item.id
                  }
                  type="button"
                  onClick={() =>
                    setTopic(
                      item.id
                    )
                  }
                  className={`
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-medium
                    transition-colors
                    ${topic ===
                      item.id
                      ? `
                          bg-foreground
                          text-background
                        `
                      : `
                          text-muted-foreground
                          hover:text-foreground
                        `
                    }
                  `}
                >
                  {item.name}
                </button>
              )
            )}
          </div>
        )}

        {/* Specialized tools view */}
        {isToolsView ? (
          <ToolsView
            query={query}
          />
        ) : (
          <>
            <motion.div
              layout
              className="
                mt-10
                grid
                gap-6
                pb-24
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              <AnimatePresence mode="popLayout">
                {filtered.map(
                  (
                    resource,
                    index
                  ) => (
                    <ResourceCard
                      key={
                        resource.id
                      }
                      resource={
                        resource
                      }
                      index={
                        index
                      }
                    />
                  )
                )}
              </AnimatePresence>
            </motion.div>

            {filtered.length ===
              0 && (
                <div
                  className="
                  mt-10
                  rounded-2xl
                  border
                  border-dashed
                  border-border
                  bg-card/50
                  py-20
                  text-center
                "
                >
                  <p
                    className="
                    font-heading
                    text-xl
                    text-muted-foreground
                  "
                  >
                    No resources match your filters.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setType(
                        'all'
                      );
                      setTopic(
                        'all'
                      );
                      setQuery('');
                    }}
                    className="
                    mt-4
                    text-sm
                    font-medium
                    text-accent
                  "
                  >
                    Clear all filters
                  </button>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}