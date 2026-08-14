'use client';

import { AnimatePresence, motion } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward, Heart, ChevronDown,
  ListMusic, Shuffle, Repeat, Repeat1, Volume2, VolumeX, Volume1,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { PlayerState } from './usePlayer';
import { getAlbum } from './usePlayer';
import { formatTime } from './utils';
import { ProgressBar } from './PlaybackBar';
import { Visualizer } from './Visualizer';

interface Props {
  player: PlayerState;
  open: boolean;
  onClose: () => void;
  onOpenQueue: () => void;
}

export function NowPlayingView({ player, open, onClose, onOpenQueue }: Props) {
  const { currentTrack, isPlaying, progress, volume, muted, shuffle, repeat } = player;
  const album = currentTrack ? getAlbum(currentTrack.albumId) : null;
  const accent = album?.accent ?? '#6366f1';
  const [showLyrics, setShowLyrics] = useState(false);

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  // Current lyric line
  const lyrics = currentTrack?.lyrics ?? [];
  const currentLyricIndex = lyrics.findLastIndex((l) => l.time <= progress);

  return (
    <AnimatePresence>
      {open && currentTrack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[95] overflow-y-auto"
        >
          {/* Dynamic background */}
          <div className="absolute inset-0" style={{ backgroundColor: '#0a0a0c' }}>
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background: `radial-gradient(ellipse at top, ${accent}40, transparent 70%), radial-gradient(ellipse at bottom, ${accent}20, transparent 60%)`,
              }}
            />
            {/* Blurred artwork */}
            {album && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={album.artwork}
                alt=""
                className="absolute inset-0 h-full w-full scale-125 object-cover opacity-20 blur-3xl"
              />
            )}
          </div>

          {/* Content */}
          <div className="relative flex min-h-full flex-col">
            {/* Top bar */}
            <div className="flex items-center justify-between p-4">
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
                aria-label="Close now playing"
              >
                <ChevronDown size={22} />
              </button>
              <div className="text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-white/50">Playing from</p>
                <p className="text-sm font-semibold text-white">{album?.title ?? ''}</p>
              </div>
              <button
                onClick={onOpenQueue}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
                aria-label="Open queue"
              >
                <ListMusic size={18} />
              </button>
            </div>

            {/* Main content */}
            <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8">
              {/* Artwork */}
              <motion.div
                key={currentTrack.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-8 aspect-square w-full max-w-sm overflow-hidden rounded-xl shadow-2xl sm:max-w-md"
              >
                {album && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={album.artwork} alt={album.title} className="h-full w-full object-cover" />
                )}
              </motion.div>

              {/* Track info + like */}
              <div className="mb-6 flex w-full max-w-md items-center justify-between">
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-bold text-white">{currentTrack.title}</h1>
                  <p className="mt-1 truncate text-base text-white/60">{currentTrack.artistName}</p>
                </div>
                <button
                  onClick={() => player.toggleLike(currentTrack.id)}
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
                    currentTrack.liked ? 'text-[#1db954]' : 'text-white/60 hover:text-white'
                  )}
                  aria-label={currentTrack.liked ? 'Unlike' : 'Like'}
                >
                  <Heart size={22} fill={currentTrack.liked ? 'currentColor' : 'none'} />
                </button>
              </div>

              {/* Progress bar */}
              <div className="mb-4 w-full max-w-md">
                <div className="flex items-center gap-2">
                  <span className="w-10 text-right text-xs tabular-nums text-white/50">{formatTime(progress)}</span>
                  <ProgressBar value={progress} max={currentTrack.duration} accent={accent} onChange={player.seek} />
                  <span className="w-10 text-xs tabular-nums text-white/50">{formatTime(currentTrack.duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="mb-6 flex w-full max-w-md items-center justify-between">
                <button
                  onClick={player.toggleShuffle}
                  className={cn('p-2 transition-colors', shuffle ? 'text-[#1db954]' : 'text-white/60 hover:text-white')}
                  aria-label="Shuffle"
                >
                  <Shuffle size={20} />
                </button>
                <button
                  onClick={player.previous}
                  className="p-2 text-white/80 transition-colors hover:text-white"
                  aria-label="Previous track"
                >
                  <SkipBack size={28} className="fill-current" />
                </button>
                <button
                  onClick={player.togglePlay}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105"
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause size={28} className="fill-current" />
                  ) : (
                    <Play size={28} className="ml-1 fill-current" />
                  )}
                </button>
                <button
                  onClick={player.next}
                  className="p-2 text-white/80 transition-colors hover:text-white"
                  aria-label="Next track"
                >
                  <SkipForward size={28} className="fill-current" />
                </button>
                <button
                  onClick={player.cycleRepeat}
                  className={cn('p-2 transition-colors', repeat !== 'off' ? 'text-[#1db954]' : 'text-white/60 hover:text-white')}
                  aria-label={`Repeat: ${repeat}`}
                >
                  <RepeatIcon size={20} />
                </button>
              </div>

              {/* Volume */}
              <div className="mb-6 flex w-full max-w-xs items-center gap-2">
                <button
                  onClick={player.toggleMute}
                  className="text-white/60 transition-colors hover:text-white"
                  aria-label={muted ? 'Unmute' : 'Mute'}
                >
                  <VolumeIcon size={18} />
                </button>
                <input
                  type="range" min={0} max={1} step={0.01}
                  value={muted ? 0 : player.volumeRaw}
                  onChange={(e) => player.setVolume(Number(e.target.value))}
                  className="echo-slider flex-1"
                  aria-label="Volume"
                />
              </div>

              {/* Lyrics / Visualizer toggle */}
              {lyrics.length > 0 && (
                <div className="w-full max-w-md">
                  <button
                    onClick={() => setShowLyrics((v) => !v)}
                    className="mb-3 text-sm font-medium text-white/60 transition-colors hover:text-white"
                  >
                    {showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
                  </button>

                  {showLyrics ? (
                    <div className="max-h-40 overflow-y-auto rounded-lg bg-white/5 p-4">
                      {lyrics.map((line, i) => (
                        <p
                          key={i}
                          className={cn(
                            'py-1 text-sm transition-colors',
                            i === currentLyricIndex ? 'font-semibold text-white' : 'text-white/40'
                          )}
                        >
                          {line.text}
                        </p>
                      ))}
                      <p className="mt-3 text-xs text-white/30">
                        Fictional demo lyrics — not real song content.
                      </p>
                    </div>
                  ) : (
                    <Visualizer playing={isPlaying} accent={accent} />
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
