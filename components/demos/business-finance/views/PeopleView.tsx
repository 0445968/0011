import { Search, UserPlus } from 'lucide-react';
import { employees, type TimeOffRequest } from '../mockData';
import { Card, SectionTitle, StatusPill } from '../ui';

export function PeopleView({ requests, onRequestStatus }: { requests: TimeOffRequest[]; onRequestStatus: (id: number, status: 'Approved' | 'Declined') => void }) {
  return (
    <div className="space-y-6">
      <Card className="p-5 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <SectionTitle eyebrow="Directory" title="Employees" />
          <div className="flex gap-2"><button className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/55"><Search size={15} />Search</button><button className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-medium text-[#071426]"><UserPlus size={15} />Add employee</button></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead><tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.14em] text-white/30"><th className="pb-3 font-medium">Employee</th><th className="pb-3 font-medium">Department</th><th className="pb-3 font-medium">Pay type</th><th className="pb-3 font-medium">Compensation</th><th className="pb-3 font-medium">Status</th></tr></thead>
            <tbody>{employees.map((employee) => <tr key={employee.id} className="border-b border-white/[0.06] last:border-0"><td className="py-4"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#173b63] text-[10px] font-semibold text-white">{employee.initials}</span><div><p className="text-sm font-medium text-white">{employee.name}</p><p className="text-xs text-white/35">{employee.role}</p></div></div></td><td className="py-4 text-sm text-white/50">{employee.department}</td><td className="py-4 text-sm text-white/50">{employee.payType}</td><td className="py-4 text-sm text-white">{employee.pay}</td><td className="py-4"><StatusPill tone={employee.status === 'Active' ? 'green' : 'yellow'}>{employee.status}</StatusPill></td></tr>)}</tbody>
          </table>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <SectionTitle eyebrow="Approvals" title="Time off requests" />
        <div className="grid gap-3 xl:grid-cols-3">
          {requests.map((request) => (
            <div key={request.id} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#173b63] text-[10px] font-semibold text-white">{request.initials}</span><div><p className="text-sm font-medium text-white">{request.employee}</p><p className="text-xs text-white/35">{request.type}</p></div></div><StatusPill tone={request.status === 'Approved' ? 'green' : request.status === 'Declined' ? 'red' : 'yellow'}>{request.status}</StatusPill></div>
              <div className="mt-4 rounded-lg bg-[#081a2f] p-3"><p className="text-sm text-white">{request.dates}</p><p className="mt-1 text-xs text-white/35">{request.days} day{request.days > 1 ? 's' : ''}</p></div>
              {request.status === 'Pending' && <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => onRequestStatus(request.id, 'Declined')} className="rounded-lg border border-white/10 py-2 text-xs font-medium text-white/55 hover:bg-white/[0.04]">Decline</button><button onClick={() => onRequestStatus(request.id, 'Approved')} className="rounded-lg bg-[#a9f04d] py-2 text-xs font-semibold text-[#071426]">Approve</button></div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
