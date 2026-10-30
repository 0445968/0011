'use client';
import type {ProjectTaskControl} from '@/lib/projects/lifecycle-schema';
export function TaskReviewRequirements({control,disabled,onChange}:{control:ProjectTaskControl;disabled:boolean;onChange:(review:{requiresStaffReview:boolean;requiresClientReview:boolean})=>void}){
 return <section className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3" aria-label="Task review requirements">
  <p className="text-xs font-semibold">Completion review</p>
  {(control.ownerType==='bivi'||control.requiresStaffReview)&&<label className="flex min-h-9 items-center gap-2 text-xs"><input type="checkbox" checked={control.requiresStaffReview} disabled={disabled} onChange={event=>onChange({requiresStaffReview:event.target.checked,requiresClientReview:control.requiresClientReview})}/>Require Bivi review before completion</label>}
  {(control.ownerType==='client'||control.requiresClientReview)&&<label className="flex min-h-9 items-center gap-2 text-xs"><input type="checkbox" checked={control.requiresClientReview} disabled={disabled} onChange={event=>onChange({requiresStaffReview:control.requiresStaffReview,requiresClientReview:event.target.checked})}/>Require client review before completion</label>}
  <p className="text-[11px] text-muted-foreground">Changes stay in your task draft until Save task or Save all changes.</p>
 </section>;
}
