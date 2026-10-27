export const operationalStatuses = ['active','on_hold','waiting_on_client','inactive','completed'] as const;
export type OperationalStatus = typeof operationalStatuses[number];
export const operationalStatusLabels: Record<OperationalStatus,string> = {
  active:'Active', on_hold:'On hold', waiting_on_client:'Waiting on client', inactive:'Inactive', completed:'Completed',
};
export const operationalStatusStyles: Record<OperationalStatus,string> = {
  active:'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200',
  on_hold:'border-orange-300 bg-orange-50 text-orange-800 dark:border-orange-700 dark:bg-orange-950 dark:text-orange-200',
  waiting_on_client:'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200',
  inactive:'border-border bg-muted text-muted-foreground',
  completed:'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200',
};
export function operationalStatusFor(executionState:string, saved?:string|null): OperationalStatus {
  if(executionState==='completed') return 'completed';
  if(saved&&operationalStatuses.includes(saved as OperationalStatus)) return saved as OperationalStatus;
  return executionState==='on_hold'?'on_hold':'active';
}
