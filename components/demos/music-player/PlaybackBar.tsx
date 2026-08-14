'use client';

import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  ListMusic,
  ChevronUp,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PlayerState } from './usePlayer';
import type { RepeatMode } from './usePlayer';
import { formatTime } from './utils';
import { EqualizerBars } from './EqualizerBars';
import { getAlbum } from './usePlayer';

interface Props {
  player: PlayerState;
  onOpenQueue: () => void;
  onExpand: () => void;
}

export function PlaybackBar({ player, onOpenQueue, onExpand }: Props) {
  const { currentTrack, isPlaying, progress, volume, muted, shuffle, repeat } = player;
  const album = currentTrack ? getAlbum(currentTrack.albumId) : null;
  const accent = album?.accent ?? '#6366f1';

  const VolumeIcon = muted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const RepeatIcon = repeat === 'one' ? Repeat1 : Repeat;

  return (
    <div className="relative z-40 border-t border-white/5 bg-[#0d0d10] px-3 py-2.5 sm:px-4">
      <div className="flex items-center gap-3">
        {/* Current track info */}
        <button
          onClick={onExpand}
          disabled={!currentTrack}
          className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:opacity-50 sm:flex-none sm:w-[240px]"
        >
          {album && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={album.artwork}
              alt={album.title}
              className="h-11 w-11 shrink-0 rounded-sm object-cover sm:h-12 sm:w-12"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {currentTrack?.title ?? 'Nothing playing'}
            </p>
            <p className="truncate text-xs text-[#a1a1aa]">
              {currentTrack?.artistName ?? 'Select a track'}
            </p>
          </div>
          {currentTrack && (
            <ChevronUp size={16} className="hidden shrink-0 text-[#71717a] sm:block" />
          )}
        </button>

        {/* Center controls */}
        <div className="flex flex-1 flex-col items-center gap-1">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={player.toggleShuffle}
              className={cn(
                'hidden rounded-full p-1.5 transition-colors sm:block',
                shuffle ? 'text-[#1db954]' : 'text-[#a1a1aa] hover:text-white'
              )}
              aria-label={shuffle ? 'Disable shuffle' : 'Enable shuffle'}
              aria-pressed={shuffle}
            >
              <Shuffle size={16} />
            </button>
            <button
              onClick={player.previous}
              disabled={!currentTrack}
              className="rounded-full p-1.5 text-[#a1a1aa] transition-colors hover:text-white disabled:opacity-30"
              aria-label="Previous track"
            >
              <SkipBack size={18} className="fill-current" />
            </button>
            <button
              onClick={player.togglePlay}
              disabled={!currentTrack}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-105 disabled:opacity-30 sm:h-9 sm:w-9"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={16} className="fill-current" />
              ) : (
                <Play size={16} className="ml-0.5 fill-current" />
              )}
            </button>
            <button
              onClick={player.next}
              disabled={!currentTrack}
              className="rounded-full p-1.5 text-[#a1a1aa] transition-colors hover:text-white disabled:opacity-30"
              aria-label="Next track"
            >
              <SkipForward size={18} className="fill-current" />
            </button>
            <button
              onClick={player.cycleRepeat}
              className={cn(
                'hidden rounded-full p-1.5 transition-colors sm:block',
                repeat !== 'off' ? 'text-[#1db954]' : 'text-[#a1a1aa] hover:text-white'
              )}
              aria-label={`Repeat: ${repeat}`}
            >
              <RepeatIcon size={16} />
              {repeat !== 'off' && (
                <span className="absolute -mt-4 ml-3 text-[8px] font-bold text-[#1db954]">
                  {repeat === 'one' ? '1' : '∞'}
                </span>
              )}
            </button>
          </div>

          {/* Progress bar */}
          <div className="hidden w-full max-w-xl items-center gap-2 sm:flex">
            <span className="w-9 text-right text-[10px] tabular-nums text-[#a1a1aa]">
              {formatTime(progress)}
            </span>
            <ProgressBar
              value={progress}
              max={currentTrack?.duration ?? 0}
              accent={accent}
              onChange={player.seek}
            />
            <span className="w-9 text-[10px] tabular-nums text-[#a1a1aa]">
              {formatTime(currentTrack?.duration ?? 0)}
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="hidden items-center gap-2 sm:flex sm:w-[240px] sm:justify-end">
          <button
            onClick={() => currentTrack && player.toggleLike(currentTrack.id)}
            disabled={!currentTrack}
            className={cn(
              'rounded-full p-1.5 transition-colors disabled:opacity-30',
              currentTrack?.liked ? 'text-[#1db954]' : 'text-[#a1a1aa] hover:text-white'
            )}
            aria-label={currentTrack?.liked ? 'Unlike' : 'Like'}
          >
            <Heart size={16} fill={currentTrack?.liked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={onOpenQueue}
            className="rounded-full p-1.5 text-[#a1a1aa] transition-colors hover:text-white"
            aria-label="Open queue"
          >
            <ListMusic size={16} />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={player.toggleMute}
              className="rounded-full p-1.5 text-[#a1a1aa] transition-colors hover:text-white"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              <VolumeIcon size={16} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={muted ? 0 : player.volumeRaw}
              onChange={(e) => player.setVolume(Number(e.target.value))}
              className="echo-slider w-20"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>

      {/* Mobile progress bar (below controls) */}
      <div className="mt-1.5 flex items-center gap-2 sm:hidden">
        <ProgressBar
          value={progress}
          max={currentTrack?.duration ?? 0}
          accent={accent}
          onChange={player.seek}
          compact
        />
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  max,
  accent,
  onChange,
  compact,
}: {
  value: number;
  max: number;
  accent: string;
  onChange: (v: number) => void;
  compact?: boolean;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div
      className={cn('group relative h-1 flex-1 cursor-pointer rounded-full bg-white/15', compact && 'h-1')}
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        onChange(pct * max);
      }}
      role="slider"
      aria-valuenow={value}
      aria-valuemax={max}
      aria-valuemin={0}
      aria-label="Seek"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') onChange(value + 5);
        if (e.key === 'ArrowLeft') onChange(value - 5);
      }}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-colors group-hover:bg-opacity-80"
        style={{ width: `${pct}%`, backgroundColor: accent }}
      />
      <div
        className="absolute top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        style={{ left: `calc(${pct}% - 5px)` }}
      />
    </div>
  );
}
