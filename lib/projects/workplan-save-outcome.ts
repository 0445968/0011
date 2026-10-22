import type { ProjectBody } from './schema';

export type ProjectSaveOutcome =
  | { kind: 'saved'; revision: number; body?: ProjectBody; refreshWarning?: string }
  | { kind: 'revision_conflict'; error: string }
  | { kind: 'validation_rejected'; code: string; error: string; blockers: unknown[] }
  | { kind: 'rejected'; error: string; code?: string }
  | { kind: 'unknown'; error: string };

/** Interpret domain result codes, never HTTP status alone, as the save outcome. */
export function interpretProjectSaveOutcome(status: number, payload: Record<string, unknown>): ProjectSaveOutcome {
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
    };
  }
  if (status >= 500 || (status >= 200 && status < 300)) return { kind: 'unknown', error: typeof payload.error === 'string' ? payload.error : 'The save outcome could not be confirmed.' };
  return { kind: 'rejected', error: typeof payload.error === 'string' ? payload.error : 'The project save was rejected.', code: typeof payload.code === 'string' ? payload.code : undefined };
}
