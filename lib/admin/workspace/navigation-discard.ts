/** A failed persisted discard keeps navigation blocked and the remaining drafts intact. */
export async function discardWorkspaceEditors(editors:Iterable<{discard?:()=>Promise<unknown>}>){
  for(const editor of [...editors])await editor.discard?.();
}
