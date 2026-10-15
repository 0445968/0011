'use client';

import {createContext, useContext} from 'react';
import type {WorkspaceDensity} from './WorkspaceMenuBar';

type WorkspacePreferences = {
  density: WorkspaceDensity;
  changeDensity: (value: WorkspaceDensity) => void;
  collapsed: boolean;
  toggleSidebar: () => void;
  showTabs: boolean;
  changeShowTabs: (value: boolean) => void;
};

export const WorkspacePreferencesContext = createContext<WorkspacePreferences | null>(null);

export function useWorkspacePreferences() {
  const value = useContext(WorkspacePreferencesContext);
  if (!value) throw new Error('Workspace preferences require the staff workspace.');
  return value;
}
