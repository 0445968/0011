'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { PlayerState } from '../usePlayer';
import { seedAlbums, seedArtists, seedPlaylists } from '@/data/demos/music-player';
import type { View, DetailTarget } from '../EchoApp';
import { MediaCard } from '../MediaCard';
import { ArtistCircle } from '../ArtistCircle';

interface Props {
  player: PlayerState;
  navigate: (v: View, target?: DetailTarget) => void;
}

type Tab = 'playlists' | 'albums' | 'artists';
type Sort = 'recent' | 'alpha' | 'played';

export function LibraryView({ player, navigate }: Props) {
  const [tab, setTab] = useState<Tab>('playlists');
  const [sort, setSort] = useState<Sort>('alpha');

  const sortedPlaylists = useMemo(() => {
    const items = [...seedPlaylists];
    if (sort === 'alpha') items.sort((a, b) => a.title.localeCompare(b.title));
    return items;
  }, [sort]);

  const sortedAlbums = useMemo(() => {
    const items = [...seedAlbums];
    if (sort === 'alpha') items.sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'recent') items.sort((a, b) => b.year - a.year);
    return items;
  }, [sort]);

  const sortedArtists = useMemo(() => {
    const items = [...seedArtists];
    if (sort === 'alpha') items.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'played') items.sort((a, b) => b.monthlyListeners - a.monthlyListeners);
    return items;
  }, [sort]);

  return (
    <div className="px-4 pt-4 sm:px-6 lg:px-8">
      <h1 className="mb-5 text-2xl font-bold text-white">Your Library</h1>

      {/* Tabs + sort */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-lg bg-white/5 p-0.5">
          {(['playlists', 'albums', 'artists'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                tab === t ? 'bg-white/10 text-white' : 'text-[#a1a1aa] hover:text-white'
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-1.5 text-xs">
          <span className="text-[#71717a]">Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-white focus:outline-none"
          >
            <option value="alpha">Alphabetical</option>
            <option value="recent">Recently Added</option>
            <option value="played">Recently Played</option>
          </select>
        </label>
      </div>

      {/* Content */}
      {tab === 'playlists' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sortedPlaylists.map((pl) => (
            <MediaCard
              key={pl.id}
              artwork={pl.artwork}
              title={pl.title}
              subtitle={`Playlist · ${pl.trackIds.length} tracks`}
              onClick={() => navigate('playlist', { type: 'playlist', id: pl.id })}
              onPlay={() => player.playPlayable({ id: pl.id, trackIds: pl.trackIds, title: pl.title, subtitle: pl.description, artwork: pl.artwork, accent: pl.accent }, pl.trackIds[0])}
            />
          ))}
        </div>
      )}

      {tab === 'albums' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sortedAlbums.map((al) => (
            <MediaCard
              key={al.id}
              artwork={al.artwork}
              title={al.title}
              subtitle={`${al.year} · ${al.artistName}`}
              onClick={() => navigate('album', { type: 'album', id: al.id })}
              onPlay={() => player.playPlayable({ id: al.id, trackIds: al.trackIds, title: al.title, subtitle: al.artistName, artwork: al.artwork, accent: al.accent }, al.trackIds[0])}
            />
          ))}
        </div>
      )}

      {tab === 'artists' && (
        <div className="flex flex-wrap gap-2">
          {sortedArtists.map((ar) => (
            <ArtistCircle
              key={ar.id}
              artwork={ar.artwork}
              name={ar.name}
              genre={ar.genre}
              onClick={() => navigate('artist', { type: 'artist', id: ar.id })}
            />
          ))}
        </div>
      )}
    </div>
  );
}
