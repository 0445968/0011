import Image from 'next/image';

const BACKGROUND_IMAGE =
  '/images/hero/hero-background.jpg';

export function HeroBackground() {
  return (
    <>
      {/* Background image */}
      <div
        className="
          absolute
          inset-0
          -z-30
        "
      >
        <Image
          src={BACKGROUND_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            object-cover
          "
          style={{
            objectPosition: 'center bottom',
          }}
        />
      </div>

      {/* Black fade */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          -z-20
          bg-gradient-to-b
          from-black/80
          via-black/80
          to-transparent
        "
      />

      {/* Texture */}
      <div
        aria-hidden="true"
        className="
          grid-noise
          pointer-events-none
          absolute
          inset-0
          -z-10
          opacity-20
        "
      />
    </>
  );
}