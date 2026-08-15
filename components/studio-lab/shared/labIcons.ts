import {
  FileText, Share2, Palette, Clock, Calculator, Keyboard,
  Sparkles, Compass, Activity, Target, Mic, RefreshCw,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';

export const labIcons: Record<string, ComponentType<LucideProps>> = {
  'file-text': FileText,
  'share-2': Share2,
  'palette': Palette,
  'clock': Clock,
  'calculator': Calculator,
  'keyboard': Keyboard,
  'sparkles': Sparkles,
  'compass': Compass,
  'activity': Activity,
  'target': Target,
  'mic': Mic,
  'refresh-cw': RefreshCw,
};
