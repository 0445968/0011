import {
  Brain, Atom, Landmark, Globe, Film, Music, Cpu, Trophy, Palette, Utensils, Shuffle,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';

export const categoryIcons: Record<string, ComponentType<LucideProps>> = {
  'brain': Brain,
  'atom': Atom,
  'landmark': Landmark,
  'globe': Globe,
  'film': Film,
  'music': Music,
  'cpu': Cpu,
  'trophy': Trophy,
  'palette': Palette,
  'utensils': Utensils,
  'shuffle': Shuffle,
};
