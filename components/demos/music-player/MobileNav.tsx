'use client';

import { Home, Search, Library, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { View, DetailTarget } from './EchoApp';
import type { PlayerState } from './usePlayer';

interface Props {
  view: View;
  navigate: (v: View, target?: DetailTarget) => void;
  player: PlayerState;
}

export function MobileNav({ view, navigate }: Props) {
  const items: { id: View; label: string; icon: typeof Home }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'liked', label: 'Liked', icon: Heart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-white/5 bg-[#0d0d10] px-2 py-1.5 lg:hidden">
      {items.map((item) => {
        const active = view === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 rounded-md py-1.5 text-[10px] font-medium transition-colors',
              active ? 'text-white' : 'text-[#71717a]'
            )}
          >
            <Icon size={20} className={cn(item.id === 'liked' && active && 'fill-[#1db954] text-[#1db954]')} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
