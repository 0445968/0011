import {
  Home,
  Utensils,
  Car,
  ShoppingBag,
  Film,
  Zap,
  Heart,
  Plane,
  TrendingUp,
  Tag,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { Category } from '@/data/demos/finance-dashboard';

const iconMap: Record<string, ComponentType<LucideProps>> = {
  home: Home,
  utensils: Utensils,
  car: Car,
  shopping: ShoppingBag,
  film: Film,
  zap: Zap,
  heart: Heart,
  plane: Plane,
  'trending-up': TrendingUp,
  tag: Tag,
};

export function categoryIcon(iconKey: string): ComponentType<LucideProps> {
  return iconMap[iconKey] ?? Tag;
}
