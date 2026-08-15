'use client';

import {
  useState,
} from 'react';

import {
  Pause,
  Play,
  RotateCcw,
  Square,
  Volume2,
} from 'lucide-react';

import type { BlogBlock } from '@/data/blog';

import { useArticleSpeech } from './useArticleSpeech';

interface ArticleListenBarProps {
  title: string;
  excerpt: string;
  content: BlogBlock[];
}

const PLAYBACK_SPEEDS = [
  0.5,
  0.75,
  1,
  1.25,
  1.5,
  1.75,
  2,
];

export function ArticleListenBar({
  title,
  excerpt,
  content,
}: ArticleListenBarProps) {
  const {
    supported,
    status,
    progress,

    rate,
    setRate,

    play,
    stop,
    toggle,
    seekTo,
  } = useArticleSpeech({
    title,
    excerpt,
    content,
  });

  const normalizedProgress =
    Math.max(
      0,
      Math.min(
        progress,
        100
      )
    );

  const finished =
    status === 'idle' &&
    normalizedProgress >= 100;

  const mainLabel =
    status === 'playing'
      ? 'Pause article'
      : status === 'paused'
        ? 'Resume article'
        : finished
          ? 'Listen again'
          : 'Listen to this article';

  const icon =
    !supported ? (
      <Volume2
        size={15}
        strokeWidth={1.7}
      />
    ) : status === 'playing' ? (
      <Pause
        size={14}
        strokeWidth={1.8}
      />
    ) : finished ? (
      <RotateCcw
        size={14}
        strokeWidth={1.8}
      />
    ) : (
      <Play
        size={14}
        strokeWidth={1.8}
        className="translate-x-[1px]"
      />
    );

  function handlePrimaryAction() {
    if (!supported) {
      return;
    }

    if (finished) {
      play();
      return;
    }

    toggle();
  }

  return (
    <div
      className="
        w-full
        rounded-2xl
        bg-black/[0.07]
        shadow-[0_8px_30px_rgba(0,0,0,0.04)]
        backdrop-blur-xl

        dark:border-white/10
        dark:bg-white/[0.07]
        dark:shadow-[0_8px_30px_rgba(0,0,0,0.20)]
      "
    >
      <div
        className="
          flex
          min-h-[50px]
          items-center
          gap-3
          px-2.5
          py-1.5
          sm:px-3
        "
      >
        {/* Play / Pause */}
        <button
          type="button"
          onClick={
            handlePrimaryAction
          }
          disabled={!supported}
          aria-label={mainLabel}
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#bbff1b]
            text-black
            transition-all
            duration-300
            hover:scale-105
            hover:bg-[#c7ff45]
            active:scale-95
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {icon}
        </button>

        {/* Label */}
        <div
          className="
            min-w-[120px]
            shrink-0
            sm:min-w-[145px]
          "
        >
          <button
            type="button"
            onClick={
              handlePrimaryAction
            }
            disabled={!supported}
            className="
              block
              whitespace-nowrap
              text-left
              text-[13px]
              font-medium
              text-foreground
              transition-opacity
              duration-300
              hover:opacity-65
            "
          >
            {mainLabel}
          </button>
        </div>

        {/* Desktop progress */}
        <div
          className="
            hidden
            min-w-0
            flex-1
            sm:block
          "
        >
          <SeekableProgressBar
            progress={
              normalizedProgress
            }
            onSeek={seekTo}
            disabled={!supported}
          />
        </div>

        {/* Percentage */}
        <span
          className="
            ml-auto
            min-w-[34px]
            shrink-0
            text-right
            font-mono
            text-[10px]
            tabular-nums
            text-muted-foreground
          "
        >
          {Math.round(
            normalizedProgress
          )}
          %
        </span>

        {/* Playback speed */}
        <label className="shrink-0">
          <span className="sr-only">
            Playback speed
          </span>

          <select
            value={rate}
            disabled={!supported}
            onChange={(event) =>
              setRate(
                Number(
                  event.target.value
                )
              )
            }
            aria-label="Playback speed"
            className="
              h-8
              cursor-pointer
              rounded-full
              border
              border-foreground/10
              bg-transparent
              px-2
              text-[11px]
              font-medium
              text-foreground
              outline-none
              transition-colors
              hover:border-foreground/25
              focus:border-foreground/30
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {PLAYBACK_SPEEDS.map(
              (speed) => (
                <option
                  key={speed}
                  value={speed}
                >
                  {speed}x
                </option>
              )
            )}
          </select>
        </label>

        {/* Stop */}
        {(status === 'playing' ||
          status === 'paused') && (
          <button
            type="button"
            onClick={stop}
            aria-label="Stop article playback"
            title="Stop"
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#bbff1b]
              text-black
              transition-all
              duration-300
              hover:scale-105
              hover:bg-[#c7ff45]
              active:scale-95
            "
          >
            <Square
              size={10}
              strokeWidth={1.8}
            />
          </button>
        )}
      </div>

      {/* Mobile progress */}
      <div
        className="
          px-3
          pb-2
          sm:hidden
        "
      >
        <SeekableProgressBar
          progress={
            normalizedProgress
          }
          onSeek={seekTo}
          disabled={!supported}
        />
      </div>
    </div>
  );
}

/* =========================================================
   SEEKABLE PROGRESS BAR
========================================================= */

function SeekableProgressBar({
  progress,
  onSeek,
  disabled,
}: {
  progress: number;
  onSeek: (
    percentage: number
  ) => void;
  disabled: boolean;
}) {
  const [
    previewProgress,
    setPreviewProgress,
  ] = useState<
    number | null
  >(null);

  const displayedProgress =
    previewProgress ??
    progress;

  function commitSeek(
    percentage: number
  ) {
    setPreviewProgress(null);

    onSeek(
      percentage
    );
  }

  return (
    <div
      className="
        relative
        flex
        h-5
        w-full
        items-center
      "
    >
      {/* Visual track */}
      <div
        className="
          pointer-events-none
          absolute
          left-0
          right-0
          h-[3px]
          overflow-hidden
          rounded-full
          bg-foreground/10
        "
      >
        <div
          className="
            absolute
            inset-y-0
            left-0
            rounded-full
            bg-[#0B65F3]
            transition-[width]
            duration-150
            ease-out
          "
          style={{
            width:
              `${displayedProgress}%`,
          }}
        />
      </div>

      {/* Invisible native range input.

          This makes the entire 20px-tall
          area clickable and draggable,
          rather than requiring the user
          to hit a 3px line.
      */}
      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={
          displayedProgress
        }
        disabled={disabled}
        aria-label="Article playback position"
        onChange={(event) => {
          setPreviewProgress(
            Number(
              event.target.value
            )
          );
        }}
        onPointerUp={(event) => {
          commitSeek(
            Number(
              event.currentTarget
                .value
            )
          );
        }}
        onKeyUp={(event) => {
          commitSeek(
            Number(
              event.currentTarget
                .value
            )
          );
        }}
        onBlur={(event) => {
          if (
            previewProgress !==
            null
          ) {
            commitSeek(
              Number(
                event.currentTarget
                  .value
              )
            );
          }
        }}
        className="
          absolute
          inset-0
          h-full
          w-full
          cursor-pointer
          opacity-0
          disabled:cursor-not-allowed
        "
      />
    </div>
  );
}