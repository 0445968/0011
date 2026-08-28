import { CalendarPlus, Clock3 } from 'lucide-react';
import { schedule, timecards } from '../mockData';
import { Card, SectionTitle, StatusPill } from '../ui';

export function TimeView() {
  return (
    <div className="space-y-6">
      <Card className="p-5 md:p-6">
        <SectionTitle eyebrow="Week of Aug 31" title="Team schedule" action={<button className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#071426]"><CalendarPlus size={14} />Add shift</button>} />
        <div className="grid gap-3 md:grid-cols-7">
          {schedule.map((day) => (
            <div key={day.day} className="min-h-40 rounded-xl border border-white/10 bg-white/[0.025] p-3">
              <p className="text-xs font-medium text-white">{day.day}</p><p className="mt-1 text-[10px] text-white/35">{day.hours} scheduled hrs</p>
              <div className="mt-5 space-y-2">{Array.from({ length: Math.min(3, Math.ceil(day.shifts / 4)) }).map((_, index) => <div key={index} className={`h-8 rounded-lg border px-2 py-2 text-[9px] ${day.coverage === 'Tight' && index === 0 ? 'border-[#ffd34d]/30 bg-[#ffd34d]/10 text-[#ffd96a]' : 'border-[#7db7ff]/20 bg-[#7db7ff]/10 text-[#9cc8ff]'}`}>{index === 0 ? 'Retail' : index === 1 ? 'Fulfillment' : 'Operations'}</div>)}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <SectionTitle eyebrow="Current pay period" title="Timecards" />
        <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left"><thead><tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.14em] text-white/30"><th className="pb-3 font-medium">Employee</th><th className="pb-3 font-medium">Regular hours</th><th className="pb-3 font-medium">Overtime</th><th className="pb-3 font-medium">Status</th></tr></thead><tbody>{timecards.map((row) => <tr key={row.employee} className="border-b border-white/[0.06] last:border-0"><td className="py-4 text-sm text-white">{row.employee}</td><td className="py-4 text-sm text-white/55">{row.hours}</td><td className="py-4 text-sm text-white/55">{row.overtime}</td><td className="py-4"><StatusPill tone={row.status === 'Ready' ? 'green' : 'red'}>{row.status}</StatusPill></td></tr>)}</tbody></table></div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-[#081a2f] p-3 text-xs text-white/45"><Clock3 size={14} className="text-[#ffd96a]" />One exception must be resolved before payroll can be finalized.</div>
      </Card>
    </div>
  );
}
