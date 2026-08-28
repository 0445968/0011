'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  Mail,
  ShieldCheck,
} from 'lucide-react';

import {
  socialLinks,
  contactInfo,
  siteConfig,
} from '@/data/site';

import { useI18n } from '@/lib/i18n/context';
import { LanguageSwitcher } from './LanguageSwitcher';

interface FooterLink {
  labelKey: string;
  href: string;
  icon?: string;
}

interface FooterGroup {
  titleKey: string;
  links: FooterLink[];
}

const footerGroups: FooterGroup[] = [
  {
    titleKey: 'footer.company',
    links: [
      {
        labelKey: 'footer.home',
        href: '/',
      },
      {
        labelKey: 'nav.about',
        href: '/about',
      },
      {
        labelKey: 'nav.integrations',
        href: '/integrations',
      },
      {
        labelKey: 'nav.process',
        href: '/process',
      },
      {
        labelKey: 'nav.careers',
        href: '/careers',
      },
      {
        labelKey: 'footer.contact',
        href: '/contact',
      },
      {
        labelKey: 'footer.faq',
        href: '/faq',
      },
    ],
  },

  {
    titleKey: 'footer.resources',
    links: [
      {
        labelKey: 'footer.portfolio',
        href: '/portfolio',
      },
      {
        labelKey: 'nav.journal',
        href: '/blog',
      },
      {
        labelKey: 'nav.guides',
        href: '/guides',
      },
      {
        labelKey: 'nav.inspiration',
        href: '/inspiration',
      },
      {
        labelKey: 'footer.freeResources',
        href: '/resources',
      },
    ],
  },

  {
    titleKey: 'footer.solutions',
    links: [
      {
        labelKey: 'nav.services',
        href: '/services',
        icon: '/images/footer/solutions/services.png',
      },
      {
        labelKey: 'footer.webDesign',
        href: '/services',
        icon: '/images/footer/solutions/web-design.png',
      },
      {
        labelKey: 'footer.brandSystems',
        href: '/services',
        icon: '/images/footer/solutions/brand-systems.png',
      },
      {
        labelKey: 'footer.development',
        href: '/services',
        icon: '/images/footer/solutions/development.png',
      },
      {
        labelKey: 'footer.creativeStrategy',
        href: '/services',
        icon: '/images/footer/solutions/strategy.png',
      },
    ],
  },

  {
    titleKey: 'footer.tools',
    links: [
      {
        labelKey: 'nav.demos',
        href: '/demos',
        icon: '/images/footer/tools/demos.png',
      },
      {
        labelKey: 'footer.guides',
        href: '/guides',
        icon: '/images/footer/tools/guides.png',
      },
      {
        labelKey: 'footer.inspiration',
        href: '/inspiration',
        icon: '/images/footer/tools/inspiration.png',
      },
      {
        labelKey: 'footer.resourcesLibrary',
        href: '/resources',
        icon: '/images/footer/tools/resources.png',
      },
    ],
  },
];

const legalLinkKeys = [
  {
    labelKey: 'footer.privacy',
    href: '/privacy',
  },
  {
    labelKey: 'footer.terms',
    href: '/terms',
  },
  {
    labelKey: 'footer.cookiePrefs',
    href: '#',
  },
  {
    labelKey: 'footer.accessibility',
    href: '/accessibility',
  },
];

const pagesWithoutTagline = [
  '/',
  '/demos',
  '/about',
  '/careers',
];

export function Footer() {
  const { t } = useI18n();
  const pathname = usePathname();

  const [time, setTime] = useState('');

  const hideTagline =
    pagesWithoutTagline.includes(pathname);

  useEffect(() => {
    const updateTime = () => {
      const houstonTime =
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/Chicago',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(new Date());

      setTime(houstonTime);
    };

    updateTime();

    const interval = setInterval(
      updateTime,
      1000
    );

    return () => clearInterval(interval);
  }, []);

  return (
    <footer
      className="
        relative
        bg-muted/70
        text-foreground
      "
    >
      <div
        className={`
          container-page
          ${
            hideTagline
              ? `
                pt-24
                pb-8
                md:pt-32
                lg:pt-36
              `
              : `
                pt-20
                pb-8
                md:pt-28
              `
          }
        `}
      >
        {/* Tagline */}
        {!hideTagline && (
          <div className="max-w-5xl">
            <h2
              className="
                font-serif
                text-5xl
                font-medium
                leading-[0.92]
                tracking-tight
                text-foreground
                md:text-6xl
              "
            >
              {t('footer.tagline')}

              <span
                className="
                  block
                  text-[#0B65F3]
                "
              >
                {t('footer.taglineAccent')}
              </span>
            </h2>
          </div>
        )}

        {/* Main content */}
        <div
          className={`
            grid
            gap-14
            lg:grid-cols-12
            ${
              hideTagline
                ? 'mt-0'
                : 'mt-20'
            }
          `}
        >
          {/* Contact / brand */}
          <div className="lg:col-span-4">
            <a
              href="/"
              aria-label="Bivi home"
              className="
                inline-flex
                items-center
              "
            >
              <img
                src="/images/logo.svg"
                alt={siteConfig.name}
                className="
                  h-10
                  w-auto
                "
              />
            </a>

            <div className="mt-8 space-y-5">
              <a
                href={`mailto:${contactInfo.email}`}
                className="
                  group
                  inline-flex
                  items-center
                  gap-2
                  text-base
                  font-medium
                  text-foreground
                  transition-colors
                  duration-150
                  hover:text-[#0B65F3]
                "
              >
                <Mail
                  size={17}
                  className="
                    text-muted-foreground
                    transition-colors
                    duration-150
                    group-hover:text-[#0B65F3]
                  "
                />

                {contactInfo.email}

                <ArrowUpRight
                  size={15}
                  className="
                    opacity-0
                    transition-opacity
                    duration-150
                    group-hover:opacity-100
                  "
                />
              </a>

              <div
                className="
                  space-y-2
                  text-sm
                  leading-6
                  text-muted-foreground
                "
              >
                <p>
                  {contactInfo.location}
                </p>

                <p>
                  {t('footer.localTime')} —{' '}
                  {time}
                </p>
              </div>
            </div>

            {/* Socials */}
            <ul
              className="
                mt-8
                flex
                flex-wrap
                gap-2
              "
            >
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-border
                      bg-background/50
                      text-muted-foreground
                      transition-colors
                      duration-150
                      hover:border-[#0B65F3]
                      hover:text-[#0B65F3]
                    "
                  >
                    <link.icon size={17} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sitemap */}
          <div
            className="
              grid
              gap-x-8
              gap-y-12
              sm:grid-cols-2
              lg:col-span-8
              lg:grid-cols-4
            "
          >
            {footerGroups.map((group) => (
              <div key={group.titleKey}>
                <h3
                  className="
                    font-heading
                    text-[15px]
                    font-semibold
                    tracking-[-0.01em]
                    text-foreground
                  "
                >
                  {t(group.titleKey)}
                </h3>

                <ul
                  className="
                    mt-6
                    space-y-4
                  "
                >
                  {group.links.map((link) => (
                    <li key={link.labelKey}>
                      <a
                        href={link.href}
                        className="
                          group
                          flex
                          items-center
                          gap-2.5
                          text-sm
                          text-muted-foreground
                          transition-colors
                          duration-150
                          hover:text-foreground
                        "
                      >
                        {link.icon && (
                          <span
                            className="
                              flex
                              h-6
                              w-6
                              shrink-0
                              items-center
                              justify-center
                            "
                          >
                            <img
                              src={link.icon}
                              alt=""
                              aria-hidden="true"
                              className="
                                h-5
                                w-5
                                object-contain
                              "
                            />
                          </span>
                        )}

                        <span>
                          {t(link.labelKey)}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance */}
<div
  className="
    mt-20
    flex
    flex-wrap
    items-center
    gap-4
  "
>
  <a
    href="#"
    aria-label="HIPAA compliance"
    className="
      inline-flex
      items-center
      transition-opacity
      duration-150
      hover:opacity-70
    "
  >
    <img
      src="/images/footer/hipaa.svg"
      alt="HIPAA compliant"
      className="
        h-8
        w-auto
        object-contain
      "
    />
  </a>

  <a
    href="#"
    aria-label="GDPR compliance"
    className="
      inline-flex
      items-center
      transition-opacity
      duration-150
      hover:opacity-70
    "
  >
    <img
      src="/images/footer/gdpr.webp"
      alt="GDPR compliant"
      className="
        h-8
        w-auto
        object-contain
      "
    />
  </a>
</div>

        {/* Bottom bar */}
        <div
          className="
            mt-10
            grid
            gap-6
            border-t
            border-border
            pt-7
            text-xs
            text-muted-foreground
            md:grid-cols-[auto_1fr_auto]
            md:items-center
          "
        >
          {/* Copyright */}
          <p>
            © {new Date().getFullYear()}{' '}
            {siteConfig.name}.{' '}
            {t('footer.rights')}
          </p>

          {/* Legal */}
          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-5
              gap-y-2
              md:justify-center
            "
          >
            {legalLinkKeys.map((link) => (
              <a
                key={link.labelKey}
                href={link.href}
                className="
                  underline-offset-4
                  transition-colors
                  duration-150
                  hover:text-foreground
                  hover:underline
                "
              >
                {t(link.labelKey)}
              </a>
            ))}
          </div>

          {/* Language */}
          <div className="md:justify-self-end">
            <LanguageSwitcher compact />
          </div>
        </div>
      </div>
    </footer>
  );
}