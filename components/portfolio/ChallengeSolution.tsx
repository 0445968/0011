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
    <div
      className="
        mt-5
        overflow-hidden
        rounded-2xl
        border
        border-border
      "
    >
      {/* Challenge */}

      <div
        className="
          border-b
          border-border
          px-5
          py-4
        "
      >
        <p
          className="
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-accent
          "
        >
          Challenge
        </p>

        <p
          className="
            mt-2
            text-[13px]
            leading-[20px]
            text-muted-foreground
            md:text-[14px]
            md:leading-[21px]
          "
        >
          {challenge}
        </p>
      </div>

      {/* Solution */}

      <div
        className="
          px-5
          py-4
        "
      >
        <p
          className="
            text-[9px]
            font-semibold
            uppercase
            tracking-[0.18em]
            text-accent
          "
        >
          Solution
        </p>

        <p
          className="
            mt-2
            text-[13px]
            leading-[20px]
            text-muted-foreground
            md:text-[14px]
            md:leading-[21px]
          "
        >
          {solution}
        </p>
      </div>
    </div>
  );
}