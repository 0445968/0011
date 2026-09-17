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

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
}

export function BreakEvenCalculator() {
  const [fixedCosts, setFixedCosts] =
    useState('10000');

  const [pricePerUnit, setPricePerUnit] =
    useState('50');

  const [variableCostPerUnit, setVariableCostPerUnit] =
    useState('20');

  const result = useMemo(() => {
    const fixed = Math.max(
      parseValue(fixedCosts),
      0
    );

    const price = Math.max(
      parseValue(pricePerUnit),
      0
    );

    const variableCost = Math.max(
      parseValue(variableCostPerUnit),
      0
    );

    const contributionMargin =
      price - variableCost;

    const valid =
      contributionMargin > 0;

    const breakEvenUnits =
      valid
        ? fixed / contributionMargin
        : 0;

    const roundedUnits =
      valid
        ? Math.ceil(breakEvenUnits)
        : 0;

    const breakEvenRevenue =
      roundedUnits * price;

    const totalVariableCosts =
      roundedUnits * variableCost;

    const totalCosts =
      fixed + totalVariableCosts;

    return {
      fixed,
      price,
      variableCost,
      contributionMargin,
      breakEvenUnits,
      roundedUnits,
      breakEvenRevenue,
      totalVariableCosts,
      totalCosts,
      valid,
    };
  }, [
    fixedCosts,
    pricePerUnit,
    variableCostPerUnit,
  ]);

  return (
    <CalculatorShell
      title="Break-Even Calculator"
      description="Calculate how many units you need to sell to cover your fixed and variable costs, along with your break-even revenue."
      result={
        <CalculatorResult
          label="Break-even units"
          value={
            result.valid
              ? formatNumber(result.roundedUnits)
              : '—'
          }
          description={
            result.valid
              ? `You need to sell at least ${formatNumber(
                result.roundedUnits
              )} units to cover your estimated costs.`
              : 'Your selling price must be greater than your variable cost per unit to calculate a break-even point.'
          }
          items={[
            {
              label: 'Break-even revenue',
              value: result.valid
                ? formatCurrency(
                  result.breakEvenRevenue
                )
                : '—',
            },
            {
              label: 'Contribution margin',
              value: formatCurrency(
                result.contributionMargin
              ),
            },
            {
              label: 'Fixed costs',
              value: formatCurrency(
                result.fixed
              ),
            },
            {
              label: 'Variable costs at break-even',
              value: result.valid
                ? formatCurrency(
                  result.totalVariableCosts
                )
                : '—',
            },
            {
              label: 'Total costs at break-even',
              value: result.valid
                ? formatCurrency(
                  result.totalCosts
                )
                : '—',
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
              Break-even point
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              The break-even point is the number of units you need to sell before revenue covers both fixed and variable costs.
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
              Units = Fixed Costs ÷ (Price − Variable Cost)
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
              Contribution margin
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Contribution margin is the amount each unit contributes toward covering fixed costs and eventually generating profit.
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
              Contribution = Price − Variable Cost
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
              Fixed vs variable costs
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Fixed costs stay relatively constant, while variable costs increase as you sell or produce more units.
            </p>
          </div>
        </div>
      }
    >
      <CalculatorField
        label="Fixed costs"
        value={fixedCosts}
        onChange={setFixedCosts}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Examples include rent, software, insurance, salaries, and other costs that do not change directly with each unit sold."
      />

      <CalculatorField
        label="Selling price per unit"
        value={pricePerUnit}
        onChange={setPricePerUnit}
        prefix="$"
        min={0}
        step={0.01}
      />

      <CalculatorField
        label="Variable cost per unit"
        value={variableCostPerUnit}
        onChange={setVariableCostPerUnit}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Enter the cost that increases with each additional unit produced or sold."
      />
    </CalculatorShell>
  );
}