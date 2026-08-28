import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  FileText,
  LayoutDashboard,
  ReceiptText,
  Users,
  WalletCards,
} from 'lucide-react';
import type { BusinessView } from './BusinessFinanceApp';

const groups = [
  {
    label: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'payroll', label: 'Payroll', icon: WalletCards },
      { id: 'people', label: 'People & HR', icon: Users },
      { id: 'time', label: 'Time & scheduling', icon: Clock3 },
    ],
  },
  {
    label: 'Finance',
    items: [
      { id: 'tax', label: 'Tax & compliance', icon: ReceiptText },
      { id: 'documents', label: 'Documents', icon: FileText },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
    ],
  },
] as const;

export function Sidebar({ view, onChange }: { view: BusinessView; onChange: (view: BusinessView) => void }) {
  return (
    <aside className="hidden w-[248px] shrink-0 border-r border-white/10 bg-[#071426] px-4 py-5 lg:block">
      <div className="flex h-full min-h-[calc(100vh-40px)] flex-col">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#a9f04d] text-[#071426]">
            <BriefcaseBusiness size={18} strokeWidth={2.3} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Northstar</p>
            <p className="text-[11px] text-white/45">Business admin</p>
          </div>
        </div>

        <nav className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">{group.label}</p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = view === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onChange(item.id as BusinessView)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        active ? 'bg-white text-[#071426]' : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <Icon size={17} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-medium text-white/80">
            <CalendarDays size={15} className="text-[#ffd34d]" />
            Next payroll
          </div>
          <p className="text-lg font-semibold text-white">Sep 4</p>
          <p className="mt-1 text-xs text-white/45">48 employees · Biweekly</p>
        </div>
      </div>
    </aside>
  );
}
