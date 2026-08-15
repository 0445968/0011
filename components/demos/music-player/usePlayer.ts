'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  seedTracks,
  seedAlbums,
  seedArtists,
  seedPlaylists,
  type Track,
} from '@/data/demos/music-player';

export type RepeatMode = 'off' | 'all' | 'one';

let idCounter = 1000;
const nextId = (p: string) => `${p}${idCounter++}`;

// Track lookup map
const trackMap = new Map(seedTracks.map((t) => [t.id, t]));
const albumMap = new Map(seedAlbums.map((a) => [a.id, a]));
const artistMap = new Map(seedArtists.map((a) => [a.id, a]));
const playlistMap = new Map(seedPlaylists.map((p) => [p.id, p]));

export function getTrack(id: string): Track | undefined {
  return trackMap.get(id);
}

export function getTracks(ids: string[]): Track[] {
  return ids.map((id) => trackMap.get(id)).filter(Boolean) as Track[];
}

export function getAlbum(id: string) {
  return albumMap.get(id);
}

export function getArtist(id: string) {
  return artistMap.get(id);
}

export function getPlaylist(id: string) {
  return playlistMap.get(id);
}

export function albumDuration(trackIds: string[]): number {
  return getTracks(trackIds).reduce((s, t) => s + t.duration, 0);
}

export interface Playable {
  id: string;
  trackIds: string[];
  title: string;
  subtitle: string;
  artwork: string;
  accent: string;
}

export function usePlayer() {
  const [tracks, setTracks] = useState<Track[]>(seedTracks);
  const [queue, setQueue] = useState<string[]>([]);
  const [originalQueue, setOriginalQueue] = useState<string[]>([]); // pre-shuffle order
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // seconds
  const [volume, setVolume] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>('off');
  const [currentPlayable, setCurrentPlayable] = useState<Playable | null>(null);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Playable[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentTrackId = queue[currentIndex] ?? null;
  const currentTrack = currentTrackId ? tracks.find((t) => t.id === currentTrackId) ?? null : null;
  const effectiveVolume = muted ? 0 : volume;

  // Playback timer — advances progress
  useEffect(() => {
    if (!isPlaying || !currentTrack) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1;
        if (next >= currentTrack.duration) {
          // Track ended — handle repeat/advance
          return currentTrack.duration; // cap, advance handled in separate effect
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, currentTrack]);

  // Handle track completion
  useEffect(() => {
    if (!currentTrack) return;
    if (progress >= currentTrack.duration && isPlaying) {
      if (repeat === 'one') {
        setProgress(0);
      } else {
        advanceTrack(1);
      }
    }
  }, [progress, currentTrack, isPlaying, repeat]);

  const playPlayable = useCallback((playable: Playable, startTrackId?: string) => {
    let trackIds = [...playable.trackIds];
    if (shuffle) {
      // Shuffle but keep start track first
      if (startTrackId) {
        trackIds = trackIds.filter((id) => id !== startTrackId);
        shuffleArray(trackIds);
        trackIds.unshift(startTrackId);
      } else {
        shuffleArray(trackIds);
      }
    }
    const idx = startTrackId ? trackIds.indexOf(startTrackId) : 0;
    setQueue(trackIds);
    setOriginalQueue(playable.trackIds);
    setCurrentIndex(Math.max(0, idx));
    setProgress(0);
    setIsPlaying(true);
    setCurrentPlayable(playable);
    setRecentlyPlayed((prev) => {
      const filtered = prev.filter((p) => p.id !== playable.id);
      return [playable, ...filtered].slice(0, 8);
    });
  }, [shuffle]);

  const playTrackList = useCallback((trackIds: string[], startIndex = 0, playable?: Playable) => {
    const p = playable ?? {
      id: nextId('play'),
      trackIds,
      title: 'Queue',
      subtitle: '',
      artwork: '',
      accent: '#6366f1',
    };
    playPlayable(p, trackIds[startIndex]);
  }, [playPlayable]);

  const playSingleTrack = useCallback((trackId: string) => {
    const track = tracks.find((t) => t.id === trackId);
    if (!track) return;
    const playable: Playable = {
      id: `single-${track.id}`,
      trackIds: [track.id],
      title: track.title,
      subtitle: track.artistName,
      artwork: getAlbum(track.albumId)?.artwork ?? '',
      accent: getAlbum(track.albumId)?.accent ?? '#6366f1',
    };
    playPlayable(playable, trackId);
  }, [tracks, playPlayable]);

  const advanceTrack = useCallback((direction: 1 | -1) => {
    setCurrentIndex((prevIdx) => {
      if (queue.length === 0) return -1;
      let nextIdx = prevIdx + direction;
      if (nextIdx >= queue.length) {
        if (repeat === 'all') {
          nextIdx = 0;
        } else {
          setIsPlaying(false);
          return prevIdx;
        }
      }
      if (nextIdx < 0) {
        if (repeat === 'all') {
          nextIdx = queue.length - 1;
        } else {
          return 0;
        }
      }
      setProgress(0);
      return nextIdx;
    });
  }, [queue, repeat]);

  const next = useCallback(() => advanceTrack(1), [advanceTrack]);
  const previous = useCallback(() => {
    if (progress > 3) {
      setProgress(0);
    } else {
      advanceTrack(-1);
    }
  }, [progress, advanceTrack]);

  const togglePlay = useCallback(() => {
    if (currentTrack) {
      setIsPlaying((p) => !p);
    }
  }, [currentTrack]);

  const seek = useCallback((seconds: number) => {
    setProgress(Math.max(0, Math.min(seconds, currentTrack?.duration ?? 0)));
  }, [currentTrack]);

  const toggleShuffle = useCallback(() => {
    setShuffle((prev) => {
      const newShuffle = !prev;
      if (newShuffle) {
        // Shuffle queue, keeping current track in place
        setQueue((prevQueue) => {
          const currentId = prevQueue[currentIndex];
          if (!currentId) return prevQueue;
          const rest = prevQueue.filter((_, i) => i !== currentIndex);
          shuffleArray(rest);
          return [currentId, ...rest];
        });
      } else {
        // Restore original order, keeping current track
        setQueue((prevQueue) => {
          const currentId = prevQueue[currentIndex];
          if (!currentId) return prevQueue;
          const restored = [...originalQueue];
          const newIdx = restored.indexOf(currentId);
          if (newIdx >= 0) {
            setCurrentIndex(newIdx);
            return restored;
          }
          return prevQueue;
        });
      }
      return newShuffle;
    });
  }, [currentIndex, originalQueue]);

  const cycleRepeat = useCallback(() => {
    setRepeat((prev) => (prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'));
  }, []);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  const setVolumeValue = useCallback((v: number) => {
    setVolume(v);
    if (v > 0 && muted) setMuted(false);
  }, [muted]);

  // Queue management
  const removeFromQueue = useCallback((index: number) => {
    setQueue((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (index < currentIndex) {
        setCurrentIndex((ci) => ci - 1);
      } else if (index === currentIndex) {
        setProgress(0);
        if (index >= next.length) {
          setCurrentIndex(Math.max(0, next.length - 1));
        }
      }
      return next;
    });
  }, [currentIndex]);

  const playQueueItem = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const moveQueueItem = useCallback((from: number, to: number) => {
    setQueue((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      // Adjust current index if needed
      if (from === currentIndex) {
        setCurrentIndex(to);
      } else if (from < currentIndex && to >= currentIndex) {
        setCurrentIndex((ci) => ci - 1);
      } else if (from > currentIndex && to <= currentIndex) {
        setCurrentIndex((ci) => ci + 1);
      }
      return next;
    });
  }, [currentIndex]);

  const addToQueue = useCallback((trackId: string) => {
    setQueue((prev) => [...prev, trackId]);
  }, []);

  // Like management
  const toggleLike = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((t) => (t.id === trackId ? { ...t, liked: !t.liked } : t))
    );
  }, []);

  // Reset
  const reset = useCallback(() => {
    setTracks(seedTracks);
    setQueue([]);
    setOriginalQueue([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
    setProgress(0);
    setVolume(0.7);
    setMuted(false);
    setShuffle(false);
    setRepeat('off');
    setCurrentPlayable(null);
    setRecentlyPlayed([]);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  return {
    tracks,
    queue,
    currentIndex,
    currentTrack,
    currentTrackId,
    currentPlayable,
    isPlaying,
    progress,
    volume: effectiveVolume,
    volumeRaw: volume,
    muted,
    shuffle,
    repeat,
    recentlyPlayed,
    playPlayable,
    playTrackList,
    playSingleTrack,
    next,
    previous,
    togglePlay,
    seek,
    toggleShuffle,
    cycleRepeat,
    toggleMute,
    setVolume: setVolumeValue,
    removeFromQueue,
    playQueueItem,
    moveQueueItem,
    addToQueue,
    toggleLike,
    reset,
  };
}

export type PlayerState = ReturnType<typeof usePlayer>;

function shuffleArray<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
