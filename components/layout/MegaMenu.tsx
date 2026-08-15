'use client';

import { megaPanels, navSections } from '@/data/site';

interface MegaMenuProps {
  activeMega: string | null;
  closeTimer: React.MutableRefObject<NodeJS.Timeout | null>;
  handleNav: () => void;
  onClose: () => void;
}

export function MegaMenu({
  activeMega,
  closeTimer,
  handleNav,
  onClose,
  
}: MegaMenuProps) {

  if (!activeMega || !megaPanels[activeMega]) {
    return null;
  }

  const panel = megaPanels[activeMega];

  return (
    <div
  onMouseEnter={() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }
  }}
  onMouseLeave={onClose}
  className="
    hidden
    relative
    z-40
    border-t
    border-border
    bg-background
    lg:block
  "
>

      <div
  className="
    container-page
    grid
    gap-10
    py-10
    md:grid-cols-12
  "
>

        {/* Links */}
        <div className="md:col-span-6">

          <h3
            className="
              text-xs
              font-semibold
              uppercase
              tracking-widest
              text-primary
            "
          >
            {
              navSections.find(
                (item) => item.id === activeMega
              )?.label
            }
          </h3>


          <ul
            className="
              mt-5
              grid
              grid-cols-2
              gap-x-8
              gap-y-4
            "
          >
            {panel.links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  onClick={handleNav}
                  className="group block rounded-lg"
                >
                  <span
                    className="
                      font-heading
                      text-sm
                      font-semibold
                      text-foreground
                      transition-colors
                      group-hover:text-primary
                    "
                  >
                    {link.label}
                  </span>

                  {link.description && (
                    <span
                      className="
                        mt-0.5
                        block
                        text-xs
                        text-muted-foreground
                      "
                    >
                      {link.description}
                    </span>
                  )}

                </a>
              </li>
            ))}
          </ul>

        </div>


        {/* Preview */}
        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
            md:col-span-6
          "
        >
          {panel.previews.map((preview) => (
            <a
              key={preview.title}
              href={preview.href}
              onClick={handleNav}
              className="
                group
                overflow-hidden
                rounded-xl
                border
                border-border
                bg-card
              "
            >

              <div
                className="
                  relative
                  aspect-[16/10]
                  overflow-hidden
                  bg-secondary
                "
              >
                {preview.image && (
                  <img
                    src={preview.image}
                    alt={preview.title}
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-500
                      group-hover:scale-[1.05]
                    "
                  />
                )}

                {preview.badge && (
                  <span
                    className="
                      absolute
                      left-3
                      top-3
                      rounded-full
                      bg-primary
                      px-2.5
                      py-0.5
                      text-xs
                      font-semibold
                      text-primary-foreground
                    "
                  >
                    {preview.badge}
                  </span>
                )}

              </div>


              <div className="p-4">

                <span
                  className="
                    font-heading
                    text-sm
                    font-semibold
                  "
                >
                  {preview.title}
                </span>

                <p
                  className="
                    mt-1.5
                    text-xs
                    text-muted-foreground
                  "
                >
                  {preview.description}
                </p>

              </div>

            </a>
          ))}

        </div>

      </div>

    </div>
  );
}