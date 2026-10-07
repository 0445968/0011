'use client';

import {
  services,
} from '@/data/services';

const serviceNames =
  services.map(
    (service) =>
      service.title
  );

export function LoginServicesMarquee() {
  const items = [
    ...serviceNames,
    ...serviceNames,
  ];

  return (
    <div
      className="
        relative
        z-20
        overflow-hidden
        border-t
        border-white/[0.08]
        bg-black/35
        backdrop-blur-xl
      "
    >
      <div
        className="
          flex
          min-w-max
          animate-[bivi-login-marquee_36s_linear_infinite]
          items-center
          py-3.5
          will-change-transform
        "
      >
        {items.map(
          (service, index) => (
            <div
              key={`${service}-${index}`}
              className="
                flex
                shrink-0
                items-center
              "
            >
              <span
                className="
                  whitespace-nowrap
                  px-6
                  font-mono
                  text-[9px]
                  uppercase
                  tracking-[0.2em]
                  text-white/55
                "
              >
                {service}
              </span>

              <span
                aria-hidden="true"
                className="
                  text-[9px]
                  text-white/25
                "
              >
                ✦
              </span>
            </div>
          )
        )}
      </div>

      <style jsx>{`
        @keyframes bivi-login-marquee {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        @media (
          prefers-reduced-motion: reduce
        ) {
          div {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}