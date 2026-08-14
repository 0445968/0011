'use client';

import { useCallback } from 'react';
import { LabShell } from './LabShell';
import { AssessmentRunner } from './AssessmentRunner';
import type { LabItem } from '@/data/studio-lab/registry';
import type { AssessmentDefinition } from '@/data/studio-lab/assessments/types';

interface Props {
  item: LabItem;
  definition: AssessmentDefinition;
}

export function AssessmentView({ item, definition }: Props) {
  const handleReset = useCallback(() => {
    if (definition.persistKey) {
      try { localStorage.removeItem(definition.persistKey); } catch { /* ignore */ }
    }
  }, [definition.persistKey]);

  return (
    <LabShell item={item} onReset={handleReset}>
      <AssessmentRunner assessment={definition} />
    </LabShell>
  );
}
