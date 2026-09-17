'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

type InflationMode =
  | 'future-price'
  | 'purchasing-power';

const modes: {
  id: InflationMode;
  label: string;
}[] = [
    {
      id: 'future-price',
      label: 'Future price',
    },
    {
      id: 'purchasing-power',
      label: 'Purchasing power',
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

export function InflationCalculator() {
  const [mode, setMode] =
    useState<InflationMode>('future-price');

  const [amount, setAmount] =
    useState('1000');

  const [inflationRate, setInflationRate] =
    useState('3');

  const [years, setYears] =
    useState('10');

  const result = useMemo(() => {
    const startingAmount = Math.max(
      parseValue(amount),
      0
    );

    const rate = Math.max(
      parseValue(inflationRate),
      0
    );

    const time = Math.max(
      parseValue(years),
      0
    );

    const inflationFactor =
      Math.pow(
        1 + rate / 100,
        time
      );

    const futurePrice =
      startingAmount *
      inflationFactor;

    const futurePurchasingPower =
      inflationFactor === 0
        ? startingAmount
        : startingAmount /
        inflationFactor;

    const priceIncrease =
      futurePrice -
      startingAmount;

    const purchasingPowerLoss =
      startingAmount -
      futurePurchasingPower;

    const cumulativeInflation =
      (inflationFactor - 1) * 100;

    return {
      startingAmount,
      rate,
      time,
      inflationFactor,
      futurePrice,
      futurePurchasingPower,
      priceIncrease,
      purchasingPowerLoss,
      cumulativeInflation,
    };
  }, [
    amount,
    inflationRate,
    years,
  ]);

  return (
    <CalculatorShell
      title="Inflation Calculator"
      description="Estimate how inflation can affect future prices and the purchasing power of money over time."
      result={
        <CalculatorResult
          label={
            mode === 'future-price'
              ? 'Estimated future price'
              : 'Future purchasing power'
          }
          value={
            mode === 'future-price'
              ? formatCurrency(
                result.futurePrice
              )
              : formatCurrency(
                result.futurePurchasingPower
              )
          }
          description={
            mode === 'future-price'
              ? `An item costing ${formatCurrency(
                result.startingAmount
              )} today would cost about this much after ${result.time} ${result.time === 1
                ? 'year'
                : 'years'
              } at the selected inflation rate.`
              : `${formatCurrency(
                result.startingAmount
              )} in the future would have approximately this much purchasing power in today's dollars at the selected inflation rate.`
          }
          items={[
            {
              label: 'Starting amount',
              value: formatCurrency(
                result.startingAmount
              ),
            },
            {
              label: 'Annual inflation rate',
              value: formatPercent(
                result.rate
              ),
            },
            {
              label: 'Cumulative inflation',
              value: formatPercent(
                result.cumulativeInflation
              ),
            },
            {
              label: 'Future price',
              value: formatCurrency(
                result.futurePrice
              ),
            },
            {
              label: 'Future purchasing power',
              value: formatCurrency(
                result.futurePurchasingPower
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
              Future prices
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Future prices are estimated by compounding the inflation rate over the selected number of years.
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
              Future Price = Current Price × (1 + Inflation Rate)^Years
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
              Purchasing power
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Purchasing power shows how much the same amount of money may effectively be worth after inflation.
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
              Purchasing Power = Amount ÷ (1 + Inflation Rate)^Years
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
              Estimate only
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Inflation changes from year to year. This calculator assumes the same annual inflation rate across the full period.
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
          Calculation
        </span>

        <div className="grid gap-2 sm:grid-cols-2">
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
        label={
          mode === 'future-price'
            ? 'Current amount'
            : 'Future amount'
        }
        value={amount}
        onChange={setAmount}
        prefix="$"
        min={0}
        step={0.01}
      />

      <CalculatorField
        label="Annual inflation rate"
        value={inflationRate}
        onChange={setInflationRate}
        suffix="%"
        min={0}
        step={0.01}
        helperText="Enter the annual inflation rate you want to use for the estimate."
      />

      <CalculatorField
        label="Time"
        value={years}
        onChange={setYears}
        suffix="years"
        min={0}
        step={1}
      />
    </CalculatorShell>
  );
}