import type {ReactNode} from 'react';

/** Shared visual language for staff-only Projects surfaces. */
export function ProjectPageHeader({eyebrow,title,description,action,compact=false}: {
  eyebrow?:string;title:string;description?:string;action?:ReactNode;compact?:boolean;
}) {
  return <header className="flex min-w-0 flex-wrap items-end justify-between gap-3">
    <div className="min-w-0">{eyebrow&&<p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{eyebrow}</p>}
      <h1 className={compact?"sr-only":"mt-0.5 break-words font-heading text-xl font-semibold tracking-tight sm:text-2xl"}>{title}</h1>
      {description&&<p className="mt-1 max-w-3xl text-xs text-muted-foreground">{description}</p>}
    </div>{action&&<div className="flex flex-wrap items-center gap-2">{action}</div>}
  </header>;
}

export function ProjectPanel({title,description,action,children,className=''}:{
  title:string;description?:string;action?:ReactNode;children:ReactNode;className?:string;
}) {
  return <section className={`min-w-0 overflow-hidden rounded-xl bg-card ${className}`}>
    <header className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 px-3 py-2">
      <div className="min-w-0"><h2 className="text-sm font-semibold">{title}</h2>{description&&<p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>}</div>{action}
    </header>{children}
  </section>;
}

export function ProjectMetric({label,value,detail}:{label:string;value:ReactNode;detail?:ReactNode}) {
  return <div className="min-w-0 rounded-lg bg-muted/30 px-3 py-2">
    <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
    <p className="mt-0.5 text-lg font-semibold tabular-nums">{value}</p>
    {detail&&<p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{detail}</p>}
  </div>;
}

export function ProjectFeedback({kind='status',children}:{kind?:'status'|'error'|'saving';children:ReactNode}) {
  return <p role={kind==='error'?'alert':'status'} className={`rounded-lg border px-3 py-2 text-xs ${kind==='error'?'border-destructive/40 bg-destructive/5 text-destructive':kind==='saving'?'border-border bg-muted/30 text-muted-foreground':'border-border bg-card text-foreground'}`}>{children}</p>;
}

export const projectControlClass='inline-flex min-h-8 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';
