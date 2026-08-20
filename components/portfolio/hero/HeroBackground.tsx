import Image from 'next/image';

const BACKGROUND_IMAGE =
  '/images/hero/hero-background-10.jpg';

export function HeroBackground() {
  return (
    <>
      {/* Background image */}
      <div className="absolute inset-0 -z-30">
        <Image
          src={BACKGROUND_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            object-cover
            object-center
          "
        />
      </div>

      {/* Background color overlay */}
      <div
        className="
          absolute
          inset-0
          -z-20
          bg-[#1600A2]/100
          mix-blend-multiply
        "
      />

      {/* Background gradient */}
      <div
        className="
          absolute
          inset-0
          -z-10
          bg-gradient-to-b
          from-[#0B65F3]/35
          via-[#0B65F3]/50
          to-[#0B65F3]/95
        "
      />

      {/* Texture */}
      <div
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