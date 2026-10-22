'use client';
import {createContext,useContext} from 'react';

export type ProjectEditingActions={editTask:(id:string)=>void;editMilestone:(id:string)=>void};
export const ProjectEditingContext=createContext<ProjectEditingActions|null>(null);
export const useProjectEditingActions=()=>useContext(ProjectEditingContext);
