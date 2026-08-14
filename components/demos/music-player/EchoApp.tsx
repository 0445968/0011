'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePlayer } from './usePlayer';
import { Sidebar } from './Sidebar';
import { PlaybackBar } from './PlaybackBar';
import { NowPlayingView } from './NowPlayingView';
import { QueuePanel } from './QueuePanel';
import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { LibraryView } from './views/LibraryView';
import { LikedSongsView } from './views/LikedSongsView';
import { PlaylistsView } from './views/PlaylistsView';
import { AlbumDetailView } from './views/AlbumDetailView';
import { PlaylistDetailView } from './views/PlaylistDetailView';
import { ArtistDetailView } from './views/ArtistDetailView';
import { MobileNav } from './MobileNav';

export type View =
  | 'home'
  | 'search'
  | 'library'
  | 'liked'
  | 'playlists'
  | 'album'
  | 'playlist'
  | 'artist';

export interface DetailTarget {
  type: 'album' | 'playlist' | 'artist';
  id: string;
}

export function EchoApp() {
  const player = usePlayer();
  const [view, setView] = useState<View>('home');
  const [detail, setDetail] = useState<DetailTarget | null>(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);

  const navigate = useCallback((v: View, target?: DetailTarget) => {
    if (target) {
      setDetail(target);
    } else {
      setDetail(null);
    }
    setView(v);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (nowPlayingOpen || queueOpen) return; // don't interfere with overlays

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          player.togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          player.seek(player.progress + 5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          player.seek(player.progress - 5);
          break;
        case 'KeyM':
          player.toggleMute();
          break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [player, nowPlayingOpen, queueOpen]);

  const renderView = () => {
    if (view === 'album' && detail?.type === 'album') {
      return <AlbumDetailView player={player} albumId={detail.id} navigate={navigate} />;
    }
    if (view === 'playlist' && detail?.type === 'playlist') {
      return <PlaylistDetailView player={player} playlistId={detail.id} navigate={navigate} />;
    }
    if (view === 'artist' && detail?.type === 'artist') {
      return <ArtistDetailView player={player} artistId={detail.id} navigate={navigate} />;
    }
    switch (view) {
      case 'home': return <HomeView player={player} navigate={navigate} />;
      case 'search': return <SearchView player={player} navigate={navigate} />;
      case 'library': return <LibraryView player={player} navigate={navigate} />;
      case 'liked': return <LikedSongsView player={player} navigate={navigate} />;
      case 'playlists': return <PlaylistsView player={player} navigate={navigate} />;
      default: return <HomeView player={player} navigate={navigate} />;
    }
  };

  return (
    <div className="flex h-screen flex-col bg-[#0a0a0c] text-[#e5e5e5]">
      {/* Main layout: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar
          view={view}
          navigate={navigate}
          player={player}
        />

        {/* Content area */}
        <main className="flex-1 overflow-y-auto pb-32 lg:pb-28">
          <div className="min-h-full">
            {renderView()}
          </div>
        </main>

        {/* Queue panel (desktop) */}
        <QueuePanel
          player={player}
          open={queueOpen}
          onClose={() => setQueueOpen(false)}
        />
      </div>

      {/* Persistent playback bar */}
      <PlaybackBar
        player={player}
        onOpenQueue={() => setQueueOpen((v) => !v)}
        onExpand={() => setNowPlayingOpen(true)}
      />

      {/* Expanded now playing overlay */}
      <NowPlayingView
        player={player}
        open={nowPlayingOpen}
        onClose={() => setNowPlayingOpen(false)}
        onOpenQueue={() => { setNowPlayingOpen(false); setQueueOpen(true); }}
      />

      {/* Mobile bottom nav */}
      <MobileNav view={view} navigate={navigate} player={player} />
    </div>
  );
}
