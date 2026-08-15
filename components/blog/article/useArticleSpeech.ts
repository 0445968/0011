'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { BlogBlock } from '@/data/blog';

export type ArticleSpeechStatus =
  | 'idle'
  | 'playing'
  | 'paused';

interface UseArticleSpeechProps {
  title: string;
  excerpt: string;
  content: BlogBlock[];
}

interface SpeechChunk {
  text: string;
  start: number;
  end: number;
}

export function useArticleSpeech({
  title,
  excerpt,
  content,
}: UseArticleSpeechProps) {
  const [supported, setSupported] =
    useState(false);

  const [status, setStatus] =
    useState<ArticleSpeechStatus>('idle');

  const [progress, setProgress] =
    useState(0);

  const [rate, setRateState] =
    useState(1);

  const rateRef =
    useRef(1);

  const currentCharacterRef =
    useRef(0);

  const sessionRef =
    useRef(0);

  const speechText = useMemo(
    () =>
      createSpeechText({
        title,
        excerpt,
        content,
      }),
    [
      title,
      excerpt,
      content,
    ]
  );

  const chunks = useMemo(
    () =>
      createSpeechChunks(
        speechText
      ),
    [speechText]
  );

  const totalCharacters =
    speechText.length;

  /* =========================================================
     SUPPORT
  ========================================================= */

  useEffect(() => {
    setSupported(
      typeof window !== 'undefined' &&
        'speechSynthesis' in window &&
        'SpeechSynthesisUtterance' in window
    );
  }, []);

  /* =========================================================
     RESET WHEN ARTICLE CHANGES
  ========================================================= */

  useEffect(() => {
    currentCharacterRef.current = 0;
    setProgress(0);
    setStatus('idle');

    return () => {
      sessionRef.current += 1;

      if (
        typeof window !== 'undefined' &&
        'speechSynthesis' in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechText]);

  /* =========================================================
     SPEAK FROM CHARACTER POSITION
  ========================================================= */

  const speakFromCharacter =
    useCallback(
      (
        requestedCharacter: number
      ) => {
        if (
          typeof window ===
            'undefined' ||
          !('speechSynthesis' in window) ||
          !totalCharacters ||
          !chunks.length
        ) {
          return;
        }

        const synthesis =
          window.speechSynthesis;

        const startCharacter =
          clamp(
            requestedCharacter,
            0,
            totalCharacters
          );

        /*
         * Invalidate callbacks from
         * previous utterances.
         */
        sessionRef.current += 1;

        const session =
          sessionRef.current;

        synthesis.cancel();

        currentCharacterRef.current =
          startCharacter;

        setProgress(
          (startCharacter /
            totalCharacters) *
            100
        );

        if (
          startCharacter >=
          totalCharacters
        ) {
          setProgress(100);
          setStatus('idle');
          return;
        }

        const firstChunkIndex =
          chunks.findIndex(
            (chunk) =>
              chunk.end >
              startCharacter
          );

        if (
          firstChunkIndex < 0
        ) {
          setProgress(100);
          setStatus('idle');
          return;
        }

        setStatus('playing');

        function speakChunk(
          chunkIndex: number
        ) {
          if (
            session !==
            sessionRef.current
          ) {
            return;
          }

          const chunk =
            chunks[chunkIndex];

          if (!chunk) {
            currentCharacterRef.current =
              totalCharacters;

            setProgress(100);
            setStatus('idle');

            return;
          }

          let localOffset = 0;

          if (
            chunkIndex ===
            firstChunkIndex
          ) {
            localOffset =
              Math.max(
                0,
                startCharacter -
                  chunk.start
              );
          }

          const untrimmedText =
            chunk.text.slice(
              localOffset
            );

          const leadingWhitespace =
            untrimmedText.length -
            untrimmedText.trimStart()
              .length;

          const text =
            untrimmedText.trimStart();

          const absoluteStart =
            chunk.start +
            localOffset +
            leadingWhitespace;

          if (!text) {
            speakChunk(
              chunkIndex + 1
            );
            return;
          }

          const utterance =
            new SpeechSynthesisUtterance(
              text
            );

          utterance.rate =
            rateRef.current;

          utterance.onboundary = (
            event
          ) => {
            if (
              session !==
              sessionRef.current
            ) {
              return;
            }

            const absoluteCharacter =
              Math.min(
                totalCharacters,
                absoluteStart +
                  event.charIndex
              );

            currentCharacterRef.current =
              absoluteCharacter;

            setProgress(
              (absoluteCharacter /
                totalCharacters) *
                100
            );
          };

          utterance.onend = () => {
            if (
              session !==
              sessionRef.current
            ) {
              return;
            }

            currentCharacterRef.current =
              chunk.end;

            setProgress(
              (chunk.end /
                totalCharacters) *
                100
            );

            const nextChunk =
              chunkIndex + 1;

            if (
              nextChunk <
              chunks.length
            ) {
              speakChunk(
                nextChunk
              );
            } else {
              currentCharacterRef.current =
                totalCharacters;

              setProgress(100);
              setStatus('idle');
            }
          };

          utterance.onerror = (
            event
          ) => {
            if (
              session !==
              sessionRef.current
            ) {
              return;
            }

            if (
              event.error ===
                'canceled' ||
              event.error ===
                'interrupted'
            ) {
              return;
            }

            setStatus('idle');
          };

          synthesis.speak(
            utterance
          );
        }

        speakChunk(
          firstChunkIndex
        );
      },
      [
        chunks,
        totalCharacters,
      ]
    );

  /* =========================================================
     PLAY
  ========================================================= */

  const play =
    useCallback(() => {
      if (!supported) {
        return;
      }

      const startPosition =
        progress >= 100
          ? 0
          : currentCharacterRef.current;

      speakFromCharacter(
        startPosition
      );
    }, [
      supported,
      progress,
      speakFromCharacter,
    ]);

  /* =========================================================
     PAUSE
  ========================================================= */

  const pause =
    useCallback(() => {
      if (
        !supported ||
        status !== 'playing'
      ) {
        return;
      }

      window.speechSynthesis.pause();

      setStatus('paused');
    }, [
      supported,
      status,
    ]);

  /* =========================================================
     RESUME
  ========================================================= */

  const resume =
    useCallback(() => {
      if (
        !supported ||
        status !== 'paused'
      ) {
        return;
      }

      /*
       * If a normal pause occurred,
       * resume the existing utterance.
       */
      if (
        window.speechSynthesis
          .paused
      ) {
        window.speechSynthesis.resume();

        setStatus('playing');

        return;
      }

      /*
       * Seeking while paused cancels
       * the previous utterance, so
       * restart from the new position.
       */
      speakFromCharacter(
        currentCharacterRef.current
      );
    }, [
      supported,
      status,
      speakFromCharacter,
    ]);

  /* =========================================================
     STOP
  ========================================================= */

  const stop =
    useCallback(() => {
      if (!supported) {
        return;
      }

      sessionRef.current += 1;

      window.speechSynthesis.cancel();

      currentCharacterRef.current =
        0;

      setProgress(0);
      setStatus('idle');
    }, [supported]);

  /* =========================================================
     TOGGLE
  ========================================================= */

  const toggle =
    useCallback(() => {
      if (status === 'playing') {
        pause();
        return;
      }

      if (status === 'paused') {
        resume();
        return;
      }

      play();
    }, [
      status,
      pause,
      resume,
      play,
    ]);

  /* =========================================================
     SEEK

     Receives a percentage from 0–100.
  ========================================================= */

  const seekTo =
    useCallback(
      (percentage: number) => {
        if (
          !supported ||
          !totalCharacters
        ) {
          return;
        }

        const normalizedPercentage =
          clamp(
            percentage,
            0,
            100
          );

        const targetCharacter =
          Math.round(
            totalCharacters *
              (normalizedPercentage /
                100)
          );

        const wasPlaying =
          status === 'playing';

        const wasPaused =
          status === 'paused';

        /*
         * Invalidate and stop current
         * speech before repositioning.
         */
        sessionRef.current += 1;

        window.speechSynthesis.cancel();

        currentCharacterRef.current =
          targetCharacter;

        setProgress(
          normalizedPercentage
        );

        if (
          normalizedPercentage >=
          100
        ) {
          setStatus('idle');
          return;
        }

        /*
         * If already playing,
         * immediately continue from
         * the selected location.
         */
        if (wasPlaying) {
          speakFromCharacter(
            targetCharacter
          );
          return;
        }

        /*
         * Preserve paused state.
         * Resume will restart from
         * the selected position.
         */
        if (wasPaused) {
          setStatus('paused');
          return;
        }

        setStatus('idle');
      },
      [
        supported,
        totalCharacters,
        status,
        speakFromCharacter,
      ]
    );

  /* =========================================================
     PLAYBACK RATE
  ========================================================= */

  const setRate =
    useCallback(
      (nextRate: number) => {
        const normalizedRate =
          clamp(
            Math.round(
              nextRate * 4
            ) / 4,
            0.5,
            2
          );

        rateRef.current =
          normalizedRate;

        setRateState(
          normalizedRate
        );

        /*
         * SpeechSynthesisUtterance.rate
         * cannot reliably change during
         * an active utterance.
         *
         * Restart at the current position
         * using the new rate.
         */
        if (
          status === 'playing'
        ) {
          speakFromCharacter(
            currentCharacterRef.current
          );
        }
      },
      [
        status,
        speakFromCharacter,
      ]
    );

  return {
    supported,
    status,
    progress,

    rate,
    setRate,

    play,
    pause,
    resume,
    stop,
    toggle,

    seekTo,
  };
}

/* =========================================================
   BUILD SPEECH TEXT
========================================================= */

function createSpeechText({
  title,
  excerpt,
  content,
}: {
  title: string;
  excerpt: string;
  content: BlogBlock[];
}) {
  const blocks =
    content.map(
      blockToSpeechText
    );

  return [
    title,
    excerpt,
    ...blocks,
  ]
    .filter(Boolean)
    .join('. ')
    .replace(/\s+/g, ' ')
    .trim();
}

function blockToSpeechText(
  block: BlogBlock
) {
  if (block.type === 'list') {
    return block.items.join(
      '. '
    );
  }

  return block.text;
}

/* =========================================================
   SPLIT LONG ARTICLE INTO SPEECH CHUNKS
========================================================= */

function createSpeechChunks(
  text: string,
  maxLength = 300
): SpeechChunk[] {
  const chunks: SpeechChunk[] =
    [];

  let cursor = 0;

  while (cursor < text.length) {
    while (
      cursor < text.length &&
      /\s/.test(text[cursor])
    ) {
      cursor += 1;
    }

    if (
      cursor >= text.length
    ) {
      break;
    }

    let end = Math.min(
      cursor + maxLength,
      text.length
    );

    if (end < text.length) {
      const segment =
        text.slice(
          cursor,
          end
        );

      const sentenceBreak =
        Math.max(
          segment.lastIndexOf(
            '. '
          ),
          segment.lastIndexOf(
            '? '
          ),
          segment.lastIndexOf(
            '! '
          )
        );

      if (
        sentenceBreak >
        maxLength * 0.45
      ) {
        end =
          cursor +
          sentenceBreak +
          1;
      } else {
        const space =
          segment.lastIndexOf(
            ' '
          );

        if (space > 0) {
          end =
            cursor + space;
        }
      }
    }

    const raw =
      text.slice(
        cursor,
        end
      );

    const leading =
      raw.search(/\S/);

    const trimmed =
      raw.trim();

    if (trimmed) {
      const start =
        cursor +
        Math.max(
          leading,
          0
        );

      chunks.push({
        text: trimmed,
        start,
        end:
          start +
          trimmed.length,
      });
    }

    cursor = end;
  }

  return chunks;
}

/* =========================================================
   CLAMP
========================================================= */

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    Math.max(value, min),
    max
  );
}