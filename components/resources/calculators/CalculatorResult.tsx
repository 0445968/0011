interface CalculatorResultProps {
  label: string;
  value: string;
  description?: string;
  items?: {
    label: string;
    value: string;
  }[];
}

export function CalculatorResult({
  label,
  value,
  description,
  items = [],
}: CalculatorResultProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p
        className="
          mt-2
          break-words
          font-heading
          text-4xl
          font-semibold
          tracking-[-0.04em]
          text-foreground
          sm:text-5xl
        "
      >
        {value}
      </p>

      {description && (
        <p
          className="
            mt-4
            max-w-sm
            text-sm
            leading-6
            text-muted-foreground
          "
        >
          {description}
        </p>
      )}

      {items.length > 0 && (
        <div
          className="
            mt-8
            divide-y
            divide-border
            border-t
            border-border
          "
        >
          {items.map((item) => (
            <div
              key={item.label}
              className="
                flex
                items-center
                justify-between
                gap-6
                py-4
              "
            >
              <span className="text-sm text-muted-foreground">
                {item.label}
              </span>

              <span
                className="
                  text-right
                  text-sm
                  font-semibold
                  text-foreground
                "
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}