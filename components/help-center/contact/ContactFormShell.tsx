'use client';

import type {
  ReactNode,
} from 'react';

import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface ContactFormShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;

  sidebarTitle?: string;
  sidebarDescription?: string;

  tips?: string[];

  backHref?: string;
  backLabel?: string;
}

export function ContactFormShell({
  eyebrow,
  title,
  description,
  children,

  sidebarTitle = 'Before you submit',
  sidebarDescription =
    'The more context you provide, the easier it is for Bivi to understand your request and respond appropriately.',

  tips = [],

  backHref = '/help/contact',
  backLabel = 'Contact options',
}: ContactFormShellProps) {
  return (
    <main
      className="
        min-h-screen
        bg-background
      "
    >
      {/* ------------------------------------------------------------ */}
      {/* Header                                                       */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          border-b
          border-border
          bg-secondary/20
          pb-12
          pt-28
          sm:pb-14
          sm:pt-32
          lg:pb-16
          lg:pt-36
        "
      >
        <div className="container-page">
          <Link
            href={backHref}
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

            {backLabel}
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
              {eyebrow}
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
              {title}
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
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ */}
      {/* Main layout                                                  */}
      {/* ------------------------------------------------------------ */}

      <section
        className="
          py-14
          sm:py-16
          lg:py-20
        "
      >
        <div
          className="
            container-page
            grid
            gap-10
            lg:grid-cols-[minmax(0,1fr)_340px]
            lg:gap-14
            xl:grid-cols-[minmax(0,1fr)_380px]
          "
        >
          {/* ---------------------------------------------------------- */}
          {/* Form                                                       */}
          {/* ---------------------------------------------------------- */}

          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                overflow-hidden
                rounded-3xl
                border
                border-border
                bg-card
                p-5
                sm:p-7
                lg:p-8
              "
            >
              {children}
            </div>

            {/* -------------------------------------------------------- */}
            {/* Privacy / expectations                                  */}
            {/* -------------------------------------------------------- */}

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-border
                bg-secondary/20
                px-5
                py-4
              "
            >
              <p
                className="
                  text-xs
                  leading-5
                  text-muted-foreground
                "
              >
                By submitting this form,
                you&apos;re providing the
                information needed for
                Bivi to review
                and respond to your
                request. No account or
                sign-in is required.
              </p>
            </div>
          </div>

          {/* ---------------------------------------------------------- */}
          {/* Sidebar                                                    */}
          {/* ---------------------------------------------------------- */}

          <aside
            className="
              lg:sticky
              lg:top-28
              lg:self-start
            "
          >
            <div
              className="
                overflow-hidden
                rounded-3xl
                border
                border-border
                bg-background
              "
            >
              {/* Top */}

              <div
                className="
                  border-b
                  border-border
                  p-6
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
                  Helpful context
                </p>

                <h2
                  className="
                    mt-3
                    text-xl
                    font-semibold
                    tracking-[-0.025em]
                    text-foreground
                  "
                >
                  {sidebarTitle}
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-muted-foreground
                  "
                >
                  {sidebarDescription}
                </p>
              </div>

              {/* Tips */}

              {tips.length > 0 && (
                <div
                  className="
                    p-6
                  "
                >
                  <div
                    className="
                      flex
                      flex-col
                      gap-4
                    "
                  >
                    {tips.map(
                      (tip) => (
                        <div
                          key={tip}
                          className="
                            flex
                            items-start
                            gap-3
                          "
                        >
                          <CheckCircle2
                            size={17}
                            strokeWidth={2}
                            className="
                              mt-0.5
                              shrink-0
                              text-primary
                            "
                          />

                          <p
                            className="
                              text-sm
                              leading-6
                              text-muted-foreground
                            "
                          >
                            {tip}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Help Center link */}

              <div
                className="
                  border-t
                  border-border
                  bg-secondary/20
                  p-6
                "
              >
                <p
                  className="
                    text-sm
                    font-semibold
                    text-foreground
                  "
                >
                  You may not need to submit
                  a request.
                </p>

                <p
                  className="
                    mt-2
                    text-xs
                    leading-5
                    text-muted-foreground
                  "
                >
                  Browse FAQs, guides,
                  articles, and free tools
                  first if you&apos;re
                  looking for an immediate
                  answer.
                </p>

                <Link
                  href="/help"
                  className="
                    group
                    mt-4
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-primary
                  "
                >
                  Browse Help Center

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
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}