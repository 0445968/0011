import type { Metadata } from 'next';

import { Collaboration } from '@/components/process/Collaboration';
import { Deliverables } from '@/components/process/Deliverables';
import { FeedbackSection } from '@/components/process/FeedbackSection';
import { ProcessCTA } from '@/components/process/ProcessCTA';
import { ProcessJourney } from '@/components/process/ProcessJourney';
import { ProcessTimelines } from '@/components/process/ProcessTimelines';
import { ProjectRoadmap } from '@/components/process/ProjectRoadmap';
import { TimelineFactors } from '@/components/process/TimelineFactors';

export const metadata: Metadata = {
  title: 'Our Process',
  description:
    'See how Bivi approaches brand strategy, identity, and launch projects for small businesses and growing teams.',
};

export default function ProcessPage() {
  return (
    <>
      {/* ------------------------------------------------------------ */}
      {/* Process hero                                                 */}
      {/* ------------------------------------------------------------ */}

      <ProcessJourney />

      {/* ------------------------------------------------------------ */}
      {/* Project timelines                                            */}
      {/* ------------------------------------------------------------ */}

      <ProcessTimelines />

      {/* ------------------------------------------------------------ */}
      {/* Timeline factors                                             */}
      {/* ------------------------------------------------------------ */}

      <TimelineFactors />

      {/* ------------------------------------------------------------ */}
      {/* Example roadmap                                              */}
      {/* ------------------------------------------------------------ */}

      <ProjectRoadmap />

      {/* ------------------------------------------------------------ */}
      {/* Collaboration                                                */}
      {/* ------------------------------------------------------------ */}

      <Collaboration />

      {/* ------------------------------------------------------------ */}
      {/* Feedback                                                     */}
      {/* ------------------------------------------------------------ */}

      <ProcessCTA />
    </>
  );
}