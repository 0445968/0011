'use client';

import { Play, Heart, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { PlayerState, Playable } from '../usePlayer';
import { getAlbum, getTracks } from '../usePlayer';
import { seedAlbums, seedArtists, seedPlaylists, type Album, type Playlist } from '@/data/demos/music-player';
import type { View, DetailTarget } from '../EchoApp';
import { MediaCard } from '../MediaCard';
import { ArtistCircle } from '../ArtistCircle';
import { formatDuration, formatListeners } from '../utils';

interface Props {
  player: PlayerState;
  navigate: (v: View, target?: DetailTarget) => void;
}

export function HomeView({ player, navigate }: Props) {
  const featured = seedAlbums[0]; // Midnight Atlas
  const featuredTracks = getTracks(featured.trackIds);

  const playFeatured = () => {
    player.playPlayable(
      { id: featured.id, trackIds: featured.trackIds, title: featured.title, subtitle: featured.artistName, artwork: featured.artwork, accent: featured.accent },
      featured.trackIds[0]
    );
  };

  return (
    <div className="px-4 pt-4 sm:px-6 lg:px-8">
      {/* Featured hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative mb-8 overflow-hidden rounded-2xl"
      >
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={featured.artwork} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        <div className="relative flex flex-col gap-4 p-6 sm:p-8 lg:max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Featured Album</p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">{featured.title}</h1>
          <p className="text-sm text-white/70">{featured.artistName} · {featured.year} · {featured.genre}</p>
          <p className="line-clamp-2 text-sm text-white/60">
            An atmospheric journey through nocturnal soundscapes. {featured.trackIds.length} tracks · {formatDuration(featuredTracks.reduce((s, t) => s + t.duration, 0))}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={playFeatured}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black transition-transform hover:scale-105"
            >
              <Play size={18} className="fill-current" />
              Play
            </button>
            <button
              onClick={() => player.playPlayable(
                { id: featured.id, trackIds: [...featured.trackIds].sort(() => Math.random() - 0.5), title: featured.title, subtitle: featured.artistName, artwork: featured.artwork, accent: featured.accent },
                featured.trackIds[Math.floor(Math.random() * featured.trackIds.length)]
              )}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              <Shuffle size={16} />
              Shuffle
            </button>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20"
              aria-label="Favorite"
            >
              <Heart size={18} />
            </button>
          </div>
        </div>
      </motion.section>

      {/* Recently Played */}
      {player.recentlyPlayed.length > 0 && (
        <Rail title="Recently Played">
          {player.recentlyPlayed.map((p) => (
            <MediaCard
              key={p.id}
              artwork={p.artwork}
              title={p.title}
              subtitle={p.subtitle}
              onClick={() => {
                if (p.id.startsWith('al')) navigate('album', { type: 'album', id: p.id });
                else if (p.id.startsWith('pl')) navigate('playlist', { type: 'playlist', id: p.id });
                else player.playPlayable(p, p.trackIds[0]);
              }}
              onPlay={() => player.playPlayable(p, p.trackIds[0])}
            />
          ))}
        </Rail>
      )}

      {/* Made for You */}
      <Rail title="Made for You">
        {seedPlaylists.filter((p) => p.curated).map((pl) => (
          <PlaylistCard key={pl.id} playlist={pl} player={player} navigate={navigate} />
        ))}
      </Rail>

      {/* Popular Albums */}
      <Rail title="Popular Albums">
        {seedAlbums.map((al) => (
          <AlbumCard key={al.id} album={al} player={player} navigate={navigate} />
        ))}
      </Rail>

      {/* Recommended Artists */}
      <Rail title="Recommended Artists" circle>
        {seedArtists.map((ar) => (
          <ArtistCircle
            key={ar.id}
            artwork={ar.artwork}
            name={ar.name}
            genre={ar.genre}
            onClick={() => navigate('artist', { type: 'artist', id: ar.id })}
          />
        ))}
      </Rail>

      {/* Your Playlists */}
      <Rail title="Your Playlists">
        {seedPlaylists.map((pl) => (
          <PlaylistCard key={pl.id} playlist={pl} player={player} navigate={navigate} />
        ))}
      </Rail>
    </div>
  );
}

function Rail({ title, children, circle }: { title: string; children: React.ReactNode; circle?: boolean }) {
  return (
    <section className="mb-6">
      <h2 className="mb-3 text-xl font-bold text-white">{title}</h2>
      <div className={cn('flex gap-2 overflow-x-auto pb-2', circle ? 'pl-1' : '')}>
        {children}
      </div>
    </section>
  );
}

function AlbumCard({ album, player, navigate }: { album: Album; player: PlayerState; navigate: (v: View, t?: DetailTarget) => void }) {
  return (
    <MediaCard
      artwork={album.artwork}
      title={album.title}
      subtitle={album.artistName}
      onClick={() => navigate('album', { type: 'album', id: album.id })}
      onPlay={() => player.playPlayable({ id: album.id, trackIds: album.trackIds, title: album.title, subtitle: album.artistName, artwork: album.artwork, accent: album.accent }, album.trackIds[0])}
    />
  );
}

function PlaylistCard({ playlist, player, navigate }: { playlist: Playlist; player: PlayerState; navigate: (v: View, t?: DetailTarget) => void }) {
  return (
    <MediaCard
      artwork={playlist.artwork}
      title={playlist.title}
      subtitle={`${playlist.trackIds.length} tracks`}
      onClick={() => navigate('playlist', { type: 'playlist', id: playlist.id })}
      onPlay={() => player.playPlayable({ id: playlist.id, trackIds: playlist.trackIds, title: playlist.title, subtitle: playlist.description, artwork: playlist.artwork, accent: playlist.accent }, playlist.trackIds[0])}
    />
  );
}
