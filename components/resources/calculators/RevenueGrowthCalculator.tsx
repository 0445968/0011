'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

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

export function RevenueGrowthCalculator() {
  const [previousRevenue, setPreviousRevenue] =
    useState('50000');

  const [currentRevenue, setCurrentRevenue] =
    useState('65000');

  const result = useMemo(() => {
    const previous = Math.max(
      parseValue(previousRevenue),
      0
    );

    const current = Math.max(
      parseValue(currentRevenue),
      0
    );

    const change =
      current - previous;

    const growthRate =
      previous === 0
        ? null
        : (change / previous) * 100;

    const growthMultiple =
      previous === 0
        ? null
        : current / previous;

    return {
      previous,
      current,
      change,
      growthRate,
      growthMultiple,
    };
  }, [
    previousRevenue,
    currentRevenue,
  ]);

  const growing =
    result.change >= 0;

  return (
    <CalculatorShell
      title="Revenue Growth Calculator"
      description="Measure how much your revenue increased or decreased between two periods and calculate the percentage growth rate."
      result={
        <CalculatorResult
          label="Revenue growth"
          value={
            result.growthRate === null
              ? '—'
              : formatPercent(
                result.growthRate
              )
          }
          description={
            result.growthRate === null
              ? 'A percentage growth rate cannot be calculated when the previous period revenue is zero.'
              : growing
                ? 'Revenue increased compared with the previous period.'
                : 'Revenue decreased compared with the previous period.'
          }
          items={[
            {
              label: 'Previous revenue',
              value: formatCurrency(
                result.previous
              ),
            },
            {
              label: 'Current revenue',
              value: formatCurrency(
                result.current
              ),
            },
            {
              label: 'Revenue change',
              value: formatCurrency(
                result.change
              ),
            },
            {
              label: 'Growth multiple',
              value:
                result.growthMultiple === null
                  ? '—'
                  : `${result.growthMultiple.toFixed(
                    2
                  )}×`,
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
              Growth rate
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Revenue growth compares the change in revenue with the previous period.
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
              Growth = (Current − Previous) ÷ Previous × 100
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
              Revenue change
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              The absolute revenue change shows how many dollars were gained or lost between the two periods.
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
              Compare equal periods
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              For a useful comparison, use matching periods such as month over month, quarter over quarter, or year over year.
            </p>
          </div>
        </div>
      }
    >
      <CalculatorField
        label="Previous period revenue"
        value={previousRevenue}
        onChange={setPreviousRevenue}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Enter the revenue from the earlier comparison period."
      />

      <CalculatorField
        label="Current period revenue"
        value={currentRevenue}
        onChange={setCurrentRevenue}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Enter the revenue from the current comparison period."
      />
    </CalculatorShell>
  );
}