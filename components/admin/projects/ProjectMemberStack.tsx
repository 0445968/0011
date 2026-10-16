import { ProfileImage } from '@/components/profile-images/ProfileImage';
import type { ProjectRosterMember } from '@/lib/projects/overview-data';

/** Only displays verified staff assignments and active client project access. */
export function ProjectMemberStack({ members, max = 6, size = 'h-8 w-8' }: {
  members: ProjectRosterMember[];
  max?: number;
  size?: string;
}) {
  if (!members.length) return <span className="text-[11px] text-muted-foreground">No verified members listed</span>;
  const visible = members.slice(0, max);
  return <div className="flex items-center" aria-label="Project members">
    {visible.map(member => <span key={`${member.kind}:${member.id}`}
      title={`${member.name} · ${member.kind === 'staff' ? 'Bivi' : 'Client'}`}
      className="-ml-1.5 first:ml-0 rounded-full border-2 border-card focus-within:outline focus-within:outline-2 focus-within:outline-ring">
      <ProfileImage kind={member.kind} subject={member.id} name={member.name}
        path={member.avatarPath} size={size} />
    </span>)}
    {members.length > max && <span className="ml-1 text-xs text-muted-foreground"
      title={members.slice(max).map(member => member.name).join(', ')}>+{members.length - max}</span>}
  </div>;
}
