'use client';

import { Home, Search, Library, Heart, ListMusic, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { View, DetailTarget } from './EchoApp';
import type { PlayerState } from './usePlayer';
import { seedPlaylists } from '@/data/demos/music-player';

interface Props {
  view: View;
  navigate: (v: View, target?: DetailTarget) => void;
  player: PlayerState;
}

const navItems: { id: View; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'search', label: 'Search', icon: Search },
  { id: 'library', label: 'Library', icon: Library },
];

export function Sidebar({ view, navigate, player }: Props) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/5 bg-[#0d0d10] lg:flex">
      {/* Top nav */}
      <nav className="p-3">
        {navItems.map((item) => {
          const active = view === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                'flex w-full items-center gap-3.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active ? 'bg-white/10 text-white' : 'text-[#a1a1aa] hover:text-white'
              )}
            >
              <Icon size={19} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Collections */}
      <div className="mt-2 border-t border-white/5 px-3 pt-3">
        <button
          onClick={() => navigate('liked')}
          className={cn(
            'flex w-full items-center gap-3.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            view === 'liked' ? 'bg-white/10 text-white' : 'text-[#a1a1aa] hover:text-white'
          )}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-gradient-to-br from-[#ec4899] to-[#6366f1]">
            <Heart size={14} className="fill-white text-white" />
          </span>
          Liked Songs
        </button>
        <button
          onClick={() => navigate('playlists')}
          className={cn(
            'flex w-full items-center gap-3.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            view === 'playlists' ? 'bg-white/10 text-white' : 'text-[#a1a1aa] hover:text-white'
          )}
        >
          <ListMusic size={19} />
          Playlists
        </button>
      </div>

      {/* Playlist list */}
      <div className="mt-3 flex-1 overflow-y-auto border-t border-white/5 px-3 pt-3">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-[#71717a]">
          Your Playlists
        </p>
        <div className="space-y-0.5">
          {seedPlaylists.map((pl) => (
            <button
              key={pl.id}
              onClick={() => navigate('playlist', { type: 'playlist', id: pl.id })}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-1.5 text-left text-sm text-[#a1a1aa] transition-colors hover:text-white"
            >
              <span
                className="h-8 w-8 shrink-0 rounded-sm"
                style={{ backgroundColor: pl.accent }}
              />
              <span className="truncate">{pl.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="border-t border-white/5 p-3">
        <button
          onClick={player.reset}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs font-medium text-[#71717a] transition-colors hover:text-white"
        >
          <RotateCcw size={14} />
          Reset demo
        </button>
      </div>
    </aside>
  );
}
