import Image from 'next/image';

const BACKGROUND_MEDIA =
  '/images/hero/hero-background02.mp4';

const VIDEO_EXTENSIONS = [
  '.mp4',
  '.webm',
  '.mov',
  '.m4v',
];

function isVideoFile(
  src: string
) {
  const cleanSrc =
    src
      .split('?')[0]
      .toLowerCase();

  return VIDEO_EXTENSIONS.some(
    (extension) =>
      cleanSrc.endsWith(
        extension
      )
  );
}

export function HeroBackground() {
  const isVideo =
    isVideoFile(
      BACKGROUND_MEDIA
    );

  return (
    <>
      {/* Background media */}

      <div
        className="
          absolute
          inset-0
          -z-30
          overflow-hidden
        "
      >
        {isVideo ? (
          <video
            key={
              BACKGROUND_MEDIA
            }
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            className="
              h-full
              w-full
              object-cover
            "
          >
            <source
              src={
                BACKGROUND_MEDIA
              }
            />
          </video>
        ) : (
          <Image
            src={
              BACKGROUND_MEDIA
            }
            alt=""
            fill
            priority
            sizes="100vw"
            className="
              object-cover
            "
            style={{
              objectPosition:
                'center',
            }}
          />
        )}
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
          from-black/90
          via-black/60
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