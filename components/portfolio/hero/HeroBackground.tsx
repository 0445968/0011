const BACKGROUND_VIDEO =
  '/images/hero/hero-background.mp4';

export function HeroBackground() {
  return (
    <>
      {/* Background video */}
      <div className="absolute inset-0 -z-30">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="
            h-full
            w-full
            object-cover
            object-center
          "
        >
          <source
            src={BACKGROUND_VIDEO}
            type="video/mp4"
          />
        </video>
      </div>

      {/* Black fade */}
      <div
        className="
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