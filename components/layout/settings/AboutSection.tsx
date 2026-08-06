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
        gap-5
        border-t
        border-border
        pt-8
        md:flex-row
        md:items-center
        md:justify-between
      "
    >
      <div>
        <p className="font-medium">
          Design Blade
        </p>

        <p className="text-sm text-muted-foreground">
          Version 1.0.0
        </p>
      </div>

      <div
        className="
          flex
          flex-wrap
          gap-6
        "
      >
        {links.map((link) => (
          <a
            key={link.title}
            href={link.href}
            className="
              text-sm
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