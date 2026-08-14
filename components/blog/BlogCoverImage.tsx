'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { journalConfig } from '@/data/blog/journal-config';

interface BlogCoverImageProps {
  src: string;
  alt: string;

  priority?: boolean;

  sizes?: string;

  className?: string;
}

export function BlogCoverImage({
  src,
  alt,
  priority = false,
  sizes = '100vw',
  className = '',
}: BlogCoverImageProps) {
  const [imageSrc, setImageSrc] =
    useState(src);

  /*
   * Reset the source when navigating
   * between articles without a full
   * page reload.
   */
  useEffect(() => {
    setImageSrc(src);
  }, [src]);

  function handleError() {
    /*
     * Prevent an infinite loop if the
     * fallback image itself cannot load.
     */
    if (
      imageSrc ===
      journalConfig.defaultCover
    ) {
      return;
    }

    setImageSrc(
      journalConfig.defaultCover
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={handleError}
    />
  );
}