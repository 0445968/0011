'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Mail } from 'lucide-react';
import { socialLinks, contactInfo, siteConfig } from '@/data/site';
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
      { labelKey: 'footer.contact', href: '/contact' },
      { labelKey: 'footer.faq', href: '/faq' },
      { labelKey: 'footer.careers', href: '/careers' },
    ],
  },
  {
    titleKey: 'footer.resources',
    links: [
      { labelKey: 'footer.portfolio', href: '/portfolio' },
      { labelKey: 'footer.blog', href: '/blog' },
      { labelKey: 'footer.guides', href: '/guides' },
      { labelKey: 'footer.inspiration', href: '/inspiration' },
      { labelKey: 'footer.freeResources', href: '/resources' },
    ],
  },
  {
    titleKey: 'footer.solutions',
    links: [
      { labelKey: 'nav.services', href: '/services' },
      { labelKey: 'footer.webDesign', href: '/services/web-design' },
      { labelKey: 'footer.brandSystems', href: '/services/branding' },
      { labelKey: 'footer.development', href: '/services/development' },
      { labelKey: 'footer.creativeStrategy', href: '/services/strategy' },
    ],
  },
  {
    titleKey: 'footer.tools',
    links: [
      { labelKey: 'footer.templates', href: '/templates' },
      { labelKey: 'footer.uiKits', href: '/kits' },
      { labelKey: 'footer.designTools', href: '/tools' },
      { labelKey: 'footer.resourcesLibrary', href: '/library' },
    ],
  },
];

const legalLinkKeys = [
  { labelKey: 'footer.privacy', href: '/privacy' },
  { labelKey: 'footer.terms', href: '/terms' },
  { labelKey: 'footer.cookiePrefs', href: '#' },
  { labelKey: 'footer.accessibility', href: '/accessibility' },
];

export function Footer() {
  const { t } = useI18n();
  const [time, setTime] = useState('');

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
    <footer className="relative bg-primary text-white">

      <div className="container-page py-20 md:py-28">

        {/* Footer Hero */}
        <div className="max-w-5xl">

          <h2
            className="
              font-serif
              text-5xl
              font-semibold
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


        {/* Footer Content */}
        <div className="mt-16 grid gap-12 lg:grid-cols-12">


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
                  duration-300
                  hover:text-secondary
                "
              >

                <Mail
                  size={18}
                  className="text-secondary"
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
              aria-label="Design Blade home"
            >

              <img
                src="/images/logo.png"
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
                  hover:text-[secondary]
                "
              >
                {t(link.labelKey)}
              </a>

            ))}


            <LanguageSwitcher compact />

          </div>



          {/* Copyright */}
          <p className="md:text-right">

            © {new Date().getFullYear()} {siteConfig.name}. {t('footer.rights')}

          </p>


        </div>


      </div>

    </footer>
  );
}