'use client';

const links = [
  {
    title: 'Changelog',
    href: '/changelog',
  },
  {
    title: 'Roadmap',
    href: '/roadmap',
  },
  {
    title: 'Privacy',
    href: '/privacy',
  },
  {
    title: 'Terms',
    href: '/terms',
  },
  {
    title: 'GitHub',
    href: 'https://github.com',
  },
];

export function AboutSection() {
  return (
    <div
      className="
        flex
        flex-col
        gap-3
        md:flex-row
        md:items-center
        md:justify-between
      "
    >
      <div>
        <p
          className="
            text-xs
            font-medium
          "
        >
          Design Blade
        </p>

        <p
          className="
            mt-0.5
            text-[11px]
            text-muted-foreground
          "
        >
          Version 1.0.0
        </p>
      </div>

      <div
        className="
          flex
          flex-wrap
          items-center
          gap-x-5
          gap-y-2
        "
      >
        {links.map((link) => (
          <a
            key={link.title}
            href={link.href}
            className="
              text-xs
              text-muted-foreground
              transition-colors
              hover:text-primary
            "
          >
            {link.title}
          </a>
        ))}
      </div>
    </div>
  );
}