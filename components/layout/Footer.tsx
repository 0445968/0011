'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Mail } from 'lucide-react';

import {
  socialLinks,
  contactInfo,
  siteConfig,
} from '@/data/site';

import { useI18n } from '@/lib/i18n/context';
import { LanguageSwitcher } from './LanguageSwitcher';

interface FooterGroup {
  titleKey: string;
  links: { labelKey: string; href: string }[];
}

const footerGroups: FooterGroup[] = [
  {
    titleKey: 'footer.company',
    links: [
      { labelKey: 'footer.home', href: '/' },
      { labelKey: 'nav.about', href: '/about' },
      { labelKey: 'nav.integrations', href: '/integrations' },
      { labelKey: 'nav.process', href: '/process' },
      { labelKey: 'nav.careers', href: '/careers' },
      { labelKey: 'footer.contact', href: '/contact' },
      { labelKey: 'footer.faq', href: '/faq' },
    ],
  },
  {
    titleKey: 'footer.resources',
    links: [
      { labelKey: 'footer.portfolio', href: '/portfolio' },
      { labelKey: 'nav.journal', href: '/blog' },
      { labelKey: 'nav.guides', href: '/guides' },
      { labelKey: 'nav.inspiration', href: '/inspiration' },
      { labelKey: 'footer.freeResources', href: '/resources' },
    ],
  },
  {
    titleKey: 'footer.solutions',
    links: [
      { labelKey: 'nav.services', href: '/services' },
      { labelKey: 'footer.webDesign', href: '/services' },
      { labelKey: 'footer.brandSystems', href: '/services' },
      { labelKey: 'footer.development', href: '/services' },
      { labelKey: 'footer.creativeStrategy', href: '/services' },
    ],
  },
  {
    titleKey: 'footer.tools',
    links: [
      { labelKey: 'footer.templates', href: '/work' },
      { labelKey: 'nav.demos', href: '/demos' },
      { labelKey: 'footer.guides', href: '/guides' },
      { labelKey: 'footer.inspiration', href: '/inspiration' },
      { labelKey: 'footer.resourcesLibrary', href: '/resources' },
    ],
  },
];

const legalLinkKeys = [
  { labelKey: 'footer.privacy', href: '/privacy' },
  { labelKey: 'footer.terms', href: '/terms' },
  { labelKey: 'footer.cookiePrefs', href: '#' },
  { labelKey: 'footer.accessibility', href: '/accessibility' },
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

  const hideTagline = pagesWithoutTagline.includes(pathname);

  useEffect(() => {
    const updateTime = () => {
      const houstonTime = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(new Date());

      setTime(houstonTime);
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
         <footer className="relative bg-[#1600A2] text-white">
  <div
    className={`
      container-page
      ${
        hideTagline
          ? 'pt-12 pb-8 md:pt-16 md:pb-8'
          : 'pt-20 pb-8 md:pt-28 md:pb-8'
      }
    `}
  >
        {/* Footer Hero */}
        {!hideTagline && (
          <div className="max-w-5xl">
            <h2
              className="
                font-serif
                text-5xl
                font-medium
                leading-[0.9]
                tracking-tight
                text-white
                md:text-6xl
              "
            >
              {t('footer.tagline')}

              <span className="block text-[#BBFF1B]">
                {t('footer.taglineAccent')}
              </span>
            </h2>
          </div>
        )}

        {/* Footer Content */}
        <div
          className={`
            grid
            gap-12
            lg:grid-cols-12
            ${
              hideTagline
                ? 'mt-0'
                : 'mt-16'
            }
          `}
        >
          {/* Contact */}
          <div className="lg:col-span-4">
            <div className="mt-2 space-y-5">
              <a
                href={`mailto:${contactInfo.email}`}
                className="
                  group
                  inline-flex
                  items-center
                  gap-2
                  text-lg
                  font-medium
                  text-white
                  transition-colors
                  duration-150
                  hover:text-[#BBFF1B]
                "
              >
                <Mail
                  size={18}
                  className="
                    text-secondary
                    transition-colors
                    duration-150
                    group-hover:text-[#BBFF1B]
                  "
                />

                {contactInfo.email}

                <ArrowUpRight
                  size={16}
                  className="
                    opacity-0
                    transition-all
                    duration-300
                    group-hover:translate-x-0.5
                    group-hover:-translate-y-0.5
                    group-hover:opacity-100
                  "
                />
              </a>

              <div className="space-y-2 text-sm text-white/60">
                <p>
                  {contactInfo.location}
                </p>

                <p>
                  {t('footer.localTime')} — {time}
                </p>
              </div>
            </div>

            {/* Social Icons */}
            <ul className="mt-8 flex gap-3">
              {socialLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/20
                      text-white/80
                      transition-all
                      duration-150
                      hover:border-[#BBFF1B]
                      hover:text-[#BBFF1B]
                    "
                  >
                    <link.icon size={18} />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sitemap */}
          <div
            className="
              grid
              gap-10
              sm:grid-cols-2
              lg:col-span-8
              lg:grid-cols-4
            "
          >
            {footerGroups.map((group) => (
              <div key={group.titleKey}>
                <h3
                  className="
                    text-base
                    font-semibold
                    uppercase
                    tracking-[0.15em]
                    text-white
                  "
                >
                  {t(group.titleKey)}
                </h3>

                <ul className="mt-6 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.labelKey}>
                      <a
                        href={link.href}
                        className="
                          text-sm
                          text-white/70
                          transition-colors
                          duration-100
                          hover:text-[#BBFF1B]
                        "
                      >
                        {t(link.labelKey)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="
            mt-20
            grid
            gap-6
            border-t
            border-white/20
            pt-8
            text-xs
            text-white/50
            md:grid-cols-3
            md:items-center
          "
        >
          {/* Logo */}
          <div>
            <a
              href="/"
              aria-label="Bivi home"
            >
              <img
                src="/images/logo.svg"
                alt={siteConfig.name}
                className="
                  h-10
                  w-auto
                  brightness-0
                  invert
                "
              />
            </a>
          </div>

          {/* Legal + Language */}
          <div
            className="
              flex
              items-center
              justify-center
              gap-x-5
              whitespace-nowrap
            "
          >
            {legalLinkKeys.map((link) => (
              <a
                key={link.labelKey}
                href={link.href}
                className="
                  transition-colors
                  duration-150
                  hover:text-[#BBFF1B]
                "
              >
                {t(link.labelKey)}
              </a>
            ))}

            <LanguageSwitcher compact />
          </div>

          {/* Copyright */}
          <p className="md:text-right">
            © {new Date().getFullYear()} {siteConfig.name}.{' '}
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}