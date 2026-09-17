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

export function ProfitCalculator() {
  const [revenue, setRevenue] =
    useState('25000');

  const [costs, setCosts] =
    useState('15000');

  const result = useMemo(() => {
    const totalRevenue = Math.max(
      parseValue(revenue),
      0
    );

    const totalCosts = Math.max(
      parseValue(costs),
      0
    );

    const profit =
      totalRevenue - totalCosts;

    const margin =
      totalRevenue === 0
        ? 0
        : (profit / totalRevenue) * 100;

    const costRatio =
      totalRevenue === 0
        ? 0
        : (totalCosts / totalRevenue) * 100;

    return {
      totalRevenue,
      totalCosts,
      profit,
      margin,
      costRatio,
    };
  }, [
    revenue,
    costs,
  ]);

  const profitable =
    result.profit >= 0;

  return (
    <CalculatorShell
      title="Profit Calculator"
      description="Calculate your business profit, profit margin, total costs, and cost ratio from revenue and expenses."
      result={
        <CalculatorResult
          label="Profit"
          value={formatCurrency(
            result.profit
          )}
          description={
            profitable
              ? 'Your revenue is greater than your total costs.'
              : 'Your costs are greater than your revenue, resulting in a loss.'
          }
          items={[
            {
              label: 'Revenue',
              value: formatCurrency(
                result.totalRevenue
              ),
            },
            {
              label: 'Costs',
              value: formatCurrency(
                result.totalCosts
              ),
            },
            {
              label: 'Profit margin',
              value: formatPercent(
                result.margin
              ),
            },
            {
              label: 'Cost ratio',
              value: formatPercent(
                result.costRatio
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
              Profit
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Profit is the amount left after subtracting your total costs from your total revenue.
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
              Profit = Revenue − Costs
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
              Profit margin
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Profit margin shows how much of every dollar of revenue remains as profit.
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
              Margin = Profit ÷ Revenue × 100
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
              Cost ratio
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              The cost ratio shows what percentage of your revenue is being consumed by costs.
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
        helperText="Enter the total revenue generated during the period."
      />

      <CalculatorField
        label="Total costs"
        value={costs}
        onChange={setCosts}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Include the costs you want considered when calculating profit."
      />
    </CalculatorShell>
  );
}