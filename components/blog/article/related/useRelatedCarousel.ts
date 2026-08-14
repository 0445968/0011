'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

interface RelatedCarouselState {
  visibleCount: number;
  scrollByCount: number;
}

function getCarouselState(
  width: number
): RelatedCarouselState {
  if (width >= 1280) {
    return {
      visibleCount: 4,
      scrollByCount: 3,
    };
  }

  if (width >= 1024) {
    return {
      visibleCount: 3,
      scrollByCount: 2,
    };
  }

  if (width >= 640) {
    return {
      visibleCount: 2,
      scrollByCount: 2,
    };
  }

  return {
    visibleCount: 1,
    scrollByCount: 1,
  };
}

export function useRelatedCarousel(
  itemCount: number
) {
  const viewportRef =
    useRef<HTMLDivElement>(null);

  const [visibleCount, setVisibleCount] =
    useState(4);

  const [
    scrollByCount,
    setScrollByCount,
  ] = useState(3);

  const [canScrollPrevious, setCanScrollPrevious] =
    useState(false);

  const [canScrollNext, setCanScrollNext] =
    useState(itemCount > 4);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  /* =========================================================
     RESPONSIVE SETTINGS
  ========================================================= */

  useEffect(() => {
    function updateSettings() {
      const state = getCarouselState(
        window.innerWidth
      );

      setVisibleCount(
        state.visibleCount
      );

      setScrollByCount(
        state.scrollByCount
      );
    }

    updateSettings();

    window.addEventListener(
      'resize',
      updateSettings
    );

    return () => {
      window.removeEventListener(
        'resize',
        updateSettings
      );
    };
  }, []);

  /* =========================================================
     FIND CARD WIDTH
  ========================================================= */

  const getScrollDistance =
    useCallback(() => {
      const viewport =
        viewportRef.current;

      if (!viewport) {
        return 0;
      }

      const firstCard =
        viewport.querySelector<HTMLElement>(
          '[data-related-card]'
        );

      if (!firstCard) {
        return 0;
      }

      const secondCard =
        firstCard.nextElementSibling as
          | HTMLElement
          | null;

      if (secondCard) {
        return (
          secondCard.offsetLeft -
          firstCard.offsetLeft
        );
      }

      return firstCard.offsetWidth;
    }, []);

  /* =========================================================
     UPDATE POSITION
  ========================================================= */

  const updateScrollState =
    useCallback(() => {
      const viewport =
        viewportRef.current;

      if (!viewport) {
        return;
      }

      const {
        scrollLeft,
        scrollWidth,
        clientWidth,
      } = viewport;

      const maxScroll =
        scrollWidth - clientWidth;

      setCanScrollPrevious(
        scrollLeft > 4
      );

      setCanScrollNext(
        scrollLeft < maxScroll - 4
      );

      const cardDistance =
        getScrollDistance();

      if (cardDistance <= 0) {
        setCurrentIndex(0);
        return;
      }

      const nextIndex = Math.round(
        scrollLeft / cardDistance
      );

      setCurrentIndex(
        Math.max(
          0,
          Math.min(
            nextIndex,
            Math.max(
              0,
              itemCount - 1
            )
          )
        )
      );
    }, [
      getScrollDistance,
      itemCount,
    ]);

  /* =========================================================
     SCROLL EVENT
  ========================================================= */

  useEffect(() => {
    const viewport =
      viewportRef.current;

    if (!viewport) {
      return;
    }

    updateScrollState();

    viewport.addEventListener(
      'scroll',
      updateScrollState,
      {
        passive: true,
      }
    );

    const resizeObserver =
      new ResizeObserver(() => {
        updateScrollState();
      });

    resizeObserver.observe(viewport);

    return () => {
      viewport.removeEventListener(
        'scroll',
        updateScrollState
      );

      resizeObserver.disconnect();
    };
  }, [
    updateScrollState,
    visibleCount,
    itemCount,
  ]);

  /* =========================================================
     SCROLL FUNCTIONS
  ========================================================= */

  const scrollPrevious =
    useCallback(() => {
      const viewport =
        viewportRef.current;

      if (!viewport) {
        return;
      }

      const cardDistance =
        getScrollDistance();

      if (!cardDistance) {
        return;
      }

      viewport.scrollBy({
        left:
          -cardDistance *
          scrollByCount,
        behavior: 'smooth',
      });
    }, [
      getScrollDistance,
      scrollByCount,
    ]);

  const scrollNext =
    useCallback(() => {
      const viewport =
        viewportRef.current;

      if (!viewport) {
        return;
      }

      const cardDistance =
        getScrollDistance();

      if (!cardDistance) {
        return;
      }

      viewport.scrollBy({
        left:
          cardDistance *
          scrollByCount,
        behavior: 'smooth',
      });
    }, [
      getScrollDistance,
      scrollByCount,
    ]);

  /* =========================================================
     OPTIONAL DIRECT INDEX SCROLL
  ========================================================= */

  const scrollToIndex =
    useCallback(
      (index: number) => {
        const viewport =
          viewportRef.current;

        if (!viewport) {
          return;
        }

        const cardDistance =
          getScrollDistance();

        if (!cardDistance) {
          return;
        }

        const targetIndex =
          Math.max(
            0,
            Math.min(
              index,
              Math.max(
                0,
                itemCount - 1
              )
            )
          );

        viewport.scrollTo({
          left:
            cardDistance *
            targetIndex,
          behavior: 'smooth',
        });
      },
      [
        getScrollDistance,
        itemCount,
      ]
    );

  return {
    viewportRef,

    visibleCount,
    scrollByCount,

    currentIndex,

    canScrollPrevious,
    canScrollNext,

    scrollPrevious,
    scrollNext,
    scrollToIndex,
  };
}