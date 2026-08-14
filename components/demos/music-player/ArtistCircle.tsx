'use client';

import { Play } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  artwork: string;
  name: string;
  genre: string;
  onClick: () => void;
}

export function ArtistCircle({ artwork, name, genre, onClick }: Props) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      className="group flex flex-col items-center rounded-lg p-3 text-center transition-colors hover:bg-white/5"
    >
      <div className="relative mb-3 h-40 w-40 overflow-hidden rounded-full shadow-lg sm:h-44 sm:w-44">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artwork} alt={name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
          <Play size={28} className="fill-white text-white" />
        </div>
      </div>
      <p className="truncate text-sm font-medium text-white">{name}</p>
      <p className="mt-0.5 text-xs text-[#a1a1aa]">Artist</p>
    </motion.button>
  );
}
