import type { ProjectBody } from './schema';

export type ProjectWorkflowGate = {
  type: 'task'; taskId: string; targetStatus: 'done'; gate: 'client_completion_review';
  title: string; requirement: string; correctiveActions: string[]; overrideAvailable: boolean;
};

export type ProjectSaveOutcome =
  | {kind:'approval_submitted';revision:number;body:ProjectBody;proposalIds:string[]}
  | { kind: 'saved'; revision: number; body?: ProjectBody; refreshWarning?: string }
  | { kind: 'revision_conflict'; error: string }
  | { kind: 'validation_rejected'; code: string; error: string; blockers: unknown[]; workflowGate?: ProjectWorkflowGate }
  | { kind: 'rejected'; error: string; code?: string }
  | { kind: 'unknown'; error: string };

/** Interpret domain result codes, never HTTP status alone, as the save outcome. */
export function interpretProjectSaveOutcome(status: number, payload: Record<string, unknown>): ProjectSaveOutcome {
  if(payload.submitted===true&&Number.isInteger(payload.revision)&&payload.body&&Array.isArray(payload.proposalIds))return {kind:'approval_submitted',revision:payload.revision as number,body:payload.body as ProjectBody,proposalIds:payload.proposalIds as string[]};
  if (payload.saved === true && Number.isInteger(payload.revision)) {
    return {
      kind: 'saved',
      revision: payload.revision as number,
      body: payload.body as ProjectBody | undefined,
      refreshWarning: typeof payload.refreshWarning === 'string' ? payload.refreshWarning : undefined,
    };
  }
  if (payload.code === 'revision_conflict') {
    return { kind: 'revision_conflict', error: typeof payload.error === 'string' ? payload.error : 'The project revision changed.' };
  }
  if (status === 422) {
    return {
      kind: 'validation_rejected',
      code: typeof payload.code === 'string' ? payload.code : 'validation_rejected',
      error: typeof payload.error === 'string' ? payload.error : 'Review the project validation errors.',
      blockers: Array.isArray(payload.blockers) ? payload.blockers : [],
      workflowGate: payload.workflowGate && typeof payload.workflowGate === 'object' ? payload.workflowGate as ProjectWorkflowGate : undefined,
    };
  }
  if (status >= 500 || (status >= 200 && status < 300)) return { kind: 'unknown', error: typeof payload.error === 'string' ? payload.error : 'The save outcome could not be confirmed.' };
  return { kind: 'rejected', error: typeof payload.error === 'string' ? payload.error : 'The project save was rejected.', code: typeof payload.code === 'string' ? payload.code : undefined };
}
