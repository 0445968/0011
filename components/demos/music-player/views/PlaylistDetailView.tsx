'use client';

import { Play, Shuffle, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PlayerState } from '../usePlayer';
import { getPlaylist, getTracks } from '../usePlayer';
import type { View, DetailTarget } from '../EchoApp';
import { TrackRow } from '../TrackRow';
import { formatDuration } from '../utils';

interface Props {
  player: PlayerState;
  playlistId: string;
  navigate: (v: View, target?: DetailTarget) => void;
}

export function PlaylistDetailView({ player, playlistId }: Props) {
  const playlist = getPlaylist(playlistId);
  if (!playlist) return <div className="p-8 text-center text-[#71717a]">Playlist not found</div>;

  const tracks = getTracks(playlist.trackIds);
  const totalDur = tracks.reduce((s, t) => s + t.duration, 0);

  const playPlaylist = (startIdx = 0) => {
    player.playPlayable(
      { id: playlist.id, trackIds: playlist.trackIds, title: playlist.title, subtitle: playlist.description, artwork: playlist.artwork, accent: playlist.accent },
      playlist.trackIds[startIdx]
    );
  };

  const shufflePlaylist = () => {
    const shuffled = [...playlist.trackIds].sort(() => Math.random() - 0.5);
    player.playPlayable(
      { id: playlist.id, trackIds: shuffled, title: playlist.title, subtitle: playlist.description, artwork: playlist.artwork, accent: playlist.accent },
      shuffled[0]
    );
  };

  return (
    <div>
      {/* Hero header */}
      <div
        className="px-4 pt-6 pb-6 sm:px-6 lg:px-8"
        style={{ background: `linear-gradient(180deg, ${playlist.accent}40, transparent)` }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-5 sm:flex-row sm:items-end"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={playlist.artwork} alt={playlist.title} className="h-40 w-40 rounded-lg shadow-2xl sm:h-52 sm:w-52" />
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Playlist</p>
            <h1 className="mt-1 text-3xl font-bold text-white sm:text-5xl">{playlist.title}</h1>
            <p className="mt-2 text-sm text-white/60">{playlist.description}</p>
            <p className="mt-1 text-sm text-white/50">
              {tracks.length} songs · {formatDuration(totalDur)}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <button
          onClick={() => playPlaylist(0)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1db954] text-black transition-transform hover:scale-105"
          aria-label="Play playlist"
        >
          <Play size={22} className="ml-0.5 fill-current" />
        </button>
        <button
          onClick={shufflePlaylist}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#a1a1aa] transition-colors hover:text-white"
          aria-label="Shuffle"
        >
          <Shuffle size={20} />
        </button>
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#a1a1aa] transition-colors hover:text-white"
          aria-label="Like playlist"
        >
          <Heart size={20} />
        </button>
      </div>

      {/* Track list */}
      <div className="px-2 pb-6 sm:px-4 lg:px-6">
        <div className="space-y-0.5">
          {tracks.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              player={player}
              onPlay={() => playPlaylist(i)}
              showArtist
              albumArtwork={undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
