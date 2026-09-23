'use client';

interface CalculatorFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  helperText?: string;
}

export function CalculatorField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  min,
  max,
  step = 0.01,
  helperText,
}: CalculatorFieldProps) {
  return (
    <label className="block">
      <span
        className="
          mb-2
          block
          text-sm
          font-medium
          text-foreground
        "
      >
        {label}
      </span>

      <div
        className="
          flex
          min-h-[52px]
          items-center
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-background
          transition-colors
          focus-within:border-foreground/40
          focus-within:ring-2
          focus-within:ring-ring/20
        "
      >
        {prefix && (
          <span
            className="
              flex
              self-stretch
              items-center
              border-r
              border-border
              bg-secondary/40
              px-4
              text-sm
              text-muted-foreground
            "
          >
            {prefix}
          </span>
        )}

        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          className="
            min-w-0
            flex-1
            bg-transparent
            px-4
            py-3.5
            text-base
            text-foreground
            outline-none
            placeholder:text-muted-foreground/50
          "
        />

        {suffix && (
          <span
            className="
              flex
              self-stretch
              items-center
              border-l
              border-border
              bg-secondary/40
              px-4
              text-sm
              text-muted-foreground
            "
          >
            {suffix}
          </span>
        )}
      </div>

      {helperText && (
        <span
          className="
            mt-2
            block
            text-xs
            leading-5
            text-muted-foreground
          "
        >
          {helperText}
        </span>
      )}
    </label>
  );
}