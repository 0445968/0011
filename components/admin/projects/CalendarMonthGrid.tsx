import Link from 'next/link';
import {calendarMonthCells} from '@/lib/calendar/month-grid';

export type CalendarGridItem={key:string;date:string;title:string;href:string;kind:string;detail?:string;color?:string};
const weekdays=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function EventLinks({items}:{items:CalendarGridItem[]}) {
  return <ul className="space-y-0.5">{items.map(item=><li key={item.key}>
    <Link href={item.href} title={`${item.kind}: ${item.title}${item.detail?` · ${item.detail}`:''}`} className="flex min-w-0 items-start gap-1 rounded px-1 py-0.5 text-[11px] leading-tight hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-xs">
      <span aria-hidden className="mt-0.5 h-2 w-2 shrink-0 rounded-sm border border-black/10 dark:border-white/20" style={{backgroundColor:item.color??'var(--muted-foreground)'}}/>
      <span className="min-w-0 break-words">{item.title}</span>
    </Link>
  </li>)}</ul>;
}

export function CalendarMonthGrid({month,today,items,overflowHref}:{month:string;today:string;items:CalendarGridItem[];overflowHref?:(date:string)=>string}) {
  const cells=calendarMonthCells(month);
  const byDate=new Map<string,CalendarGridItem[]>();
  for(const item of items){const rows=byDate.get(item.date)??[];rows.push(item);byDate.set(item.date,rows);}
  return <div className="overflow-hidden rounded-xl border border-border bg-card" aria-label={`${month} calendar grid`}>
    <div role="grid" aria-label={`${month} dates`}>
      <div role="row" className="grid grid-cols-7 border-b border-border bg-muted/30">{weekdays.map(day=><div role="columnheader" key={day} className="px-1 py-2 text-center text-[9px] font-semibold text-muted-foreground sm:px-2 sm:text-[11px]">{day}</div>)}</div>
      {Array.from({length:cells.length/7},(_,weekIndex)=>cells.slice(weekIndex*7,weekIndex*7+7)).map((week,weekIndex)=><div role="row" key={weekIndex} className="grid grid-cols-7">
      {week.map(cell=>{
        const rows=byDate.get(cell.date)??[];
        const visible=rows.slice(0,2),extra=rows.slice(2);
        const dayNumber=String(Number(cell.date.slice(-2)));
        return <div role="gridcell" aria-label={`${cell.date}${rows.length?`, ${rows.length} events`:''}`} key={cell.date} className={`min-w-0 min-h-[82px] border-b border-r border-border/70 p-1 last:border-r-0 sm:min-h-[116px] sm:p-1.5 ${cell.inMonth?'bg-card':'bg-muted/20 text-muted-foreground'} ${cell.date===today?'ring-2 ring-inset ring-primary/50':''}`}>
          <div className="mb-1 flex items-center justify-between gap-1"><time dateTime={cell.date} className={`text-[10px] font-medium tabular-nums sm:text-xs ${cell.date===today?'flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-primary-foreground':''}`}>{dayNumber}</time>{rows.length>0&&<span className="text-[8px] text-muted-foreground sm:hidden">{rows.length}</span>}</div>
          <div className="hidden sm:block"><EventLinks items={visible}/>{extra.length>0&&<details className="mt-0.5"><summary className="cursor-pointer px-1 text-[9px] font-medium text-muted-foreground hover:text-foreground">+{extra.length} more</summary><div className="mt-1 max-h-40 overflow-y-auto"><EventLinks items={extra}/></div></details>}</div>
          {rows.length>0&&<details className="sm:hidden"><summary className="cursor-pointer text-[10px] text-muted-foreground">View {rows.length} events</summary><div className="mt-1 max-h-48 overflow-y-auto rounded-md border border-border bg-background p-0.5"><EventLinks items={rows}/>{overflowHref&&<Link href={overflowHref(cell.date)} className="block p-1 text-[11px] font-medium underline">Open day list</Link>}</div></details>}
          {overflowHref&&rows.length>2&&<Link href={overflowHref(cell.date)} className="hidden text-[9px] font-medium text-primary underline sm:block">Open all {rows.length}</Link>}
        </div>;
      })}
      </div>)}
    </div>
  </div>;
}
