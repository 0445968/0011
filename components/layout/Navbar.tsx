'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { navSections } from '@/data/site';

import { SearchCommand } from './SearchCommand';
import { NavbarSettings } from './settings/NavbarSettings';
import { NavbarMenu } from './NavbarMenu';
import { MegaMenu } from './MegaMenu';

import { useI18n } from '@/lib/i18n/context';


export function Navbar() {
  const { t } = useI18n();

  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);


  const megaOpen =
    Boolean(activeMega) || searchOpen;


  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    onScroll();

    window.addEventListener(
      'scroll',
      onScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        'scroll',
        onScroll
      );
    };

  }, []);



  useEffect(() => {
    document.body.style.overflow =
      open ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };

  }, [open]);



  const openMega = (id: string) => {

    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    setSearchOpen(false);
    setActiveMega(id);

  };



  const closeMega = () => {

    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
    }

    setActiveMega(null);

  };



  const handleNav = () => {
    setOpen(false);
    setActiveMega(null);
  };



  return (
    <>
      {/* Background blur */}
      {megaOpen && (
        <div
          className="
            fixed
            inset-0
            z-40
            bg-black/30
            backdrop-blur-sm
          "
          onMouseEnter={() => {

            if (searchOpen) {
              setSearchOpen(false);
            }

            if (activeMega) {
              closeMega();
            }

          }}
        />
      )}



      <motion.header

        initial={{
          y: -80,
          opacity: 0,
        }}

        animate={{
          y: 0,
          opacity: 1,
        }}

        transition={{
          duration: 0.7,
          ease: [0.16,1,0.3,1],
          delay: 0.1,
        }}


        className={cn(
          `
          fixed
          inset-x-0
          top-0
          z-50
          transition-colors
          duration-500
          `,

          scrolled || activeMega || open
            ? `
              border-b
              border-border/60
              bg-background/100
              backdrop-blur-xl
            `
            : `
              border-b
              border-transparent
            `
        )}

      >

        <nav
          className="
            container-page
            flex
            h-16
            items-center
            justify-between
            md:h-20
          "
        >

          {/* Logo */}
          <a
            href="/"
            className="group flex items-center"
            aria-label="Design Blade home"
          >

            <Image
              src="/images/logo.png"
              alt="Design Blade"
              width={180}
              height={60}
              priority
              className="
                h-auto
                w-[70px]
                transition-opacity
                duration-300
                group-hover:opacity-80
              "
            />

          </a>



          {/* Desktop navigation */}
          <NavbarMenu
            activeMega={activeMega}
            onHover={(id) => {
              openMega(id);
            }}
          />



          {/* Desktop utilities */}
          <div
            className="
              hidden
              items-center
              gap-3
              lg:flex
            "
          >

            <SearchCommand
              open={searchOpen}
              setOpen={setSearchOpen}
              onOpen={() =>
                setActiveMega(null)
              }
            />


            <NavbarSettings
              onOpen={() =>
                setActiveMega(null)
              }
            />


            <a
              href="/contact"
              className="
                rounded-full
                bg-primary
                px-5
                py-2.5
                text-sm
                font-medium
                text-primary-foreground
                transition-transform
                duration-300
                hover:scale-[1.03]
                active:scale-95
              "
            >
              {t('nav.startProject')}
            </a>

          </div>




          {/* Mobile utilities */}
          <div
            className="
              flex
              items-center
              gap-2
              lg:hidden
            "
          >

            <SearchCommand
              open={searchOpen}
              setOpen={setSearchOpen}
              onOpen={() =>
                setActiveMega(null)
              }
            />


            <NavbarSettings
              onOpen={() =>
                setActiveMega(null)
              }
            />



            <button
              onClick={() =>
                setOpen((value) => !value)
              }

              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-lg
                text-foreground
              "
            >

              {open
                ? <X size={20}/>
                : <Menu size={20}/>
              }

            </button>

          </div>


        </nav>




        {/* Desktop Mega Menu */}
        <MegaMenu
          activeMega={activeMega}
          closeTimer={closeTimer}
          handleNav={handleNav}
          onClose={closeMega}
        />





        {/* Mobile menu */}
        <AnimatePresence>

          {open && (

            <motion.div

              initial={{
                opacity:0,
                height:0,
              }}

              animate={{
                opacity:1,
                height:'auto',
              }}

              exit={{
                opacity:0,
                height:0,
              }}

              transition={{
                duration:0.3,
                ease:[0.16,1,0.3,1],
              }}

              className="
                hidden
                relative
                z-40
                border-t
                border-border
                bg-background/95
                backdrop-blur-xl
                lg:block
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

                {navSections.map((link) => (

                  <a
                    key={link.id}
                    href={link.href}
                    onClick={handleNav}
                    className="
                      block
                      rounded-lg
                      px-4
                      py-3
                      text-base
                      font-medium
                      text-muted-foreground
                      transition-colors
                      hover:bg-muted
                      hover:text-foreground
                    "
                  >
                    {t(`nav.${link.id}`)}
                  </a>

                ))}



                <a
                  href="/contact"
                  onClick={handleNav}
                  className="
                    mt-3
                    block
                    rounded-lg
                    bg-primary
                    px-4
                    py-3
                    text-center
                    text-base
                    font-medium
                    text-primary-foreground
                  "
                >
                  {t('nav.startProject')}
                </a>


              </div>

            </motion.div>

          )}

        </AnimatePresence>


      </motion.header>

    </>
  );
}