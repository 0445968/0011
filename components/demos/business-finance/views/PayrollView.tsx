import { Check, ChevronRight, CircleDollarSign } from 'lucide-react';
import { company, payrollHistory, payrollRows } from '../mockData';
import { Card, SectionTitle, StatusPill } from '../ui';

export function PayrollView({ payrollStatus, onRunPayroll }: { payrollStatus: string; onRunPayroll: () => void }) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="border-b border-white/10 p-5 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <StatusPill tone={payrollStatus === 'Scheduled' ? 'green' : 'yellow'}>{payrollStatus}</StatusPill>
              <h2 className="mt-4 text-2xl font-semibold text-white">Payroll for {company.period}</h2>
              <p className="mt-1 text-sm text-white/40">Pay date {company.nextPayDate} · 48 employees</p>
            </div>
            <button onClick={onRunPayroll} className="rounded-xl bg-[#a9f04d] px-4 py-2.5 text-sm font-semibold text-[#071426] transition hover:bg-[#b8f66d]">
              {payrollStatus === 'Scheduled' ? 'Payroll scheduled' : 'Review & run payroll'}
            </button>
          </div>
        </div>
        <div className="grid md:grid-cols-4">
          {payrollRows.map((row, index) => (
            <div key={row.label} className={`p-5 ${index < payrollRows.length - 1 ? 'border-b border-white/10 md:border-b-0 md:border-r' : ''}`}>
              <p className="text-xs text-white/35">{row.label}</p>
              <p className="mt-2 text-xl font-semibold text-white">{row.value}</p>
            </div>
          ))}
        </div>
      </Card>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <Card className="p-5 md:p-6">
          <SectionTitle eyebrow="Checklist" title="Payroll readiness" />
          <div className="space-y-2">
            {[
              ['Employee changes', '2 updates included', true],
              ['Timecards', '47 of 48 approved', false],
              ['Benefits & deductions', 'All synced', true],
              ['Tax setup', 'No issues found', true],
            ].map(([title, detail, done]) => (
              <div key={String(title)} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.025] p-4">
                <div><p className="text-sm font-medium text-white">{title}</p><p className="mt-1 text-xs text-white/40">{detail}</p></div>
                <div className={`grid h-7 w-7 place-items-center rounded-full ${done ? 'bg-[#a9f04d]/15 text-[#baf56c]' : 'bg-[#ffd34d]/15 text-[#ffd96a]'}`}>{done ? <Check size={15} /> : <span className="text-xs">1</span>}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <SectionTitle eyebrow="Funding" title="Payroll account" />
          <div className="rounded-xl border border-white/10 bg-[#081a2f] p-5">
            <CircleDollarSign size={20} className="text-[#7db7ff]" />
            <p className="mt-6 text-xs text-white/35">Available balance</p>
            <p className="mt-1 text-2xl font-semibold text-white">$286,420.18</p>
            <p className="mt-2 text-xs text-[#baf56c]">Sufficient for next payroll</p>
          </div>
        </Card>
      </section>

      <Card className="p-5 md:p-6">
        <SectionTitle eyebrow="History" title="Recent payrolls" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead><tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.14em] text-white/30"><th className="pb-3 font-medium">Pay date</th><th className="pb-3 font-medium">Period</th><th className="pb-3 font-medium">Employees</th><th className="pb-3 font-medium">Total debit</th><th className="pb-3 font-medium">Status</th><th /></tr></thead>
            <tbody>{payrollHistory.map((row) => <tr key={row.date} className="border-b border-white/[0.06] text-sm last:border-0"><td className="py-4 text-white">{row.date}</td><td className="py-4 text-white/50">{row.period}</td><td className="py-4 text-white/50">{row.employees}</td><td className="py-4 text-white">{row.total}</td><td className="py-4"><StatusPill tone="green">{row.status}</StatusPill></td><td className="py-4 text-right text-white/25"><ChevronRight size={16} /></td></tr>)}</tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
