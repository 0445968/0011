'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

type ContributionFrequency =
  | 'monthly'
  | 'quarterly'
  | 'yearly';

const frequencies: {
  id: ContributionFrequency;
  label: string;
  periodsPerYear: number;
}[] = [
    {
      id: 'monthly',
      label: 'Monthly',
      periodsPerYear: 12,
    },
    {
      id: 'quarterly',
      label: 'Quarterly',
      periodsPerYear: 4,
    },
    {
      id: 'yearly',
      label: 'Yearly',
      periodsPerYear: 1,
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

export function InvestmentCalculator() {
  const [initialInvestment, setInitialInvestment] =
    useState('10000');

  const [contribution, setContribution] =
    useState('500');

  const [frequency, setFrequency] =
    useState<ContributionFrequency>('monthly');

  const [annualReturn, setAnnualReturn] =
    useState('7');

  const [years, setYears] =
    useState('20');

  const result = useMemo(() => {
    const principal = Math.max(
      parseValue(initialInvestment),
      0
    );

    const recurringContribution = Math.max(
      parseValue(contribution),
      0
    );

    const rate = Math.max(
      parseValue(annualReturn),
      0
    );

    const time = Math.max(
      parseValue(years),
      0
    );

    const selectedFrequency =
      frequencies.find(
        (item) => item.id === frequency
      ) ?? frequencies[0];

    const periodsPerYear =
      selectedFrequency.periodsPerYear;

    const totalPeriods =
      Math.max(
        Math.round(
          time * periodsPerYear
        ),
        0
      );

    const periodicRate =
      rate === 0
        ? 0
        : rate /
        100 /
        periodsPerYear;

    let balance = principal;

    for (
      let period = 0;
      period < totalPeriods;
      period += 1
    ) {
      balance *=
        1 + periodicRate;

      balance +=
        recurringContribution;
    }

    const totalContributions =
      recurringContribution *
      totalPeriods;

    const totalInvested =
      principal +
      totalContributions;

    const investmentGrowth =
      balance -
      totalInvested;

    const growthPercent =
      totalInvested === 0
        ? 0
        : (investmentGrowth /
          totalInvested) *
        100;

    return {
      principal,
      recurringContribution,
      periodsPerYear,
      totalPeriods,
      totalContributions,
      totalInvested,
      balance,
      investmentGrowth,
      growthPercent,
      annualReturn: rate,
      years: time,
    };
  }, [
    initialInvestment,
    contribution,
    frequency,
    annualReturn,
    years,
  ]);

  return (
    <CalculatorShell
      title="Investment Calculator"
      description="Project how an investment could grow over time using an initial balance, recurring contributions, expected return, and investment period."
      result={
        <CalculatorResult
          label="Estimated future value"
          value={formatCurrency(
            result.balance
          )}
          description="Projected investment value assuming the selected return remains constant and contributions are made at the end of each period."
          items={[
            {
              label:
                'Initial investment',
              value: formatCurrency(
                result.principal
              ),
            },
            {
              label:
                'Total contributions',
              value: formatCurrency(
                result.totalContributions
              ),
            },
            {
              label:
                'Total invested',
              value: formatCurrency(
                result.totalInvested
              ),
            },
            {
              label:
                'Investment growth',
              value: formatCurrency(
                result.investmentGrowth
              ),
            },
            {
              label:
                'Growth on invested amount',
              value: formatPercent(
                result.growthPercent
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
              Compound growth
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Investment returns are added back to the balance, allowing future returns to build on prior growth.
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
              Recurring contributions
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Contributions are assumed to be added at the end of each selected period after that period&apos;s investment growth.
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
              Projection only
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Actual investment returns vary over time. This calculator uses a constant rate for illustration and does not include taxes, fees, or inflation.
            </p>
          </div>
        </div>
      }
    >
      <CalculatorField
        label="Initial investment"
        value={initialInvestment}
        onChange={setInitialInvestment}
        prefix="$"
        min={0}
        step={0.01}
      />

      <CalculatorField
        label="Recurring contribution"
        value={contribution}
        onChange={setContribution}
        prefix="$"
        min={0}
        step={0.01}
      />

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
          Contribution frequency
        </span>

        <div
          className="
            grid
            gap-2
            sm:grid-cols-3
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
                    px-4
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

      <CalculatorField
        label="Expected annual return"
        value={annualReturn}
        onChange={setAnnualReturn}
        suffix="%"
        min={0}
        step={0.01}
      />

      <CalculatorField
        label="Investment period"
        value={years}
        onChange={setYears}
        suffix="years"
        min={0}
        step={1}
      />
    </CalculatorShell>
  );
}