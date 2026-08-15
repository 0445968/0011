'use client';

import { useState, useMemo } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlayerState } from '../usePlayer';
import { getTracks } from '../usePlayer';
import { seedTracks, seedAlbums, seedArtists, seedPlaylists, browseCategories } from '@/data/demos/music-player';
import type { View, DetailTarget } from '../EchoApp';
import { MediaCard } from '../MediaCard';
import { ArtistCircle } from '../ArtistCircle';
import { TrackRow } from '../TrackRow';

interface Props {
  player: PlayerState;
  navigate: (v: View, target?: DetailTarget) => void;
}

export function SearchView({ player, navigate }: Props) {
  const [query, setQuery] = useState('');
  const [browseGenre, setBrowseGenre] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return {
      tracks: seedTracks.filter(
        (t) => t.title.toLowerCase().includes(q) || t.artistName.toLowerCase().includes(q)
      ).slice(0, 8),
      artists: seedArtists.filter(
        (a) => a.name.toLowerCase().includes(q) || a.genre.toLowerCase().includes(q)
      ),
      albums: seedAlbums.filter(
        (a) => a.title.toLowerCase().includes(q) || a.artistName.toLowerCase().includes(q)
      ),
      playlists: seedPlaylists.filter(
        (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      ),
    };
  }, [query]);

  const genreTracks = useMemo(() => {
    if (!browseGenre) return null;
    return seedTracks.filter((t) => t.genre === browseGenre);
  }, [browseGenre]);

  const topResult = results && (results.tracks[0] || results.albums[0] || results.artists[0]);

  return (
    <div className="px-4 pt-4 sm:px-6 lg:px-8">
      {/* Search bar */}
      <div className="relative mb-6 max-w-xl">
        <SearchIcon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717a]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to listen to?"
          className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-10 text-sm text-white placeholder:text-[#71717a] focus:border-white/30 focus:outline-none"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white"
            aria-label="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Empty: browse categories */}
      {!query && !browseGenre && (
        <div>
          <h2 className="mb-4 text-xl font-bold text-white">Browse all</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {browseCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setBrowseGenre(cat.genre)}
                className="relative h-28 overflow-hidden rounded-lg p-4 text-left transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: cat.accent }}
              >
                <span className="text-lg font-bold text-white">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Genre browse results */}
      {!query && browseGenre && (
        <div>
          <button
            onClick={() => setBrowseGenre(null)}
            className="mb-4 text-sm text-[#a1a1aa] hover:text-white"
          >
            ← Back to browse
          </button>
          <h2 className="mb-4 text-xl font-bold text-white">{browseGenre}</h2>
          <div className="space-y-0.5">
            {genreTracks?.map((t, i) => (
              <TrackRow
                key={t.id}
                track={t}
                index={i}
                player={player}
                onPlay={() => player.playSingleTrack(t.id)}
                showArtist
                albumArtwork={seedAlbums.find((a) => a.id === t.albumId)?.artwork}
              />
            ))}
          </div>
        </div>
      )}

      {/* Search results */}
      {query && results && (
        <div className="space-y-8">
          {/* Top result */}
          {topResult && (
            <section>
              <h2 className="mb-3 text-xl font-bold text-white">Top result</h2>
              <div className="max-w-sm">
                {(() => {
                  const tr = topResult as unknown as Record<string, unknown>;
                  if ('trackNumber' in tr) {
                    const t = topResult as typeof seedTracks[0];
                    return (
                      <MediaCard
                        artwork={seedAlbums.find((a) => a.id === t.albumId)?.artwork ?? ''}
                        title={t.title}
                        subtitle={`Song · ${t.artistName}`}
                        onClick={() => player.playSingleTrack(t.id)}
                        onPlay={() => player.playSingleTrack(t.id)}
                      />
                    );
                  }
                  if ('albumIds' in tr) {
                    const ar = topResult as unknown as typeof seedArtists[0];
                    return (
                      <MediaCard
                        artwork={ar.artwork}
                        title={ar.name}
                        subtitle={`Artist · ${ar.genre}`}
                        onClick={() => navigate('artist', { type: 'artist', id: ar.id })}
                      />
                    );
                  }
                  if ('year' in tr) {
                    const al = topResult as unknown as typeof seedAlbums[0];
                    return (
                      <MediaCard
                        artwork={al.artwork}
                        title={al.title}
                        subtitle={`Album · ${al.artistName}`}
                        onClick={() => navigate('album', { type: 'album', id: al.id })}
                        onPlay={() => player.playPlayable({ id: al.id, trackIds: al.trackIds, title: al.title, subtitle: al.artistName, artwork: al.artwork, accent: al.accent }, al.trackIds[0])}
                      />
                    );
                  }
                  const pl = topResult as unknown as typeof seedPlaylists[0];
                  return (
                    <MediaCard
                      artwork={pl.artwork}
                      title={pl.title}
                      subtitle={`Playlist · ${pl.description}`}
                      onClick={() => navigate('playlist', { type: 'playlist', id: pl.id })}
                      onPlay={() => player.playPlayable({ id: pl.id, trackIds: pl.trackIds, title: pl.title, subtitle: pl.description, artwork: pl.artwork, accent: pl.accent }, pl.trackIds[0])}
                    />
                  );
                })()}
              </div>
            </section>
          )}

          {/* Songs */}
          {results.tracks.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold text-white">Songs</h2>
              <div className="space-y-0.5">
                {results.tracks.map((t, i) => (
                  <TrackRow
                    key={t.id}
                    track={t}
                    index={i}
                    player={player}
                    onPlay={() => player.playSingleTrack(t.id)}
                    showArtist
                    albumArtwork={seedAlbums.find((a) => a.id === t.albumId)?.artwork}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {results.artists.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold text-white">Artists</h2>
              <div className="flex gap-2 overflow-x-auto">
                {results.artists.map((a) => (
                  <ArtistCircle
                    key={a.id}
                    artwork={a.artwork}
                    name={a.name}
                    genre={a.genre}
                    onClick={() => navigate('artist', { type: 'artist', id: a.id })}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {results.albums.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold text-white">Albums</h2>
              <div className="flex gap-2 overflow-x-auto">
                {results.albums.map((al) => (
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
            </section>
          )}

          {/* Playlists */}
          {results.playlists.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold text-white">Playlists</h2>
              <div className="flex gap-2 overflow-x-auto">
                {results.playlists.map((pl) => (
                  <MediaCard
                    key={pl.id}
                    artwork={pl.artwork}
                    title={pl.title}
                    subtitle={pl.description}
                    onClick={() => navigate('playlist', { type: 'playlist', id: pl.id })}
                    onPlay={() => player.playPlayable({ id: pl.id, trackIds: pl.trackIds, title: pl.title, subtitle: pl.description, artwork: pl.artwork, accent: pl.accent }, pl.trackIds[0])}
                  />
                ))}
              </div>
            </section>
          )}

          {/* No results */}
          {results.tracks.length === 0 && results.artists.length === 0 && results.albums.length === 0 && results.playlists.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-lg font-semibold text-white">No results found</p>
              <p className="mt-2 text-sm text-[#71717a]">
                Please make sure your words are spelled correctly, or use fewer or different keywords.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
