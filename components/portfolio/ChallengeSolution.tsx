'use client';

interface ChallengeSolutionProps {
  challenge: string;
  solution: string;
}

export function ChallengeSolution({
  challenge,
  solution,
}: ChallengeSolutionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">

      <div className="rounded-3xl border border-border p-8">

        <p className="text-xs uppercase tracking-widest text-accent">
          Challenge
        </p>

        <p className="mt-5 leading-relaxed">
          {challenge}
        </p>

      </div>


      <div className="rounded-3xl border border-border p-8">

        <p className="text-xs uppercase tracking-widest text-accent">
          Solution
        </p>

        <p className="mt-5 leading-relaxed">
          {solution}
        </p>

      </div>

    </div>
  );
}