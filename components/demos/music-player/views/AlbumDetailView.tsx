'use client';

import { Play, Shuffle, Heart, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PlayerState } from '../usePlayer';
import { getAlbum, getTracks, albumDuration } from '../usePlayer';
import type { View, DetailTarget } from '../EchoApp';
import { TrackRow } from '../TrackRow';
import { formatDuration } from '../utils';

interface Props {
  player: PlayerState;
  albumId: string;
  navigate: (v: View, target?: DetailTarget) => void;
}

export function AlbumDetailView({ player, albumId, navigate }: Props) {
  const album = getAlbum(albumId);
  if (!album) return <div className="p-8 text-center text-[#71717a]">Album not found</div>;

  const tracks = getTracks(album.trackIds);
  const totalDur = albumDuration(album.trackIds);

  const playAlbum = (startIdx = 0) => {
    player.playPlayable(
      { id: album.id, trackIds: album.trackIds, title: album.title, subtitle: album.artistName, artwork: album.artwork, accent: album.accent },
      album.trackIds[startIdx]
    );
  };

  const shuffleAlbum = () => {
    const shuffled = [...album.trackIds].sort(() => Math.random() - 0.5);
    player.playPlayable(
      { id: album.id, trackIds: shuffled, title: album.title, subtitle: album.artistName, artwork: album.artwork, accent: album.accent },
      shuffled[0]
    );
  };

  return (
    <div>
      {/* Hero header with accent gradient */}
      <div
        className="px-4 pt-6 pb-6 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(180deg, ${album.accent}40, transparent)` }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-5 sm:flex-row sm:items-end"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={album.artwork}
            alt={album.title}
            className="h-40 w-40 rounded-lg shadow-2xl sm:h-52 sm:w-52"
          />
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Album</p>
            <h1 className="mt-1 text-3xl font-bold text-white sm:text-5xl">{album.title}</h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm text-white/60 sm:justify-start">
              <button
                onClick={() => navigate('artist', { type: 'artist', id: album.artistId })}
                className="font-medium text-white hover:underline"
              >
                {album.artistName}
              </button>
              <span>·</span>
              <span>{album.year}</span>
              <span>·</span>
              <span>{tracks.length} songs</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1">
                <Clock size={13} /> {formatDuration(totalDur)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <button
          onClick={() => playAlbum(0)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1db954] text-black transition-transform hover:scale-105"
          aria-label="Play album"
        >
          <Play size={22} className="ml-0.5 fill-current" />
        </button>
        <button
          onClick={shuffleAlbum}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#a1a1aa] transition-colors hover:text-white"
          aria-label="Shuffle"
        >
          <Shuffle size={20} />
        </button>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#a1a1aa] transition-colors hover:text-white"
          aria-label="Save album"
        >
          <Heart size={20} />
        </button>
      </div>

      {/* Track list */}
      <div className="px-2 pb-6 sm:px-4 lg:px-6">
        {/* Header row (desktop) */}
        <div className="hidden grid-cols-[28px_1fr_1fr_56px] gap-2 border-b border-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#71717a] sm:grid">
          <span>#</span>
          <span>Title</span>
          <span>Album</span>
          <span className="text-right">
            <Clock size={14} className="ml-auto" />
          </span>
        </div>
        <div className="space-y-0.5">
          {tracks.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              player={player}
              onPlay={() => playAlbum(i)}
              showAlbum
            />
          ))}
        </div>
      </div>
    </div>
  );
}
