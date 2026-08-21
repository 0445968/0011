import {
    HelpCenterHero,
  } from '@/components/help-center/HelpCenterHero';
  
  import {
    HelpShortcutRow,
  } from '@/components/help-center/HelpShortcutRow';
  
  import {
    HelpTopicGrid,
  } from '@/components/help-center/HelpTopicGrid';
  
  import {
    RecommendedGuides,
  } from '@/components/help-center/RecommendedGuides';
  
  import {
    RecommendedTools,
  } from '@/components/help-center/RecommendedTools';
  
  import {
    HelpFaqPreview,
  } from '@/components/help-center/HelpFaqPreview';
  
  import {
    HelpContactCTA,
  } from '@/components/help-center/HelpContactCTA';
  
  export default function HelpPage() {
    return (
      <main className="min-h-screen bg-background">
        <HelpCenterHero />
        <HelpTopicGrid />
  
        <HelpFaqPreview />
  
        <HelpContactCTA />
      </main>
    );
  }