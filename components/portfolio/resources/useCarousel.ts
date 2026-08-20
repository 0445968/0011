'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export function useCarousel() {
  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const [canScrollPrevious, setCanScrollPrevious] =
    useState(false);

  const [canScrollNext, setCanScrollNext] =
    useState(true);

  const [currentPage, setCurrentPage] =
    useState(0);

  const [pageCount, setPageCount] =
    useState(1);

  const getCarouselMeasurements = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return {
        visibleCount: 1,
        totalCards: 0,
        gap: 0,
        cardWidth: 0,
      };
    }

    const cards = Array.from(
      container.children
    ) as HTMLElement[];

    const firstCard = cards[0];

    if (!firstCard) {
      return {
        visibleCount: 1,
        totalCards: 0,
        gap: 0,
        cardWidth: 0,
      };
    }

    const cardWidth =
      firstCard.getBoundingClientRect().width;

    const gap = Number.parseFloat(
      getComputedStyle(container).gap || '0'
    );

    const visibleCount = Math.max(
      1,
      Math.round(
        (container.clientWidth + gap) /
          (cardWidth + gap)
      )
    );

    return {
      visibleCount,
      totalCards: cards.length,
      gap,
      cardWidth,
    };
  }, []);

  const updateScrollState = useCallback(() => {
    const container = containerRef.current;

    if (!container) return;

    const {
      scrollLeft,
      scrollWidth,
      clientWidth,
    } = container;

    const {
      visibleCount,
      totalCards,
      cardWidth,
      gap,
    } = getCarouselMeasurements();

    const calculatedPageCount = Math.max(
      1,
      Math.ceil(totalCards / visibleCount)
    );

    setPageCount(calculatedPageCount);

    setCanScrollPrevious(scrollLeft > 8);

    setCanScrollNext(
      scrollLeft + clientWidth <
        scrollWidth - 8
    );

    const pageWidth =
      (cardWidth + gap) * visibleCount;

    if (pageWidth > 0) {
      const page = Math.min(
        calculatedPageCount - 1,
        Math.max(
          0,
          Math.round(scrollLeft / pageWidth)
        )
      );

      setCurrentPage(page);
    }
  }, [getCarouselMeasurements]);

  const scrollToPage = useCallback(
    (page: number) => {
      const container = containerRef.current;

      if (!container) return;

      const {
        visibleCount,
        cardWidth,
        gap,
      } = getCarouselMeasurements();

      const target =
        page *
        visibleCount *
        (cardWidth + gap);

      container.scrollTo({
        left: target,
        behavior: 'smooth',
      });
    },
    [getCarouselMeasurements]
  );

  const scrollNext = useCallback(() => {
    scrollToPage(
      Math.min(currentPage + 1, pageCount - 1)
    );
  }, [
    currentPage,
    pageCount,
    scrollToPage,
  ]);

  const scrollPrevious = useCallback(() => {
    scrollToPage(
      Math.max(currentPage - 1, 0)
    );
  }, [
    currentPage,
    scrollToPage,
  ]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    updateScrollState();

    const handleScroll = () => {
      updateScrollState();
    };

    const resizeObserver =
      new ResizeObserver(() => {
        updateScrollState();
      });

    resizeObserver.observe(container);

    container.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      resizeObserver.disconnect();

      container.removeEventListener(
        'scroll',
        handleScroll
      );
    };
  }, [updateScrollState]);

  return {
    containerRef,
    scrollNext,
    scrollPrevious,
    scrollToPage,
    canScrollNext,
    canScrollPrevious,
    currentPage,
    pageCount,
  };
}