'use client';

import { motion } from 'framer-motion';

interface BrowserFrameProps {
  preview: {
    type: 'image' | 'video';
    src: string;
    poster?: string;
  };
  title: string;
}

export function BrowserFrame({
  preview,
  title,
}: BrowserFrameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="overflow-hidden rounded-3xl border border-border bg-card"
    >

      {/* Browser Header */}

      <div className="flex items-center gap-2 border-b border-border px-5 py-4">

        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />

      </div>


      {/* Preview */}

      <div className="aspect-[16/10] overflow-hidden bg-secondary">

        {preview.type === 'video' ? (

          <video
            key={preview.src}
            src={preview.src}
            poster={preview.poster}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />

        ) : (

          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview.src}
            alt={title}
            className="h-full w-full object-cover transition duration-700 hover:scale-105"
          />

        )}

      </div>

    </motion.div>
  );
}