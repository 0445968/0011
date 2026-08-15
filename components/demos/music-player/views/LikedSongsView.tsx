'use client';

import { Heart, Play, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PlayerState } from '../usePlayer';
import type { View, DetailTarget } from '../EchoApp';
import { TrackRow } from '../TrackRow';
import { getTracks, getAlbum } from '../usePlayer';
import { formatDuration } from '../utils';
import { seedAlbums } from '@/data/demos/music-player';

interface Props {
  player: PlayerState;
  navigate: (v: View, target?: DetailTarget) => void;
}

export function LikedSongsView({ player }: Props) {
  const likedTracks = player.tracks.filter((t) => t.liked);
  const totalDuration = likedTracks.reduce((s, t) => s + t.duration, 0);

  const playAll = () => {
    if (likedTracks.length === 0) return;
    player.playTrackList(
      likedTracks.map((t) => t.id),
      0,
      { id: 'liked', trackIds: likedTracks.map((t) => t.id), title: 'Liked Songs', subtitle: '', artwork: '', accent: '#ec4899' }
    );
  };

  const shuffleAll = () => {
    if (likedTracks.length === 0) return;
    const shuffled = [...likedTracks].sort(() => Math.random() - 0.5);
    player.playTrackList(
      shuffled.map((t) => t.id),
      0,
      { id: 'liked', trackIds: shuffled.map((t) => t.id), title: 'Liked Songs', subtitle: '', artwork: '', accent: '#ec4899' }
    );
  };

  return (
    <div className="px-4 pt-4 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex flex-col gap-4 bg-gradient-to-br from-[#ec4899]/30 to-[#6366f1]/20 p-6 rounded-2xl sm:flex-row sm:items-end"
      >
        <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#ec4899] to-[#6366f1] shadow-xl">
          <Heart size={48} className="fill-white text-white" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Playlist</p>
          <h1 className="mt-1 text-3xl font-bold text-white sm:text-4xl">Liked Songs</h1>
          <p className="mt-2 text-sm text-white/60">
            {likedTracks.length} song{likedTracks.length !== 1 ? 's' : ''} · {formatDuration(totalDuration)}
          </p>
        </div>
      </motion.div>

      {/* Actions */}
      {likedTracks.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={playAll}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1db954] text-black transition-transform hover:scale-105"
            aria-label="Play all"
          >
            <Play size={22} className="ml-0.5 fill-current" />
          </button>
          <button
            onClick={shuffleAll}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#a1a1aa] transition-colors hover:text-white"
            aria-label="Shuffle"
          >
            <Shuffle size={20} />
          </button>
        </div>
      )}

      {/* Track list */}
      {likedTracks.length > 0 ? (
        <div className="space-y-0.5">
          {likedTracks.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              player={player}
              onPlay={() => {
                player.playTrackList(
                  likedTracks.map((tk) => tk.id),
                  i,
                  { id: 'liked', trackIds: likedTracks.map((tk) => tk.id), title: 'Liked Songs', subtitle: '', artwork: '', accent: '#ec4899' }
                );
              }}
              showArtist
              showAlbum
              albumArtwork={getAlbum(t.albumId)?.artwork}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
            <Heart size={32} className="text-[#71717a]" />
          </div>
          <h2 className="text-lg font-semibold text-white">Songs you like will appear here</h2>
          <p className="mt-2 text-sm text-[#71717a]">
            Save songs by tapping the heart icon on any track.
          </p>
        </div>
      )}
    </div>
  );
}
