'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Pause,
  Play,
  Square,
  Volume2,
} from 'lucide-react';

import type { BlogBlock } from '@/data/blog';

interface ArticleListenButtonProps {
  title: string;
  excerpt: string;
  content: BlogBlock[];
}

type PlaybackState =
  | 'idle'
  | 'playing'
  | 'paused';

export function ArticleListenButton({
  title,
  excerpt,
  content,
}: ArticleListenButtonProps) {
  const [supported, setSupported] =
    useState(false);

  const [playbackState, setPlaybackState] =
    useState<PlaybackState>('idle');

  const queueIndexRef = useRef(0);
  const stoppedRef = useRef(false);

  const speechQueue = useMemo(
    () =>
      createSpeechQueue(
        title,
        excerpt,
        content
      ),
    [title, excerpt, content]
  );

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        'SpeechSynthesisUtterance' in window
    );

    return () => {
      if (
        typeof window !== 'undefined' &&
        'speechSynthesis' in window
      ) {
        stoppedRef.current = true;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  function speakQueueItem(index: number) {
    if (
      !supported ||
      typeof window === 'undefined'
    ) {
      return;
    }

    if (
      stoppedRef.current ||
      index >= speechQueue.length
    ) {
      queueIndexRef.current = 0;
      setPlaybackState('idle');
      return;
    }

    queueIndexRef.current = index;

    const text = speechQueue[index];

    const utterance =
      new SpeechSynthesisUtterance(text);

    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      if (stoppedRef.current) {
        return;
      }

      speakQueueItem(index + 1);
    };

    utterance.onerror = () => {
      if (stoppedRef.current) {
        return;
      }

      queueIndexRef.current = 0;
      setPlaybackState('idle');
    };

    window.speechSynthesis.speak(utterance);
  }

  function start() {
    if (
      !supported ||
      typeof window === 'undefined'
    ) {
      return;
    }

    stoppedRef.current = false;

    window.speechSynthesis.cancel();

    queueIndexRef.current = 0;

    setPlaybackState('playing');

    window.setTimeout(() => {
      speakQueueItem(0);
    }, 50);
  }

  function pause() {
    if (
      typeof window === 'undefined' ||
      !supported
    ) {
      return;
    }

    window.speechSynthesis.pause();

    setPlaybackState('paused');
  }

  function resume() {
    if (
      typeof window === 'undefined' ||
      !supported
    ) {
      return;
    }

    window.speechSynthesis.resume();

    setPlaybackState('playing');
  }

  function stop() {
    if (
      typeof window === 'undefined' ||
      !supported
    ) {
      return;
    }

    stoppedRef.current = true;

    window.speechSynthesis.cancel();

    queueIndexRef.current = 0;

    setPlaybackState('idle');
  }

  function handleMainAction() {
    if (playbackState === 'idle') {
      start();
      return;
    }

    if (playbackState === 'playing') {
      pause();
      return;
    }

    resume();
  }

  const mainIcon =
    playbackState === 'playing' ? (
      <Pause
        size={15}
        strokeWidth={1.7}
      />
    ) : playbackState === 'paused' ? (
      <Play
        size={15}
        strokeWidth={1.7}
      />
    ) : (
      <Volume2
        size={15}
        strokeWidth={1.7}
      />
    );

  const mainLabel =
    playbackState === 'playing'
      ? 'Pause article'
      : playbackState === 'paused'
        ? 'Resume article'
        : 'Listen to article';

  const secondaryLabel =
    playbackState === 'idle'
      ? 'Listen instead of reading'
      : playbackState === 'playing'
        ? 'Article is playing'
        : 'Playback paused';

  if (!supported) {
    return (
      <div
        className="
          flex
          w-full
          items-center
          gap-3
          rounded-xl
          px-3
          py-3
          opacity-50
        "
      >
        <span
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-border
          "
        >
          <Volume2
            size={15}
            strokeWidth={1.7}
          />
        </span>

        <span>
          <span
            className="
              block
              text-sm
              font-medium
            "
          >
            Listen to article
          </span>

          <span
            className="
              mt-0.5
              block
              text-xs
              text-muted-foreground
            "
          >
            Not supported in this browser
          </span>
        </span>
      </div>
    );
  }

  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <button
        type="button"
        onClick={handleMainAction}
        className="
          group
          flex
          min-w-0
          flex-1
          items-center
          gap-3
          rounded-xl
          px-3
          py-3
          text-left
          transition-colors
          duration-300
          hover:bg-secondary
        "
      >
        <span
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-border
            transition-colors
            duration-300
            group-hover:border-foreground
          "
        >
          {mainIcon}
        </span>

        <span className="min-w-0">
          <span
            className="
              block
              truncate
              text-sm
              font-medium
              text-foreground
            "
          >
            {mainLabel}
          </span>

          <span
            className="
              mt-0.5
              block
              truncate
              text-xs
              text-muted-foreground
            "
          >
            {secondaryLabel}
          </span>
        </span>
      </button>

      {playbackState !== 'idle' && (
        <button
          type="button"
          onClick={stop}
          aria-label="Stop article playback"
          title="Stop"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            border
            border-border
            text-muted-foreground
            transition-all
            duration-300
            hover:border-foreground
            hover:text-foreground
          "
        >
          <Square
            size={12}
            strokeWidth={1.8}
          />
        </button>
      )}
    </div>
  );
}

function createSpeechQueue(
  title: string,
  excerpt: string,
  content: BlogBlock[]
) {
  const sections: string[] = [
    title,
    excerpt,
  ];

  content.forEach((block) => {
    switch (block.type) {
      case 'heading':
      case 'paragraph':
      case 'quote':
        sections.push(block.text);
        break;

      case 'list':
        block.items.forEach((item) => {
          sections.push(item);
        });
        break;
    }
  });

  return sections
    .flatMap(splitLongSpeechSection)
    .filter(Boolean);
}

function splitLongSpeechSection(
  text: string,
  maxLength = 280
) {
  if (text.length <= maxLength) {
    return [text];
  }

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);

  const chunks: string[] = [];
  let current = '';

  sentences.forEach((sentence) => {
    const candidate = current
      ? `${current} ${sentence}`
      : sentence;

    if (
      candidate.length > maxLength &&
      current
    ) {
      chunks.push(current);
      current = sentence;
    } else {
      current = candidate;
    }
  });

  if (current) {
    chunks.push(current);
  }

  return chunks;
}