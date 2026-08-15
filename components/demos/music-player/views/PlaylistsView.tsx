'use client';

import type { PlayerState } from '../usePlayer';
import type { View, DetailTarget } from '../EchoApp';
import { seedPlaylists } from '@/data/demos/music-player';
import { MediaCard } from '../MediaCard';

interface Props {
  player: PlayerState;
  navigate: (v: View, target?: DetailTarget) => void;
}

export function PlaylistsView({ player, navigate }: Props) {
  return (
    <div className="px-4 pt-4 sm:px-6 lg:px-8">
      <h1 className="mb-5 text-2xl font-bold text-white">Playlists</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {seedPlaylists.map((pl) => (
          <MediaCard
            key={pl.id}
            artwork={pl.artwork}
            title={pl.title}
            subtitle={`${pl.trackIds.length} tracks`}
            onClick={() => navigate('playlist', { type: 'playlist', id: pl.id })}
            onPlay={() => player.playPlayable({ id: pl.id, trackIds: pl.trackIds, title: pl.title, subtitle: pl.description, artwork: pl.artwork, accent: pl.accent }, pl.trackIds[0])}
          />
        ))}
      </div>
    </div>
  );
}
