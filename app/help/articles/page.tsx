import Link from 'next/link';

import {
  ArrowLeft,
  ArrowUpRight,
  FileText,
} from 'lucide-react';

import {
  blogPosts,
} from '@/data/blog';

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    'en-US',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }
  );
}

export default function HelpArticlesPage() {
  const articles = [...blogPosts].sort(
    (a, b) =>
      new Date(b.date).getTime() -
      new Date(a.date).getTime()
  );

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
          bg-secondary/20
          pb-14
          pt-28
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
              text-muted-foreground
              transition-colors
              hover:text-primary
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
                text-primary
                sm:text-xs
              "
            >
              Articles
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
              Ideas, insights, and
              practical thinking.
            </h1>

            <p
              className="
                mt-6
                max-w-2xl
                text-base
                leading-7
                text-muted-foreground
                sm:text-lg
                sm:leading-8
              "
            >
              Explore articles covering
              branding, design, creative
              direction, business,
              strategy, and the decisions
              that shape better work.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Articles                                                     */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          py-16
          sm:py-20
          lg:py-24
        "
      >
        <div className="container-page">
          {/* Header */}

          <div
            className="
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-end
              sm:justify-between
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
                Journal
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
                All articles
              </h2>
            </div>

            <p
              className="
                text-sm
                text-muted-foreground
              "
            >
              {articles.length}{' '}
              {articles.length === 1
                ? 'article'
                : 'articles'}
            </p>
          </div>

          {/* Grid */}

          {articles.length > 0 ? (
            <div
              className="
                mt-10
                grid
                gap-5
                md:grid-cols-2
                xl:grid-cols-3
              "
            >
              {articles.map(
                (article) => (
                  <Link
                    key={article.slug}
                    href={`/blog/${article.slug}`}
                    className="
                      group
                      flex
                      min-h-[430px]
                      flex-col
                      overflow-hidden
                      rounded-3xl
                      border
                      border-border
                      bg-card
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:border-primary/35
                      hover:shadow-[0_18px_55px_rgba(0,0,0,0.08)]
                    "
                  >
                    {/* Image */}

                    <div
                      className="
                        relative
                        h-[220px]
                        overflow-hidden
                        bg-secondary
                      "
                    >
                      {article.cover ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={article.cover}
                          alt={article.title}
                          className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-700
                            ease-[cubic-bezier(0.16,1,0.3,1)]
                            group-hover:scale-[1.035]
                          "
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-full
                            items-center
                            justify-center
                            bg-primary/10
                            text-primary
                          "
                        >
                          <FileText
                            size={42}
                            strokeWidth={1.7}
                          />
                        </div>
                      )}

                      <div
                        className="
                          absolute
                          left-4
                          top-4
                          rounded-full
                          bg-[#BBFF1B]
                          px-2.5
                          py-1
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-black
                        "
                      >
                        Article
                      </div>
                    </div>

                    {/* Content */}

                    <div
                      className="
                        flex
                        flex-1
                        flex-col
                        p-6
                      "
                    >
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          gap-2
                          text-[11px]
                          text-muted-foreground
                        "
                      >
                        <span
                          className="
                            font-semibold
                            text-primary
                          "
                        >
                          {article.category}
                        </span>

                        <span
                          aria-hidden="true"
                          className="
                            h-1
                            w-1
                            rounded-full
                            bg-muted-foreground/35
                          "
                        />

                        <span>
                          {article.readingTime}
                        </span>

                        <span
                          aria-hidden="true"
                          className="
                            h-1
                            w-1
                            rounded-full
                            bg-muted-foreground/35
                          "
                        />

                        <span>
                          {formatDate(
                            article.date
                          )}
                        </span>
                      </div>

                      <h2
                        className="
                          mt-3
                          text-xl
                          font-semibold
                          leading-tight
                          tracking-[-0.025em]
                          text-foreground
                        "
                      >
                        {article.title}
                      </h2>

                      <p
                        className="
                          mt-3
                          line-clamp-3
                          text-sm
                          leading-6
                          text-muted-foreground
                        "
                      >
                        {article.excerpt}
                      </p>

                      <div
                        className="
                          mt-auto
                          flex
                          items-center
                          justify-between
                          gap-4
                          pt-7
                        "
                      >
                        <span
                          className="
                            text-sm
                            font-semibold
                            text-primary
                          "
                        >
                          Read article
                        </span>

                        <div
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-border
                            text-foreground
                            transition-all
                            duration-300
                            group-hover:border-[#BBFF1B]
                            group-hover:bg-[#BBFF1B]
                            group-hover:text-black
                          "
                        >
                          <ArrowUpRight
                            size={16}
                            strokeWidth={2}
                            className="
                              transition-transform
                              duration-300
                              group-hover:translate-x-0.5
                              group-hover:-translate-y-0.5
                            "
                          />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              )}
            </div>
          ) : (
            <div
              className="
                mt-10
                rounded-3xl
                border
                border-border
                bg-card
                px-6
                py-16
                text-center
              "
            >
              <FileText
                size={32}
                strokeWidth={1.7}
                className="
                  mx-auto
                  text-primary
                "
              />

              <h2
                className="
                  mt-5
                  text-xl
                  font-semibold
                  text-foreground
                "
              >
                No articles yet.
              </h2>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                New journal articles will
                automatically appear here
                as they are added.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Help CTA                                                     */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-t
          border-border
          pb-20
          pt-4
          sm:pb-24
          lg:pb-28
        "
      >
        <div className="container-page">
          <div
            className="
              flex
              flex-col
              gap-6
              rounded-3xl
              bg-primary
              p-7
              text-white
              sm:p-9
              md:flex-row
              md:items-center
              md:justify-between
              lg:p-10
            "
          >
            <div
              className="
                max-w-2xl
              "
            >
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-[#BBFF1B]
                "
              >
                Need something specific?
              </p>

              <h2
                className="
                  mt-3
                  font-serif
                  text-3xl
                  font-semibold
                  tracking-[-0.035em]
                "
              >
                Find a direct answer in
                the Help Center.
              </h2>

              <p
                className="
                  mt-3
                  max-w-xl
                  text-sm
                  leading-6
                  text-white/75
                "
              >
                Browse FAQs and guides,
                explore free tools, or
                contact Bivi if
                you need more specific
                help.
              </p>
            </div>

            <Link
              href="/help"
              className="
                group
                inline-flex
                min-h-[48px]
                shrink-0
                items-center
                justify-center
                gap-2
                self-start
                rounded-[14px]
                bg-[#BBFF1B]
                px-5
                py-3
                text-sm
                font-semibold
                text-black
                md:self-auto
              "
            >
              Help Center

              <ArrowUpRight
                size={16}
                strokeWidth={2}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-x-0.5
                  group-hover:-translate-y-0.5
                "
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}