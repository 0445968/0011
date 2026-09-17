'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

type InterestMode =
  | 'compound'
  | 'simple';

type CompoundFrequency =
  | 'yearly'
  | 'quarterly'
  | 'monthly'
  | 'daily';

const frequencies: {
  id: CompoundFrequency;
  label: string;
  periods: number;
}[] = [
    {
      id: 'yearly',
      label: 'Yearly',
      periods: 1,
    },
    {
      id: 'quarterly',
      label: 'Quarterly',
      periods: 4,
    },
    {
      id: 'monthly',
      label: 'Monthly',
      periods: 12,
    },
    {
      id: 'daily',
      label: 'Daily',
      periods: 365,
    },
  ];

function parseValue(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

export function InterestCalculator() {
  const [mode, setMode] =
    useState<InterestMode>('compound');

  const [principal, setPrincipal] =
    useState('10000');

  const [rate, setRate] =
    useState('5');

  const [years, setYears] =
    useState('10');

  const [frequency, setFrequency] =
    useState<CompoundFrequency>('monthly');

  const result = useMemo(() => {
    const startingPrincipal = Math.max(
      parseValue(principal),
      0
    );

    const annualRate = Math.max(
      parseValue(rate),
      0
    );

    const time = Math.max(
      parseValue(years),
      0
    );

    const decimalRate =
      annualRate / 100;

    if (mode === 'simple') {
      const interest =
        startingPrincipal *
        decimalRate *
        time;

      const endingBalance =
        startingPrincipal + interest;

      return {
        startingPrincipal,
        annualRate,
        time,
        interest,
        endingBalance,
        effectiveAnnualRate:
          annualRate,
      };
    }

    const selectedFrequency =
      frequencies.find(
        (item) =>
          item.id === frequency
      ) ?? frequencies[2];

    const n =
      selectedFrequency.periods;

    const endingBalance =
      startingPrincipal *
      Math.pow(
        1 + decimalRate / n,
        n * time
      );

    const interest =
      endingBalance -
      startingPrincipal;

    const effectiveAnnualRate =
      annualRate === 0
        ? 0
        : (
          Math.pow(
            1 + decimalRate / n,
            n
          ) - 1
        ) * 100;

    return {
      startingPrincipal,
      annualRate,
      time,
      interest,
      endingBalance,
      effectiveAnnualRate,
    };
  }, [
    mode,
    principal,
    rate,
    years,
    frequency,
  ]);

  return (
    <CalculatorShell
      title="Interest Calculator"
      description="Calculate simple or compound interest using your starting balance, annual interest rate, time period, and compounding frequency."
      result={
        <CalculatorResult
          label="Ending balance"
          value={formatCurrency(
            result.endingBalance
          )}
          description={
            mode === 'compound'
              ? 'Estimated balance after compound interest over the selected period.'
              : 'Estimated balance after simple interest over the selected period.'
          }
          items={[
            {
              label:
                'Starting balance',
              value: formatCurrency(
                result.startingPrincipal
              ),
            },
            {
              label:
                'Interest earned',
              value: formatCurrency(
                result.interest
              ),
            },
            {
              label:
                'Annual rate',
              value: formatPercent(
                result.annualRate
              ),
            },
            ...(mode === 'compound'
              ? [
                {
                  label:
                    'Effective annual rate',
                  value: formatPercent(
                    result.effectiveAnnualRate
                  ),
                },
              ]
              : []),
            {
              label:
                'Time',
              value: `${result.time} ${result.time === 1
                  ? 'year'
                  : 'years'
                }`,
            },
          ]}
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
              Simple interest
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Simple interest is calculated only on the original principal.
            </p>

            <div
              className="
                mt-4
                rounded-xl
                bg-secondary/50
                px-4
                py-3
                font-mono
                text-xs
                text-muted-foreground
              "
            >
              A = P × (1 + r × t)
            </div>
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
              Compound interest
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Compound interest earns interest on both the original principal and previously accumulated interest.
            </p>

            <div
              className="
                mt-4
                rounded-xl
                bg-secondary/50
                px-4
                py-3
                font-mono
                text-xs
                text-muted-foreground
              "
            >
              A = P × (1 + r ÷ n)^(n × t)
            </div>
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
              Compounding frequency
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              More frequent compounding can slightly increase the effective annual return when the stated rate stays the same.
            </p>
          </div>
        </div>
      }
    >
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
          Interest type
        </span>

        <div className="grid gap-2 sm:grid-cols-2">
          {[
            {
              id: 'compound' as const,
              label: 'Compound interest',
            },
            {
              id: 'simple' as const,
              label: 'Simple interest',
            },
          ].map((item) => {
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
        label="Starting balance"
        value={principal}
        onChange={setPrincipal}
        prefix="$"
        min={0}
        step={0.01}
      />

      <CalculatorField
        label="Annual interest rate"
        value={rate}
        onChange={setRate}
        suffix="%"
        min={0}
        step={0.01}
      />

      <CalculatorField
        label="Time"
        value={years}
        onChange={setYears}
        suffix="years"
        min={0}
        step={0.1}
      />

      {mode === 'compound' && (
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
            Compound frequency
          </span>

          <div
            className="
              grid
              grid-cols-2
              gap-2
              sm:grid-cols-4
            "
          >
            {frequencies.map(
              (item) => {
                const active =
                  frequency ===
                  item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setFrequency(
                        item.id
                      )
                    }
                    className={`
                      rounded-xl
                      border
                      px-3
                      py-3
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
              }
            )}
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}