'use client';

import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface CardProps {
  artwork: string;
  title: string;
  subtitle: string;
  onClick: () => void;
  onPlay?: () => void;
  accent?: string;
  className?: string;
}

export function MediaCard({ artwork, title, subtitle, onClick, onPlay, className }: CardProps) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className={`group flex flex-col rounded-lg p-3 text-left transition-colors hover:bg-white/5 ${className ?? ''}`}
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artwork} alt={title} className="h-full w-full object-cover" />
        {onPlay && (
          <div
            className="absolute bottom-2 right-2 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-[#1db954] opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); onPlay(); }}
          >
            <Play size={18} className="ml-0.5 fill-black text-black" />
          </div>
        )}
      </div>
      <p className="truncate text-sm font-medium text-white">{title}</p>
      <p className="mt-0.5 line-clamp-2 text-xs text-[#a1a1aa]">{subtitle}</p>
    </motion.button>
  );
}
