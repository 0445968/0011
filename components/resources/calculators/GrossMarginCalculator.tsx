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

export function GrossMarginCalculator() {
  const [revenue, setRevenue] =
    useState('25000');

  const [cogs, setCogs] =
    useState('12000');

  const result = useMemo(() => {
    const totalRevenue = Math.max(
      parseValue(revenue),
      0
    );

    const totalCogs = Math.max(
      parseValue(cogs),
      0
    );

    const grossProfit =
      totalRevenue - totalCogs;

    const grossMargin =
      totalRevenue === 0
        ? 0
        : (grossProfit / totalRevenue) * 100;

    const cogsRatio =
      totalRevenue === 0
        ? 0
        : (totalCogs / totalRevenue) * 100;

    return {
      totalRevenue,
      totalCogs,
      grossProfit,
      grossMargin,
      cogsRatio,
    };
  }, [
    revenue,
    cogs,
  ]);

  return (
    <CalculatorShell
      title="Gross Margin Calculator"
      description="Calculate gross profit, gross margin, and cost of goods sold as a percentage of revenue."
      result={
        <CalculatorResult
          label="Gross margin"
          value={formatPercent(
            result.grossMargin
          )}
          description="Gross margin shows the percentage of revenue remaining after subtracting the direct cost of goods or services sold."
          items={[
            {
              label: 'Revenue',
              value: formatCurrency(
                result.totalRevenue
              ),
            },
            {
              label: 'Cost of goods sold',
              value: formatCurrency(
                result.totalCogs
              ),
            },
            {
              label: 'Gross profit',
              value: formatCurrency(
                result.grossProfit
              ),
            },
            {
              label: 'COGS ratio',
              value: formatPercent(
                result.cogsRatio
              ),
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
              Gross profit
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Gross profit is the revenue left after subtracting the direct costs required to produce or deliver what you sell.
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
              Gross Profit = Revenue − COGS
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
              Gross margin
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Gross margin expresses gross profit as a percentage of total revenue.
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
              Margin = Gross Profit ÷ Revenue × 100
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
              COGS ratio
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              The COGS ratio shows how much of each revenue dollar is consumed by direct production or delivery costs.
            </p>
          </div>
        </div>
      }
    >
      <CalculatorField
        label="Revenue"
        value={revenue}
        onChange={setRevenue}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Enter the total revenue for the period."
      />

      <CalculatorField
        label="Cost of goods sold"
        value={cogs}
        onChange={setCogs}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Enter the direct cost of producing or delivering the goods or services sold."
      />
    </CalculatorShell>
  );
}