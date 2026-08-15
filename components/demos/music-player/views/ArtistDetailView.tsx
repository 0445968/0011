'use client';

import { Play, Shuffle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { PlayerState } from '../usePlayer';
import { getArtist, getAlbum, getTracks } from '../usePlayer';
import type { View, DetailTarget } from '../EchoApp';
import { TrackRow } from '../TrackRow';
import { MediaCard } from '../MediaCard';
import { ArtistCircle } from '../ArtistCircle';
import { formatListeners } from '../utils';
import { seedArtists } from '@/data/demos/music-player';

interface Props {
  player: PlayerState;
  artistId: string;
  navigate: (v: View, target?: DetailTarget) => void;
}

export function ArtistDetailView({ player, artistId, navigate }: Props) {
  const artist = getArtist(artistId);
  if (!artist) return <div className="p-8 text-center text-[#71717a]">Artist not found</div>;

  const topTracks = getTracks(artist.topTrackIds);
  const albums = artist.albumIds.map((id) => getAlbum(id)).filter(Boolean);
  const related = artist.relatedArtistIds.map((id) => seedArtists.find((a) => a.id === id)).filter(Boolean);

  const playTopTracks = (idx = 0) => {
    player.playPlayable(
      { id: `artist-${artist.id}`, trackIds: artist.topTrackIds, title: artist.name, subtitle: 'Top Tracks', artwork: artist.artwork, accent: artist.accent },
      artist.topTrackIds[idx]
    );
  };

  return (
    <div>
      {/* Hero header with artist artwork as background */}
      <div className="relative h-48 overflow-hidden sm:h-64 lg:h-72">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={artist.artwork} alt={artist.name} className="h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-[#0a0a0c]/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-sm text-white/60">{formatListeners(artist.monthlyListeners)} monthly listeners</p>
            <h1 className="mt-1 text-4xl font-bold text-white sm:text-6xl lg:text-7xl">{artist.name}</h1>
          </motion.div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <button
          onClick={() => playTopTracks(0)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1db954] text-black transition-transform hover:scale-105"
          aria-label="Play"
        >
          <Play size={22} className="ml-0.5 fill-current" />
        </button>
        <button
          onClick={() => {
            const shuffled = [...artist.topTrackIds].sort(() => Math.random() - 0.5);
            player.playPlayable(
              { id: `artist-${artist.id}`, trackIds: shuffled, title: artist.name, subtitle: 'Shuffled', artwork: artist.artwork, accent: artist.accent },
              shuffled[0]
            );
          }}
          className="flex h-10 w-10 items-center justify-center rounded-full text-[#a1a1aa] transition-colors hover:text-white"
          aria-label="Shuffle"
        >
          <Shuffle size={20} />
        </button>
        <button
          onClick={() => navigate('artist', { type: 'artist', id: artist.id })}
          className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          Follow
        </button>
      </div>

      {/* Bio */}
      <div className="px-4 py-2 sm:px-6 lg:px-8">
        <p className="max-w-2xl text-sm leading-relaxed text-white/60">{artist.bio}</p>
      </div>

      {/* Popular tracks */}
      <div className="px-4 pt-6 sm:px-6 lg:px-8">
        <h2 className="mb-3 text-xl font-bold text-white">Popular</h2>
        <div className="space-y-0.5">
          {topTracks.map((t, i) => (
            <TrackRow
              key={t.id}
              track={t}
              index={i}
              player={player}
              onPlay={() => playTopTracks(i)}
              showArtist={false}
              albumArtwork={getAlbum(t.albumId)?.artwork}
            />
          ))}
        </div>
      </div>

      {/* Albums */}
      {albums.length > 0 && (
        <div className="px-4 pt-8 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-xl font-bold text-white">Discography</h2>
          <div className="flex gap-2 overflow-x-auto">
            {albums.map((al) => al && (
              <MediaCard
                key={al.id}
                artwork={al.artwork}
                title={al.title}
                subtitle={`${al.year} · ${al.trackIds.length} tracks`}
                onClick={() => navigate('album', { type: 'album', id: al.id })}
                onPlay={() => player.playPlayable({ id: al.id, trackIds: al.trackIds, title: al.title, subtitle: al.artistName, artwork: al.artwork, accent: al.accent }, al.trackIds[0])}
              />
            ))}
          </div>
        </div>
      )}

      {/* Related artists */}
      {related.length > 0 && (
        <div className="px-4 pt-8 pb-6 sm:px-6 lg:px-8">
          <h2 className="mb-3 text-xl font-bold text-white">Fans also like</h2>
          <div className="flex gap-2 overflow-x-auto">
            {related.map((ar) => ar && (
              <ArtistCircle
                key={ar.id}
                artwork={ar.artwork}
                name={ar.name}
                genre={ar.genre}
                onClick={() => navigate('artist', { type: 'artist', id: ar.id })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
