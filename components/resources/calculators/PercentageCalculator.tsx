'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

type PercentageMode =
  | 'percent-of'
  | 'what-percent'
  | 'increase'
  | 'decrease';

const modes: {
  id: PercentageMode;
  label: string;
}[] = [
    {
      id: 'percent-of',
      label: 'Percentage of a number',
    },
    {
      id: 'what-percent',
      label: 'What percentage?',
    },
    {
      id: 'increase',
      label: 'Percentage increase',
    },
    {
      id: 'decrease',
      label: 'Percentage decrease',
    },
  ];

function parseValue(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
}

export function PercentageCalculator() {
  const [mode, setMode] =
    useState<PercentageMode>('percent-of');

  const [firstValue, setFirstValue] =
    useState('25');

  const [secondValue, setSecondValue] =
    useState('200');

  const result = useMemo(() => {
    const first = parseValue(firstValue);
    const second = parseValue(secondValue);

    if (mode === 'percent-of') {
      const amount = (first / 100) * second;

      return {
        label: `${formatNumber(first)}% of ${formatNumber(second)}`,
        value: formatNumber(amount),
        description:
          'The percentage amount based on the values you entered.',
        items: [
          {
            label: 'Percentage',
            value: `${formatNumber(first)}%`,
          },
          {
            label: 'Number',
            value: formatNumber(second),
          },
        ],
      };
    }

    if (mode === 'what-percent') {
      const percentage =
        second === 0
          ? 0
          : (first / second) * 100;

      return {
        label: `${formatNumber(first)} is what percentage of ${formatNumber(second)}?`,
        value: `${formatNumber(percentage)}%`,
        description:
          'The first number expressed as a percentage of the second.',
        items: [
          {
            label: 'First number',
            value: formatNumber(first),
          },
          {
            label: 'Second number',
            value: formatNumber(second),
          },
        ],
      };
    }

    if (mode === 'increase') {
      const percentage =
        first === 0
          ? 0
          : ((second - first) / Math.abs(first)) * 100;

      return {
        label: 'Percentage increase',
        value: `${formatNumber(percentage)}%`,
        description:
          'The percentage change from the starting value to the new value.',
        items: [
          {
            label: 'Starting value',
            value: formatNumber(first),
          },
          {
            label: 'New value',
            value: formatNumber(second),
          },
          {
            label: 'Difference',
            value: formatNumber(second - first),
          },
        ],
      };
    }

    const percentage =
      first === 0
        ? 0
        : ((first - second) / Math.abs(first)) * 100;

    return {
      label: 'Percentage decrease',
      value: `${formatNumber(percentage)}%`,
      description:
        'The percentage decrease from the starting value to the new value.',
      items: [
        {
          label: 'Starting value',
          value: formatNumber(first),
        },
        {
          label: 'New value',
          value: formatNumber(second),
        },
        {
          label: 'Difference',
          value: formatNumber(first - second),
        },
      ],
    };
  }, [
    mode,
    firstValue,
    secondValue,
  ]);

  const getLabels = () => {
    if (mode === 'percent-of') {
      return {
        first: 'Percentage',
        second: 'Number',
        firstSuffix: '%',
      };
    }

    if (mode === 'what-percent') {
      return {
        first: 'First number',
        second: 'Second number',
      };
    }

    return {
      first: 'Starting value',
      second: 'New value',
    };
  };

  const labels = getLabels();

  return (
    <CalculatorShell
      title="Percentage Calculator"
      description="Calculate percentages, percentage changes, increases, decreases, and the percentage relationship between two numbers."
      result={
        <CalculatorResult
          label={result.label}
          value={result.value}
          description={result.description}
          items={result.items}
        />
      }
      footer={
        <div
          className="
            grid
            gap-6
            border-t
            border-border
            pt-10
            md:grid-cols-3
          "
        >
          <div>
            <h2
              className="
                font-heading
                text-lg
                font-semibold
                tracking-tight
              "
            >
              Percentage of a number
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Multiply the number by the percentage
              divided by 100.
            </p>
          </div>

          <div>
            <h2
              className="
                font-heading
                text-lg
                font-semibold
                tracking-tight
              "
            >
              Percentage change
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Compare the difference between the old
              and new value against the starting value.
            </p>
          </div>

          <div>
            <h2
              className="
                font-heading
                text-lg
                font-semibold
                tracking-tight
              "
            >
              Instant results
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Results update automatically as you
              change any value.
            </p>
          </div>
        </div>
      }
    >
      {/* Mode selector */}
      <div>
        <span
          className="
            mb-2
            block
            text-sm
            font-medium
            text-foreground
          "
        >
          Calculation
        </span>

        <div
          className="
            grid
            gap-2
            sm:grid-cols-2
          "
        >
          {modes.map((item) => {
            const active =
              mode === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setMode(item.id)
                }
                className={`
                  rounded-xl
                  border
                  px-4
                  py-3
                  text-left
                  text-sm
                  font-medium
                  transition-colors
                  ${active
                    ? `
                        border-foreground
                        bg-foreground
                        text-background
                      `
                    : `
                        border-border
                        bg-background
                        text-muted-foreground
                        hover:border-foreground/30
                        hover:text-foreground
                      `
                  }
                `}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <CalculatorField
        label={labels.first}
        value={firstValue}
        onChange={setFirstValue}
        suffix={labels.firstSuffix}
        step={0.01}
      />

      <CalculatorField
        label={labels.second}
        value={secondValue}
        onChange={setSecondValue}
        step={0.01}
      />
    </CalculatorShell>
  );
}