import { ArrowRight, CalendarClock, CircleDollarSign, Clock3, TriangleAlert, UserRoundPlus } from 'lucide-react';
import type { BusinessView } from '../BusinessFinanceApp';
import { company, reportCards, schedule, timeOffRequests } from '../mockData';
import { Card, SectionTitle, StatusPill } from '../ui';

export function OverviewView({ onNavigate }: { onNavigate: (view: BusinessView) => void }) {
  const pending = timeOffRequests.filter((request) => request.status === 'Pending').length;
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Next payroll" value="$92.5k" sub={`${company.period} · ${company.nextPayDate}`} icon={<CircleDollarSign size={17} />} tone="green" />
        <Metric label="Active employees" value="48" sub="2 added this month" icon={<UserRoundPlus size={17} />} tone="blue" />
        <Metric label="Open time-off requests" value={String(pending)} sub="Awaiting approval" icon={<CalendarClock size={17} />} tone="yellow" />
        <Metric label="Timecard exceptions" value="1" sub="Needs review before payroll" icon={<TriangleAlert size={17} />} tone="red" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.9fr]">
        <Card className="p-5 md:p-6">
          <SectionTitle eyebrow="This pay period" title="Payroll readiness" action={<button onClick={() => onNavigate('payroll')} className="text-xs font-medium text-[#baf56c]">Open payroll</button>} />
          <div className="grid gap-3 md:grid-cols-3">
            <ReadinessItem number="01" title="Timecards" detail="47 of 48 ready" tone="yellow" />
            <ReadinessItem number="02" title="Changes" detail="2 compensation updates" tone="green" />
            <ReadinessItem number="03" title="Approval" detail="Ready after 1 review" tone="green" />
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-[#081a2f] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Estimated debit</p>
                <p className="mt-1 text-xs text-white/40">Payroll, employer taxes, benefits, and deductions</p>
              </div>
              <p className="text-2xl font-semibold tracking-tight text-white">$112,620.90</p>
            </div>
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <SectionTitle eyebrow="Approvals" title="Needs your attention" />
          <div className="space-y-3">
            <Attention title="Jordan Brooks" detail="4-day vacation request" label="Review" tone="yellow" />
            <Attention title="Camille Foster" detail="Missing clock-out · Aug 26" label="Fix" tone="red" />
            <Attention title="Q3 Form 941" detail="Draft filing ready to review" label="Review" tone="green" />
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Card className="p-5 md:p-6">
          <SectionTitle eyebrow="Week of Aug 31" title="Schedule coverage" action={<button onClick={() => onNavigate('time')} className="text-xs font-medium text-[#baf56c]">View schedule</button>} />
          <div className="grid grid-cols-7 gap-2">
            {schedule.map((day) => (
              <div key={day.day} className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-center">
                <p className="text-[11px] text-white/40">{day.day}</p>
                <p className="mt-2 text-lg font-semibold text-white">{day.shifts}</p>
                <p className="text-[10px] text-white/35">shifts</p>
                <div className={`mx-auto mt-3 h-1.5 w-8 rounded-full ${day.coverage === 'Tight' ? 'bg-[#ffd34d]' : 'bg-[#a9f04d]'}`} />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <SectionTitle eyebrow="Monthly snapshot" title="Business labor metrics" />
          <div className="grid grid-cols-2 gap-3">
            {reportCards.map((card) => (
              <div key={card.label} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <p className="text-xs text-white/40">{card.label}</p>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <p className="text-xl font-semibold text-white">{card.value}</p>
                  <StatusPill tone={card.tone as 'green' | 'yellow' | 'red'}>{card.change}</StatusPill>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}

function Metric({ label, value, sub, icon, tone }: { label: string; value: string; sub: string; icon: React.ReactNode; tone: 'green' | 'yellow' | 'red' | 'blue' }) {
  const tones = { green: 'text-[#baf56c]', yellow: 'text-[#ffd96a]', red: 'text-[#ff8b86]', blue: 'text-[#7db7ff]' };
  return (
    <Card className="p-4 md:p-5">
      <div className={`mb-5 ${tones[tone]}`}>{icon}</div>
      <p className="text-xs text-white/40">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-[11px] text-white/35">{sub}</p>
    </Card>
  );
}

function ReadinessItem({ number, title, detail, tone }: { number: string; title: string; detail: string; tone: 'yellow' | 'green' }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-center justify-between"><span className="text-[10px] text-white/25">{number}</span><div className={`h-2 w-2 rounded-full ${tone === 'green' ? 'bg-[#a9f04d]' : 'bg-[#ffd34d]'}`} /></div>
      <p className="mt-5 text-sm font-medium text-white">{title}</p>
      <p className="mt-1 text-xs text-white/40">{detail}</p>
    </div>
  );
}

function Attention({ title, detail, label, tone }: { title: string; detail: string; label: string; tone: 'green' | 'yellow' | 'red' }) {
  return (
    <button className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] p-3 text-left transition hover:bg-white/[0.05]">
      <div><p className="text-sm font-medium text-white">{title}</p><p className="mt-1 text-xs text-white/40">{detail}</p></div>
      <div className="flex items-center gap-2"><StatusPill tone={tone}>{label}</StatusPill><ArrowRight size={14} className="text-white/30" /></div>
    </button>
  );
}
