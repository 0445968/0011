'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

type PaymentFrequency =
  | 'monthly'
  | 'biweekly'
  | 'weekly';

const frequencies: {
  id: PaymentFrequency;
  label: string;
  paymentsPerYear: number;
}[] = [
    {
      id: 'monthly',
      label: 'Monthly',
      paymentsPerYear: 12,
    },
    {
      id: 'biweekly',
      label: 'Biweekly',
      paymentsPerYear: 26,
    },
    {
      id: 'weekly',
      label: 'Weekly',
      paymentsPerYear: 52,
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

export function PaymentCalculator() {
  const [financedAmount, setFinancedAmount] =
    useState('20000');

  const [annualRate, setAnnualRate] =
    useState('6.5');

  const [termYears, setTermYears] =
    useState('4');

  const [frequency, setFrequency] =
    useState<PaymentFrequency>('monthly');

  const result = useMemo(() => {
    const principal = Math.max(
      parseValue(financedAmount),
      0
    );

    const rate = Math.max(
      parseValue(annualRate),
      0
    );

    const years = Math.max(
      parseValue(termYears),
      0
    );

    const selectedFrequency =
      frequencies.find(
        (item) => item.id === frequency
      ) ?? frequencies[0];

    const paymentsPerYear =
      selectedFrequency.paymentsPerYear;

    const totalPayments =
      Math.max(
        Math.round(
          years * paymentsPerYear
        ),
        0
      );

    const periodicRate =
      rate / 100 / paymentsPerYear;

    let payment = 0;

    if (
      principal > 0 &&
      totalPayments > 0
    ) {
      if (periodicRate === 0) {
        payment =
          principal / totalPayments;
      } else {
        payment =
          principal *
          (
            periodicRate *
            Math.pow(
              1 + periodicRate,
              totalPayments
            )
          ) /
          (
            Math.pow(
              1 + periodicRate,
              totalPayments
            ) - 1
          );
      }
    }

    const totalPaid =
      payment * totalPayments;

    const totalInterest =
      Math.max(
        totalPaid - principal,
        0
      );

    const interestShare =
      totalPaid === 0
        ? 0
        : (totalInterest / totalPaid) * 100;

    return {
      principal,
      rate,
      years,
      paymentsPerYear,
      totalPayments,
      payment,
      totalPaid,
      totalInterest,
      interestShare,
      valid:
        principal > 0 &&
        totalPayments > 0,
    };
  }, [
    financedAmount,
    annualRate,
    termYears,
    frequency,
  ]);

  const frequencyLabel =
    frequencies.find(
      (item) => item.id === frequency
    )?.label ?? 'Payment';

  return (
    <CalculatorShell
      title="Payment Calculator"
      description="Estimate recurring payments for a financed amount using a fixed interest rate, term, and payment frequency."
      result={
        <CalculatorResult
          label={`${frequencyLabel} payment`}
          value={
            result.valid
              ? formatCurrency(
                result.payment
              )
              : '—'
          }
          description="Estimated fixed payment for the selected amount, interest rate, term, and payment schedule."
          items={[
            {
              label:
                'Amount financed',
              value: formatCurrency(
                result.principal
              ),
            },
            {
              label:
                'Interest rate',
              value: formatPercent(
                result.rate
              ),
            },
            {
              label:
                'Number of payments',
              value:
                result.totalPayments.toLocaleString(
                  'en-US'
                ),
            },
            {
              label:
                'Total interest',
              value:
                result.valid
                  ? formatCurrency(
                    result.totalInterest
                  )
                  : '—',
            },
            {
              label:
                'Total paid',
              value:
                result.valid
                  ? formatCurrency(
                    result.totalPaid
                  )
                  : '—',
            },
            {
              label:
                'Interest share',
              value:
                result.valid
                  ? formatPercent(
                    result.interestShare
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
              Fixed payment
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              The calculator uses a standard amortization formula to estimate an equal recurring payment.
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
              Payment frequency
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Choose monthly, biweekly, or weekly payments. The interest rate is converted to the same payment period.
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
              Financing estimate
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              This estimate assumes a fixed interest rate and does not include fees, taxes, insurance, penalties, or other financing charges.
            </p>
          </div>
        </div>
      }
    >
      <CalculatorField
        label="Amount financed"
        value={financedAmount}
        onChange={setFinancedAmount}
        prefix="$"
        min={0}
        step={0.01}
      />

      <CalculatorField
        label="Annual interest rate"
        value={annualRate}
        onChange={setAnnualRate}
        suffix="%"
        min={0}
        step={0.01}
      />

      <CalculatorField
        label="Payment term"
        value={termYears}
        onChange={setTermYears}
        suffix="years"
        min={0.1}
        step={0.5}
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
          Payment frequency
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
                frequency === item.id;

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
    </CalculatorShell>
  );
}