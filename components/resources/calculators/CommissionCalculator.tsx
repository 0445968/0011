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

export function CommissionCalculator() {
  const [salesAmount, setSalesAmount] =
    useState('25000');

  const [commissionRate, setCommissionRate] =
    useState('8');

  const [basePay, setBasePay] =
    useState('0');

  const result = useMemo(() => {
    const sales = Math.max(
      parseValue(salesAmount),
      0
    );

    const rate = Math.max(
      parseValue(commissionRate),
      0
    );

    const base = Math.max(
      parseValue(basePay),
      0
    );

    const commission =
      sales * (rate / 100);

    const totalPay =
      base + commission;

    const commissionShare =
      totalPay === 0
        ? 0
        : (commission / totalPay) * 100;

    return {
      sales,
      rate,
      base,
      commission,
      totalPay,
      commissionShare,
    };
  }, [
    salesAmount,
    commissionRate,
    basePay,
  ]);

  return (
    <CalculatorShell
      title="Commission Calculator"
      description="Calculate sales commission, total earnings, and the share of compensation earned through commission."
      result={
        <CalculatorResult
          label="Commission earned"
          value={formatCurrency(
            result.commission
          )}
          description="The commission amount calculated from your sales volume and commission rate."
          items={[
            {
              label: 'Sales amount',
              value: formatCurrency(
                result.sales
              ),
            },
            {
              label: 'Commission rate',
              value: formatPercent(
                result.rate
              ),
            },
            {
              label: 'Base pay',
              value: formatCurrency(
                result.base
              ),
            },
            {
              label: 'Total earnings',
              value: formatCurrency(
                result.totalPay
              ),
            },
            {
              label: 'Commission share',
              value: formatPercent(
                result.commissionShare
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
              Commission
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Commission is calculated as a percentage of the sales amount.
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
              Commission = Sales × Commission Rate
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
              Total earnings
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              If you receive a base salary or guaranteed pay, add it to see your combined earnings.
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
              Total = Base Pay + Commission
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
              Commission share
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Commission share shows what percentage of your total compensation comes from commission.
            </p>
          </div>
        </div>
      }
    >
      <CalculatorField
        label="Sales amount"
        value={salesAmount}
        onChange={setSalesAmount}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Enter the total sales amount eligible for commission."
      />

      <CalculatorField
        label="Commission rate"
        value={commissionRate}
        onChange={setCommissionRate}
        suffix="%"
        min={0}
        step={0.01}
      />

      <CalculatorField
        label="Base pay"
        value={basePay}
        onChange={setBasePay}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Optional. Leave at zero if compensation is commission-only."
      />
    </CalculatorShell>
  );
}