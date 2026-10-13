
type InquiryStatus =
  | 'new'
  | 'qualified'
  | 'declined';

type ProjectStatus =
  | 'active'
  | 'on_hold'
  | 'completed';

type Props =
  | {
      kind: 'inquiry';
      status: InquiryStatus;
    }
  | {
      kind: 'project';
      status: ProjectStatus;
    };

const inquiryStyles = {
  new: {
    label: 'New',
    color: '#6D28D9',
  },
  qualified: {
    label: 'Qualified',
    color: '#1D4ED8',
  },
  declined: {
    label: 'Declined',
    color: '#475569',
  },
};

const projectStyles = {
  active: {
    label: 'Active',
    color: '#166534',
  },
  on_hold: {
    label: 'On hold',
    color: '#92400E',
  },
  completed: {
    label: 'Completed',
    color: '#334155',
  },
};

export function WorkspaceStatusBadge(props: Props) {
  const style =
    props.kind === 'inquiry'
      ? inquiryStyles[props.status]
      : projectStyles[props.status];

  return (
    <span
      className="
        inline-flex
        w-fit
        items-center
        gap-1.5
        whitespace-nowrap
        rounded-full
        px-3
        py-1.5
        text-[11px]
        font-semibold
        leading-none
      "
      style={{
        backgroundColor: style.color,
        color: '#FFFFFF',
      }}
    >
      <span
        aria-hidden="true"
        className="
          h-1.5
          w-1.5
          shrink-0
          rounded-full
          bg-white/90
        "
      />

      {style.label}
    </span>
  );
}
