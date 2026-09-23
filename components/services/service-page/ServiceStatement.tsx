import type { ServicePage } from '@/data/servicePages';

type ServiceStatementProps = {
  service: ServicePage;
};

type Statement = {
  muted: string;
  highlight: string;
};

const statements: Record<string, Statement> = {
  'branding-services': {
    muted:
      'A logo can make you recognizable. A clear system makes your business',
    highlight:
      'memorable everywhere.',
  },

  'creative-direction': {
    muted:
      'Good ideas become stronger when every visual decision',
    highlight:
      'points in the same direction.',
  },

  'packaging-merch-design': {
    muted:
      'Your brand should feel just as considered in someone’s hands as it does',
    highlight:
      'on the screen.',
  },

  'presentation-design': {
    muted:
      'The best presentations do more than look polished. They make important ideas',
    highlight:
      'easier to understand.',
  },

  'print-design': {
    muted:
      'Digital moves quickly. Thoughtful print gives people something',
    highlight:
      'worth holding onto.',
  },

  'web-design': {
    muted:
      'Your website should do more than look good. It should make your business',
    highlight:
      'easier to understand and choose.',
  },

  'mobile-app-design': {
    muted:
      'Complex products become valuable when the experience makes them',
    highlight:
      'feel simple to use.',
  },

  'campaign-strategy': {
    muted:
      'A collection of assets is not a campaign. Strong campaigns begin with',
    highlight:
      'one idea people can remember.',
  },

  'social-media-creative': {
    muted:
      'Showing up often is not enough. The goal is to become',
    highlight:
      'recognizable while people scroll.',
  },

  'email-design': {
    muted:
      'Every message is another chance to make your business',
    highlight:
      'feel familiar and intentional.',
  },
};

export function ServiceStatement({
  service,
}: ServiceStatementProps) {
  const statement =
    statements[service.slug] ??
    statements['branding-services'];

  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#010008]
        text-white
      "
    >
      {/* ---------------------------------------------------------- */}
      {/* Background atmosphere                                      */}
      {/* ---------------------------------------------------------- */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-56
          top-1/2
          h-[520px]
          w-[520px]
          -translate-y-1/2
          rounded-full
          bg-[#1600A2]/14
          blur-[150px]
        "
      />

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -right-40
          bottom-[-220px]
          h-[460px]
          w-[460px]
          rounded-full
          bg-[#1D45FF]/10
          blur-[140px]
        "
      />

      {/* ---------------------------------------------------------- */}
      {/* Content                                                     */}
      {/* ---------------------------------------------------------- */}

      <div
        className="
          container-page
          relative
          z-10
          py-24
          sm:py-28
          lg:py-36
          xl:py-40
        "
      >
        <div
          className="
            max-w-[1200px]
          "
        >
          {/* Eyebrow */}

          <div
            className="
              mb-8
              flex
              items-center
              gap-3
              sm:mb-10
            "
          >
            <span
              aria-hidden="true"
              className="
                h-px
                w-8
                bg-[#BBFF1B]
              "
            />

            <p
              className="
                font-mono
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.2em]
                text-white/45
                sm:text-xs
              "
            >
              Why it matters
            </p>
          </div>

          {/* Statement */}

          <h2
            className="
              max-w-[1180px]
              text-balance
              font-heading
              text-[2.35rem]
              font-medium
              leading-[1.04]
              tracking-[-0.045em]
              sm:text-[3.25rem]
              lg:text-[4.4rem]
              xl:text-[5.2rem]
            "
          >
            <span className="text-white/35">
              {statement.muted}{' '}
            </span>

            <span className="text-white">
              {statement.highlight}
            </span>
          </h2>
        </div>

        {/* -------------------------------------------------------- */}
        {/* Bottom marker                                            */}
        {/* -------------------------------------------------------- */}

        <div
          className="
            mt-20
            flex
            items-center
            gap-4
            sm:mt-24
            lg:mt-32
          "
        >
          <span
            className="
              font-mono
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.18em]
              text-white/30
            "
          >
            Bivi
          </span>

          <div
            className="
              h-px
              flex-1
              bg-white/10
            "
          />

          <span
            className="
              h-2
              w-2
              shrink-0
              rounded-full
              bg-[#BBFF1B]
            "
          />
        </div>
      </div>
    </section>
  );
}