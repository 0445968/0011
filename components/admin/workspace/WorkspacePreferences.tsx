'use client';

import {createContext, useContext} from 'react';
import type {WorkspaceRecordKind} from '@/lib/admin/workspace/navigation';
import type {WorkspaceDensity} from './WorkspaceMenuBar';

type WorkspacePreferences = {
  density: WorkspaceDensity;
  changeDensity: (value: WorkspaceDensity) => void;
  collapsed: boolean;
  toggleSidebar: () => void;
  showMenuBar:boolean; changeShowMenuBar:(value:boolean)=>void;
  showRecordNavigation:boolean; changeShowRecordNavigation:(value:boolean)=>void;
  sidebarRecords:Partial<Record<WorkspaceRecordKind,boolean>>;
  changeSidebarRecords:(kind:WorkspaceRecordKind,show:boolean)=>void;
  showTabs: boolean;
  changeShowTabs: (value: boolean) => void;
};

export const WorkspacePreferencesContext = createContext<WorkspacePreferences | null>(null);

export function useWorkspacePreferences() {
  const value = useContext(WorkspacePreferencesContext);
  if (!value) throw new Error('Workspace preferences require the staff workspace.');
  return value;
}
