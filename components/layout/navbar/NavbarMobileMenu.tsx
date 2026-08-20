'use client';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';

import { navSections } from '@/data/site';
import { useI18n } from '@/lib/i18n/context';

interface NavbarMobileMenuProps {
  open: boolean;
  onNavigate: () => void;
}

export function NavbarMobileMenu({
  open,
  onNavigate,
}: NavbarMobileMenuProps) {
  const { t } = useI18n();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
            height: 0,
          }}
          animate={{
            opacity: 1,
            height: 'auto',
          }}
          exit={{
            opacity: 0,
            height: 0,
          }}
          transition={{
            duration: 0.3,
            ease: [
              0.16,
              1,
              0.3,
              1,
            ],
          }}
          className="
            relative
            z-40
            border-t
            border-border
            bg-background
            lg:hidden
          "
        >
          <div
            className="
              container-page
              max-h-[80vh]
              overflow-y-auto
              py-4
            "
          >
            {navSections.map(
              (link) => (
                <a
                  key={link.id}
                  href={link.href}
                  onClick={onNavigate}
                  className="
                    block
                    rounded-lg
                    px-4
                    py-3
                    text-base
                    font-semibold
                    text-foreground
                    hover:bg-muted
                  "
                >
                  {t(
                    `nav.${link.id}`
                  )}
                </a>
              )
            )}

            {/* Get a Demo */}
            <a
              href="/demos"
              onClick={onNavigate}
              className="
                mt-3
                block
                px-4
                py-3
                text-center
                text-base
                font-semibold
                text-foreground
              "
            >
              Get a Demo
            </a>

            {/* Start a Project */}
            <a
              href="/contact"
              onClick={onNavigate}
              className="
                mt-2
                block
                rounded-[14px]
                bg-primary
                px-4
                py-3
                text-center
                text-base
                font-bold
                text-primary-foreground
              "
            >
              {t(
                'nav.startProject'
              )}
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}