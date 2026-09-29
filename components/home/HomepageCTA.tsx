import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

import { Reveal } from '@/components/portfolio/Reveal';

export function HomepageCTA() {
  return (
    <section
      className="
        bg-black
        px-4
        pb-24
        pt-6
        sm:px-6
        sm:pb-20
        sm:pt-8
        lg:pb-24
      "
    >
      <Reveal>
        <div
          className="
            relative
            overflow-hidden
            rounded-[28px]
            bg-[#1C1C1C]
            px-6
            py-14
            sm:rounded-[32px]
            sm:px-10
            sm:py-16
            lg:px-16
            lg:py-20
          "
        >
          <div
            className="
              mx-auto
              flex
              max-w-4xl
              flex-col
              items-center
              text-center
            "
          >
            {/* Label */}
            <p
              className="
                font-mono
                text-[11px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-white/45
                sm:text-[12px]
              "
            >
              Let&apos;s work together
            </p>

            {/* Heading */}
            <h2
              className="
                mt-5
                max-w-2xl
                text-balance
                font-heading
                text-[2rem]
                font-semibold
                leading-[1.05]
                tracking-[-0.035em]
                text-white
                sm:text-[2.5rem]
                md:text-[2.8rem]
                lg:text-[3rem]
              "
            >
              Let the journey begin
            </h2>

            {/* Description */}
            <p
  style={{
    color: 'rgba(255, 255, 255, 0.62)',
  }}
  className="
    mt-5
    max-w-xl
    text-[15px]
    leading-[25px]
    sm:text-[16px]
    sm:leading-[27px]
  "
>
  Whether you&apos;re starting something new
  or ready to take your business further,
  Bivi can help you make your next move count.
</p>

            {/* CTA */}
            <Link
              href="/contact"
              className="
                group
                mt-8
                inline-flex
                h-[50px]
                items-center
                justify-center
                gap-2.5
                rounded-[14px]
                bg-white
                px-6
                font-mono
                text-[13px]
                font-medium
                text-black
                transition-all
                duration-300
                hover:scale-[1.02]
                hover:bg-white/90
                active:scale-[0.98]
              "
            >
              Get started

              <ArrowUpRight
                className="
                  h-4
                  w-4
                  transition-transform
                  duration-300
                  group-hover:-translate-y-0.5
                  group-hover:translate-x-0.5
                "
                strokeWidth={2}
              />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}