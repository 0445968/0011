'use client';

import Link from 'next/link';
import {
  useEffect,
  useRef,
  useState,
} from 'react';
import { ArrowUpRight } from 'lucide-react';

import {
  IntegrationIcons,
  type IntegrationMousePosition,
} from './integrations/IntegrationIcons';

export function IntegrationsPromo() {
  const sectionRef =
    useRef<HTMLDivElement>(null);

  const [
    mousePosition,
    setMousePosition,
  ] =
    useState<IntegrationMousePosition>({
      x: 0,
      y: 0,
      active: false,
    });

  // Throttle pointer updates to one per animation frame so
  // fast mouse movement doesn't flood React with renders —
  // this is most of what makes the scramble feel smooth.
  const rafId = useRef<number | null>(null);
  const pendingPosition = useRef<{
    x: number;
    y: number;
  } | null>(null);

  const handlePointerMove = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    pendingPosition.current = {
      x: event.clientX,
      y: event.clientY,
    };

    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        if (pendingPosition.current) {
          setMousePosition({
            x: pendingPosition.current.x,
            y: pendingPosition.current.y,
            active: true,
          });
        }
        rafId.current = null;
      });
    }
  };

  const handlePointerLeave = () => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    pendingPosition.current = null;

    setMousePosition((current) => ({
      ...current,
      active: false,
    }));
  };

  useEffect(() => {
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return (
    <section
      aria-label="Integrations"
      className="
        relative
        py-6
        sm:py-8
        lg:py-10
      "
    >
      <div className="container-page">
        {/*
          This outer wrapper is intentionally NOT clipped
          (no overflow-hidden here) so that repelled icons
          can visually escape the rounded box below. The
          rounded gradient background is rendered as its own
          absolutely-positioned, clipped layer instead.
        */}
        <div
          ref={sectionRef}
          onPointerMove={
            handlePointerMove
          }
          onPointerLeave={
            handlePointerLeave
          }
          className="
            relative
            isolate
          "
        >
          {/* Clipped background layer — holds the rounded corners + gradient */}
          <div
            aria-hidden="true"
            className="
              absolute
              inset-0
              -z-10
              overflow-hidden
              rounded-[28px]
              bg-gradient-to-br
              from-[#0B65F3]
              to-[#1600A2]
            "
          />

          {/* Unclipped content layer — icons can bleed past this box's edges */}
          <div
            className="
              relative
              z-10
              grid
              min-h-[360px]
              overflow-visible
              lg:grid-cols-[0.88fr_1.12fr]
            "
          >
            {/* Copy */}
            <div
              className="
                flex
                items-center
                px-7
                py-10
                sm:px-10
                md:px-14
                lg:px-16
                lg:py-10
                xl:px-20
              "
            >
              <div className="max-w-[500px]">
                <h2
                  className="
                    text-balance
                    font-heading
                    text-2xl
                    font-semibold
                    leading-[2.8]
                    tracking-tight
                    text-white
                    sm:text-3xl
                    lg:text-[2rem]
                  "
                >
                  Keep your workflow connected with Bivi
                </h2>

                <Link
                  href="/integrations"
                  className="
                    group
                    mt-7
                    inline-flex
                    items-center
                    gap-2
                    border-b-2
                    border-[#BBFF1B]
                    pb-1
                    font-heading
                    text-base
                    font-semibold
                    text-white
                    transition-colors
                    duration-300
                    hover:text-[#BBFF1B]
                  "
                >
                  Explore all
                  integrations

                  <ArrowUpRight
                    size={18}
                    className="
                      transition-transform
                      duration-300
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                    "
                  />
                </Link>
              </div>
            </div>

            {/* Interactive icons */}
            <IntegrationIcons
              mousePosition={
                mousePosition
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}