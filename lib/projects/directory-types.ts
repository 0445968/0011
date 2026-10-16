import type { ProjectPhase } from './lifecycle-schema';
import type { DirectoryTaskPhase } from './directory-progress';
export interface ProjectDirectoryContext {
  company: { id: string; name: string; logoPath: string | null } | null;
  selectedPhase: ProjectPhase | null;
  taskPhases: DirectoryTaskPhase[];
}
export type ProjectDirectoryMode = 'table' | 'cards' | 'grouped';
export function validDirectoryMode(value: unknown): ProjectDirectoryMode {
  return value === 'cards' || value === 'grouped' ? value : 'table';
}
