'use client';

interface ResultsStripProps {
  results: {
    label: string;
    value: string;
  }[];
}

export function ResultsStrip({
  results,
}: ResultsStripProps) {
  return (
    <div className="grid grid-cols-3 gap-3">

      {results.slice(0, 3).map((result) => (

        <div
          key={result.label}
          className="
            rounded-2xl
            border border-border
            px-4 py-4
          "
        >

          <p className="font-serif text-2xl font-semibold text-[accent]">
            {result.value}
          </p>


          <p className="
            mt-1
            text-[10px]
            uppercase
            tracking-widest
            text-muted-foreground
          ">
            {result.label}
          </p>

        </div>

      ))}

    </div>
  );
}