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

  /* ============================================================ */
  /* Get actual carousel cards                                    */
  /* ============================================================ */

  const getCards = useCallback(() => {
    const container = containerRef.current;

    if (!container) {
      return [];
    }

    return Array.from(
      container.querySelectorAll<HTMLElement>(
        '[data-carousel-card]'
      )
    );
  }, []);

  /* ============================================================ */
  /* Find card closest to left edge                               */
  /* ============================================================ */

  const getCurrentIndex = useCallback(() => {
    const container = containerRef.current;
    const cards = getCards();

    if (!container || cards.length === 0) {
      return 0;
    }

    const scrollLeft = container.scrollLeft;

    let closestIndex = 0;
    let closestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(
        card.offsetLeft - scrollLeft
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  }, [getCards]);

  /* ============================================================ */
  /* Update state                                                 */
  /* ============================================================ */

  const updateScrollState = useCallback(() => {
    const container = containerRef.current;
    const cards = getCards();

    if (!container || cards.length === 0) {
      return;
    }

    const index = getCurrentIndex();

    setCurrentPage(index);
    setPageCount(cards.length);

    setCanScrollPrevious(index > 0);

    const maxScrollLeft =
      container.scrollWidth -
      container.clientWidth;

    setCanScrollNext(
      container.scrollLeft <
        maxScrollLeft - 4
    );
  }, [
    getCards,
    getCurrentIndex,
  ]);

  /* ============================================================ */
  /* Scroll directly to a card                                    */
  /* ============================================================ */

  const scrollToPage = useCallback(
    (index: number) => {
      const container = containerRef.current;
      const cards = getCards();

      if (
        !container ||
        cards.length === 0
      ) {
        return;
      }

      const safeIndex = Math.max(
        0,
        Math.min(
          index,
          cards.length - 1
        )
      );

      const card = cards[safeIndex];

      container.scrollTo({
        left: card.offsetLeft,
        behavior: 'smooth',
      });
    },
    [getCards]
  );

  /* ============================================================ */
  /* Previous                                                     */
  /* ============================================================ */

  const scrollPrevious = useCallback(() => {
    const index = getCurrentIndex();

    scrollToPage(index - 1);
  }, [
    getCurrentIndex,
    scrollToPage,
  ]);

  /* ============================================================ */
  /* Next                                                         */
  /* ============================================================ */

  const scrollNext = useCallback(() => {
    const index = getCurrentIndex();

    scrollToPage(index + 1);
  }, [
    getCurrentIndex,
    scrollToPage,
  ]);

  /* ============================================================ */
  /* Events                                                       */
  /* ============================================================ */

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      updateScrollState();
    };

    const resizeObserver =
      new ResizeObserver(() => {
        updateScrollState();
      });

    resizeObserver.observe(container);

    updateScrollState();

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