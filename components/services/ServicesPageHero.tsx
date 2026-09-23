export function ServicesPageHero() {
  return (
    <section
      className="
        relative
        overflow-hidden
        bg-[#071B34]
        pb-24
        pt-32
        text-white
        sm:pb-28
        sm:pt-36
        lg:pb-32
        lg:pt-40
      "
    >
      {/* Background image */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[url('/images/services/services-hero.webp')]
          bg-cover
          bg-center
        "
      />

      {/* Purple wash */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[#1600A2]/82
        "
      />

      {/* Fade */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-b
          from-[#1600A2]/45
          via-[#1600A2]/75
          to-[#010008]
        "
      />

      {/* Lower fade */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-x-0
          bottom-0
          h-[52%]
          bg-gradient-to-b
          from-transparent
          via-[#071B34]/90
          to-[#010008]
        "
      />

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
            max-w-3xl
            pt-8
            text-center
            sm:pt-10
            lg:pt-12
          "
        >
          <p
            className="
              font-mono
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.2em]
              text-[#BBFF1B]
              sm:text-xs
            "
          >
            What we do
          </p>

          <h1
            className="
              mx-auto
              mt-4
              max-w-3xl
              text-balance
              font-heading
              text-3xl
              font-semibold
              leading-[1.01]
              tracking-[-0.04em]
              sm:text-4xl
              lg:text-5xl
              xl:text-[3.4rem]
            "
          >
            Creative services built
            around where your business
            needs to go next.
          </h1>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-sm
              leading-6
              text-white/70
              sm:text-base
            "
          >
            Strategy, design, and digital
            work brought together under
            one creative partner.
          </p>
        </div>
      </div>
    </section>
  );
}