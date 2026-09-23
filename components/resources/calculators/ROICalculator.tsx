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

export function ROICalculator() {
  const [investmentCost, setInvestmentCost] =
    useState('10000');

  const [finalValue, setFinalValue] =
    useState('13500');

  const result = useMemo(() => {
    const cost = Math.max(
      parseValue(investmentCost),
      0
    );

    const value = Math.max(
      parseValue(finalValue),
      0
    );

    const netReturn =
      value - cost;

    const roi =
      cost === 0
        ? 0
        : (netReturn / cost) * 100;

    const returnMultiple =
      cost === 0
        ? 0
        : value / cost;

    return {
      cost,
      value,
      netReturn,
      roi,
      returnMultiple,
    };
  }, [
    investmentCost,
    finalValue,
  ]);

  const positive =
    result.netReturn >= 0;

  return (
    <CalculatorShell
      title="ROI Calculator"
      description="Calculate return on investment using your initial investment cost and final value. See your ROI percentage, net return, and total return multiple instantly."
      result={
        <CalculatorResult
          label="Return on investment"
          value={formatPercent(
            result.roi
          )}
          description={
            positive
              ? 'Your investment gained value compared with the amount initially invested.'
              : 'Your investment lost value compared with the amount initially invested.'
          }
          items={[
            {
              label: 'Initial investment',
              value: formatCurrency(
                result.cost
              ),
            },
            {
              label: 'Final value',
              value: formatCurrency(
                result.value
              ),
            },
            {
              label: 'Net return',
              value: formatCurrency(
                result.netReturn
              ),
            },
            {
              label: 'Return multiple',
              value: `${result.returnMultiple.toFixed(
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
              ROI formula
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              ROI equals net return divided by the original investment, multiplied by 100.
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
              ROI = (Return − Cost) ÷ Cost × 100
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
              Net return
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Net return shows the dollar amount gained or lost after subtracting the original investment.
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
              Return multiple
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              The return multiple shows the final value as a multiple of the original amount invested.
            </p>
          </div>
        </div>
      }
    >
      <CalculatorField
        label="Initial investment"
        value={investmentCost}
        onChange={setInvestmentCost}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Enter the total amount originally invested."
      />

      <CalculatorField
        label="Final value"
        value={finalValue}
        onChange={setFinalValue}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Enter the current value or total amount received from the investment."
      />
    </CalculatorShell>
  );
}