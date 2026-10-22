/** Invalidate mounted readers even when a sidecar command does not change project.revision. */
export const projectMutationEvent='bivi:project-mutation';
export function refreshProjectSurfaces(id:string,router:{refresh:()=>void}){
  window.dispatchEvent(new CustomEvent(projectMutationEvent,{detail:{projectId:id}}));
  router.refresh();
}
