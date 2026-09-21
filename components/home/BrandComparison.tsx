import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const withoutBivi = [
  'Your brand is forgettable',
  'Your mission goes unnoticed',
  'Your value gets lost',
  'You blend in with competitors',
  'You lose your momentum',
];

const withBivi = [
  {
    strong: 'Stronger recognition',
    rest: 'across all media',
  },
  {
    strong: 'Focused messaging',
    rest: 'that people believe in',
  },
  {
    strong: 'Clear positioning',
    rest: 'that sets you apart',
  },
  {
    strong: 'Clear differentiation',
    rest: 'from the rest',
  },
  {
    strong: 'A stronger foundation',
    rest: 'built to last',
  },
];

export function BrandComparison() {
  return (
    <section
      className="
        bg-background
        px-5
        pt-8
        pb-20
        sm:px-6
        sm:pt-10
        sm:pb-24
        lg:px-8
        lg:pt-12
        lg:pb-28
      "
    >
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <h2
            style={{
              lineHeight: '1.15',
            }}
            className="
              text-balance
              font-heading
              text-3xl
              font-semibold
              tracking-[-0.045em]
              text-foreground
              sm:text-4xl
              lg:text-5xl
            "
          >
            Growing a strong business
            <br />
            requires the right support
          </h2>

          <p
            className="
              mx-auto
              mt-6
              max-w-2xl
              text-base
              leading-7
              text-muted-foreground
              sm:text-lg
              sm:leading-8
            "
          >
            Without a clear strategy, a business can self-sabotage.
            Bivi enhances your vision so your brand is ready to scale
            exponentially.
          </p>
        </div>

        {/* Comparison */}
        <div
          className="
            mx-auto
            mt-14
            grid
            max-w-5xl
            overflow-hidden
            rounded-[22px]
            border
            border-border
            bg-background
            md:grid-cols-2
            lg:mt-16
          "
        >
          {/* Without Bivi */}
          <div
            className="
              border-b
              border-border
              p-6
              sm:p-8
              md:border-b-0
              md:border-r
              lg:p-9
            "
          >
            <h3
              className="
                inline-flex
                w-fit
                items-center
                rounded-full
                border
                border-dashed
                border-primary
                bg-transparent
                px-3
                py-1.5
                font-mono
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-primary
                sm:text-xs
              "
            >
              Without Bivi
            </h3>

            <div className="mt-6 space-y-3">
              {withoutBivi.map((item) => (
                <div
                  key={item}
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <div
                    className="
                      mt-[1px]
                      flex
                      h-5
                      w-5
                      shrink-0
                      items-center
                      justify-center
                    "
                  >
                    <Image
                      src="/images/brand-comparison/x-mark.png"
                      alt=""
                      width={20}
                      height={20}
                      className="
                        h-4
                        w-4
                        object-contain
                      "
                    />
                  </div>

                  <p
                    className="
                      text-[13px]
                      leading-[1.45]
                      text-muted-foreground
                      sm:text-sm
                    "
                  >
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* With Bivi */}
          <div
            className="
              p-6
              sm:p-8
              lg:p-9
            "
          >
            <h3
              className="
                inline-flex
                w-fit
                items-center
                rounded-full
                border
                border-dashed
                border-primary
                bg-transparent
                px-3
                py-1.5
                font-mono
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.12em]
                text-primary
                sm:text-xs
              "
            >
              With Bivi
            </h3>

            <div className="mt-6 space-y-3">
              {withBivi.map((item) => (
                <div
                  key={item.strong}
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <div
                    className="
                      mt-[1px]
                      flex
                      h-5
                      w-5
                      shrink-0
                      items-center
                      justify-center
                    "
                  >
                    <Image
                      src="/images/brand-comparison/check-mark.png"
                      alt=""
                      width={20}
                      height={20}
                      className="
                        h-4
                        w-4
                        object-contain
                      "
                    />
                  </div>

                  <p
                    className="
                      text-[13px]
                      leading-[1.45]
                      text-muted-foreground
                      sm:text-sm
                    "
                  >
                    <span
                      className="
                        font-semibold
                        text-foreground
                      "
                    >
                      {item.strong}
                    </span>{' '}
                    {item.rest}
                  </p>
                </div>
              ))}
            </div>

            <Link
              href="/demos"
              className="
                mt-7
                inline-flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-[14px]
                bg-muted
                px-5
                text-sm
                font-semibold
                text-black
                transition-colors
                duration-200
                hover:bg-muted/70
                dark:bg-white
                dark:text-black
                dark:hover:bg-[#BBFF1B]
              "
            >
              Try one of our demos

              <ArrowRight
                className="h-4 w-4"
                strokeWidth={2}
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}