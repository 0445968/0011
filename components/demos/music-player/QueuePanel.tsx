'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X, Play, Pause, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlayerState } from './usePlayer';
import { getTrack, getAlbum } from './usePlayer';
import { formatTime } from './utils';

interface Props {
  player: PlayerState;
  open: boolean;
  onClose: () => void;
}

export function QueuePanel({ player, open, onClose }: Props) {
  const { queue, currentIndex } = player;
  const currentTrack = player.currentTrack;
  const upcoming = queue.slice(currentIndex + 1);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-0 z-30 flex h-full w-80 flex-col border-l border-white/5 bg-[#0d0d10]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">Queue</h2>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-[#a1a1aa] transition-colors hover:text-white"
              aria-label="Close queue"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Now playing */}
            {currentTrack && (
              <div className="px-4 pt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#71717a]">
                  Now Playing
                </p>
                <QueueItem
                  trackId={currentTrack.id}
                  player={player}
                  index={currentIndex}
                  isCurrent
                  onClose={onClose}
                />
              </div>
            )}

            {/* Up next */}
            <div className="px-4 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#71717a]">
                Up Next ({upcoming.length})
              </p>
              {upcoming.length === 0 ? (
                <p className="py-4 text-sm text-[#71717a]">No tracks in queue.</p>
              ) : (
                <div className="space-y-0.5 pb-4">
                  {upcoming.map((trackId, i) => {
                    const queueIndex = currentIndex + 1 + i;
                    return (
                      <QueueItem
                        key={`${trackId}-${i}`}
                        trackId={trackId}
                        player={player}
                        index={queueIndex}
                        onClose={onClose}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function QueueItem({
  trackId,
  player,
  index,
  isCurrent,
}: {
  trackId: string;
  player: PlayerState;
  index: number;
  isCurrent?: boolean;
  onClose: () => void;
}) {
  const track = getTrack(trackId);
  if (!track) return null;
  const album = getAlbum(track.albumId);
  const isPlaying = isCurrent && player.isPlaying;

  return (
    <div
      className={cn(
        'group flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-white/5',
        isCurrent && 'bg-white/5'
      )}
    >
      {/* Artwork + play */}
      <button
        onClick={() => player.playQueueItem(index)}
        className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm"
        aria-label={`Play ${track.title}`}
      >
        {album && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={album.artwork} alt="" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {isPlaying ? (
            <Pause size={14} className="fill-white text-white" />
          ) : (
            <Play size={14} className="fill-white text-white" />
          )}
        </div>
      </button>

      <div className="min-w-0 flex-1">
        <p className={cn('truncate text-sm font-medium', isCurrent ? 'text-[#1db954]' : 'text-white')}>
          {track.title}
        </p>
        <p className="truncate text-xs text-[#a1a1aa]">{track.artistName}</p>
      </div>

      <span className="shrink-0 text-xs tabular-nums text-[#71717a]">
        {formatTime(track.duration)}
      </span>

      {/* Reorder + remove */}
      <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={() => player.moveQueueItem(index, index - 1)}
          disabled={index === 0}
          className="rounded p-0.5 text-[#71717a] transition-colors hover:text-white disabled:opacity-20"
          aria-label="Move up"
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={() => player.moveQueueItem(index, index + 1)}
          disabled={index === player.queue.length - 1}
          className="rounded p-0.5 text-[#71717a] transition-colors hover:text-white disabled:opacity-20"
          aria-label="Move down"
        >
          <ChevronDown size={14} />
        </button>
        <button
          onClick={() => player.removeFromQueue(index)}
          className="rounded p-0.5 text-[#71717a] transition-colors hover:text-[#ef4444]"
          aria-label="Remove from queue"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
