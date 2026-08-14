import type { Metadata } from 'next';
import { ColorPaletteGenerator } from '@/components/portfolio/ColorPaletteGenerator';

export const metadata: Metadata = {
  title: 'Color Palette Generator',
  description:
    'Free interactive color palette generator with live WCAG contrast checking, lockable swatches, and CSS variable export.',
};

export default function ColorToolPage() {
  return <ColorPaletteGenerator />;
}
