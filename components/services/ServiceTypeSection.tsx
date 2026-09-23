import Image from 'next/image';

import type { Service } from '@/data/services';

import { ServiceProductStrip } from '@/components/services/service-page/ServiceProductStrip';

type ServiceTypeSectionProps = {
  service: Service;
  anchorId?: string;
};

export function ServiceTypeSection({
  service,
  anchorId,
}: ServiceTypeSectionProps) {
  const id =
    anchorId ?? service.id;

  return (
    <section
      id={id}
      className="
        scroll-mt-24
        bg-[#010008]
        text-white
      "
    >
      <div
        className="
          container-page
          py-20
          sm:py-24
          lg:py-32
        "
      >
        <div
          className="
            grid
            gap-10
            lg:grid-cols-[0.9fr_1.1fr]
            lg:items-center
            lg:gap-16
          "
        >
          {/* Copy */}

          <div>
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
              {service.title}
            </p>

            <h2
              className="
                mt-5
                max-w-xl
                text-balance
                font-heading
                text-3xl
                font-semibold
                leading-[1.02]
                tracking-[-0.04em]
                sm:text-4xl
                lg:text-5xl
              "
            >
              {service.description}
            </h2>

            <div
              className="
                mt-8
                flex
                flex-wrap
                gap-2
              "
            >
              {service.capabilities.map(
                (capability) => (
                  <span
                    key={capability}
                    className="
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.05]
                      px-3
                      py-1.5
                      text-xs
                      text-white/60
                    "
                  >
                    {capability}
                  </span>
                )
              )}
            </div>

            <a
              href="/contact"
              className="
                mt-8
                inline-flex
                rounded-full
                bg-white
                px-5
                py-3
                text-sm
                font-semibold
                text-black
                transition-colors
                hover:bg-[#BBFF1B]
              "
            >
              Start a project
            </a>
          </div>

          {/* Image */}

          <div
            className="
              relative
              min-h-[420px]
              overflow-hidden
              rounded-[28px]
              bg-[#071B34]
              sm:min-h-[520px]
              lg:min-h-[600px]
            "
          >
            <Image
              src={service.image}
              alt={service.title}
              fill
              sizes="
                (max-width: 1024px) 100vw,
                55vw
              "
              className="
                object-cover
              "
            />

            <div
              aria-hidden="true"
              className="
                pointer-events-none
                absolute
                inset-0
                bg-gradient-to-t
                from-black/25
                via-transparent
                to-transparent
              "
            />
          </div>
        </div>
      </div>

      <ServiceProductStrip
  service={{
    slug: service.id,
    title: service.title,
  }}
/>
    </section>
  );
}