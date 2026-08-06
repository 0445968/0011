'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

export function useCarousel() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [canScrollPrevious, setCanScrollPrevious] =
    useState(false);

  const [canScrollNext, setCanScrollNext] =
    useState(true);

  const updateScrollState = useCallback(() => {
    const container = containerRef.current;

    if (!container) return;

    const {
      scrollLeft,
      scrollWidth,
      clientWidth,
    } = container;

    setCanScrollPrevious(scrollLeft > 10);

    setCanScrollNext(
      scrollLeft + clientWidth < scrollWidth - 10
    );
  }, []);

  const getScrollAmount = useCallback(() => {
    const container = containerRef.current;

    if (!container) return 0;

    const firstCard =
      container.firstElementChild as HTMLElement | null;

    if (!firstCard) return 0;

    const cardWidth = firstCard.getBoundingClientRect().width;

    const gap = Number.parseFloat(
      getComputedStyle(container).gap || '0'
    );

    // Move three cards per click
    return (cardWidth + gap) * 3;
  }, []);

  const scrollNext = useCallback(() => {
    const container = containerRef.current;

    if (!container) return;

    container.scrollBy({
      left: getScrollAmount(),
      behavior: 'smooth',
    });
  }, [getScrollAmount]);

  const scrollPrevious = useCallback(() => {
    const container = containerRef.current;

    if (!container) return;

    container.scrollBy({
      left: -getScrollAmount(),
      behavior: 'smooth',
    });
  }, [getScrollAmount]);

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
    canScrollNext,
    canScrollPrevious,
  };
}