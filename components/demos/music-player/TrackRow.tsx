'use client';

import { Play, Pause, Heart, MoreHorizontal, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Track } from '@/data/demos/music-player';
import type { PlayerState } from './usePlayer';
import { EqualizerBars } from './EqualizerBars';
import { formatTime } from './utils';

interface Props {
  track: Track;
  index: number;
  player: PlayerState;
  onPlay: () => void;
  showAlbum?: boolean;
  showArtist?: boolean;
  albumArtwork?: string;
}

export function TrackRow({ track, index, player, onPlay, showAlbum, showArtist, albumArtwork }: Props) {
  const isCurrent = player.currentTrackId === track.id;
  const isPlaying = isCurrent && player.isPlaying;

  return (
    <div
      className={cn(
        'group grid items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-white/5',
        showAlbum ? 'grid-cols-[28px_1fr_1fr_56px]' : 'grid-cols-[28px_1fr_56px]',
        isCurrent && 'bg-white/5'
      )}
    >
      {/* Track number / play button */}
      <button
        onClick={onPlay}
        className="flex h-7 w-7 items-center justify-center text-[#a1a1aa]"
        aria-label={`Play ${track.title}`}
      >
        {isPlaying ? (
          <EqualizerBars playing size={12} color="#1db954" />
        ) : (
          <>
            <span className={cn('group-hover:hidden', isCurrent && 'text-[#1db954]')}>
              {isCurrent ? '♪' : index + 1}
            </span>
            <Play size={14} className="hidden fill-current text-white group-hover:block" />
          </>
        )}
      </button>

      {/* Title + artwork */}
      <div className="flex min-w-0 items-center gap-2.5">
        {albumArtwork && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={albumArtwork} alt="" className="h-9 w-9 shrink-0 rounded-sm object-cover" />
        )}
        <div className="min-w-0">
          <p className={cn('truncate font-medium', isCurrent ? 'text-[#1db954]' : 'text-white')}>
            {track.title}
          </p>
          {showArtist && (
            <p className="truncate text-xs text-[#a1a1aa]">{track.artistName}</p>
          )}
        </div>
      </div>

      {/* Album column */}
      {showAlbum && (
        <div className="hidden min-w-0 truncate text-[#a1a1aa] sm:block">
          {track.albumName}
        </div>
      )}

      {/* Duration + actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => player.toggleLike(track.id)}
          className={cn(
            'rounded-full p-1 transition-opacity',
            track.liked ? 'text-[#1db954] opacity-100' : 'text-[#a1a1aa] opacity-0 hover:text-white group-hover:opacity-100'
          )}
          aria-label={track.liked ? 'Unlike' : 'Like'}
        >
          <Heart size={14} fill={track.liked ? 'currentColor' : 'none'} />
        </button>
        <span className="w-10 text-right text-xs tabular-nums text-[#a1a1aa]">
          {formatTime(track.duration)}
        </span>
      </div>
    </div>
  );
}
