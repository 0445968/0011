'use client';

interface ProjectItem {
  id: string;
  name: string;
}

interface ProjectNavigationProps {
  projects: ProjectItem[];
  current: number;
  onChange: (index: number) => void;
}

export function ProjectNavigation({
  projects,
  current,
  onChange,
}: ProjectNavigationProps) {
  return (
    <div className="mt-16 flex flex-wrap gap-3">

      {projects.map((project, index) => (

        <button
          key={project.id}
          onClick={() => onChange(index)}
          className={`rounded-full border px-5 py-3 text-sm transition ${
            current === index
              ? 'border-accent bg-[#BBFF1B] text-background'
              : 'border-border hover:bg-secondary'
          }`}
        >
          {project.name}
        </button>

      ))}

    </div>
  );
}