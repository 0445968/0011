'use client';

import {
  useEffect,
  useState,
} from 'react';

import {
  ArrowUp,
} from 'lucide-react';

export function BackToTopButton() {
  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(
        window.scrollY > 500
      );
    };

    window.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      }
    );

    handleScroll();

    return () => {
      window.removeEventListener(
        'scroll',
        handleScroll
      );
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={scrollToTop}
      className={`
        fixed
        bottom-6
        right-6
        z-50
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        bg-white
        text-black
        shadow-lg
        transition-all
        duration-300
        hover:scale-105
        hover:bg-[#BBFF1B]
        sm:bottom-8
        sm:right-8

        ${
          visible
            ? `
                pointer-events-auto
                translate-y-0
                opacity-100
              `
            : `
                pointer-events-none
                translate-y-3
                opacity-0
              `
        }
      `}
    >
      <ArrowUp
        className="
          h-5
          w-5
        "
      />
    </button>
  );
}