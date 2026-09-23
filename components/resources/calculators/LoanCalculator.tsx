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

export function LoanCalculator() {
  const [loanAmount, setLoanAmount] =
    useState('25000');

  const [interestRate, setInterestRate] =
    useState('7');

  const [termYears, setTermYears] =
    useState('5');

  const [extraPayment, setExtraPayment] =
    useState('0');

  const result = useMemo(() => {
    const principal = Math.max(
      parseValue(loanAmount),
      0
    );

    const annualRate = Math.max(
      parseValue(interestRate),
      0
    );

    const years = Math.max(
      parseValue(termYears),
      0
    );

    const extra = Math.max(
      parseValue(extraPayment),
      0
    );

    const monthlyRate =
      annualRate / 100 / 12;

    const scheduledPayments =
      Math.max(
        Math.round(years * 12),
        0
      );

    let monthlyPayment = 0;

    if (scheduledPayments > 0) {
      if (monthlyRate === 0) {
        monthlyPayment =
          principal /
          scheduledPayments;
      } else {
        monthlyPayment =
          principal *
          (
            monthlyRate *
            Math.pow(
              1 + monthlyRate,
              scheduledPayments
            )
          ) /
          (
            Math.pow(
              1 + monthlyRate,
              scheduledPayments
            ) - 1
          );
      }
    }

    const actualPayment =
      monthlyPayment + extra;

    let balance = principal;
    let totalInterest = 0;
    let monthsPaid = 0;

    if (
      principal > 0 &&
      actualPayment > 0
    ) {
      while (
        balance > 0.005 &&
        monthsPaid < 1200
      ) {
        const interest =
          balance * monthlyRate;

        let principalPayment =
          actualPayment - interest;

        if (monthlyRate === 0) {
          principalPayment =
            actualPayment;
        }

        if (principalPayment <= 0) {
          break;
        }

        if (
          principalPayment >
          balance
        ) {
          principalPayment =
            balance;
        }

        totalInterest += interest;
        balance -= principalPayment;
        monthsPaid += 1;
      }
    }

    const totalPaid =
      principal +
      totalInterest;

    const originalTotalPaid =
      monthlyPayment *
      scheduledPayments;

    const originalInterest =
      Math.max(
        originalTotalPaid -
        principal,
        0
      );

    const interestSaved =
      extra > 0
        ? Math.max(
          originalInterest -
          totalInterest,
          0
        )
        : 0;

    const monthsSaved =
      extra > 0
        ? Math.max(
          scheduledPayments -
          monthsPaid,
          0
        )
        : 0;

    const payoffYears =
      Math.floor(
        monthsPaid / 12
      );

    const payoffMonths =
      monthsPaid % 12;

    return {
      principal,
      annualRate,
      years,
      extra,
      monthlyPayment,
      actualPayment,
      totalInterest,
      totalPaid,
      monthsPaid,
      monthsSaved,
      interestSaved,
      payoffYears,
      payoffMonths,
      valid:
        scheduledPayments > 0 &&
        principal > 0 &&
        actualPayment > 0 &&
        balance <= 0.005,
    };
  }, [
    loanAmount,
    interestRate,
    termYears,
    extraPayment,
  ]);

  const payoffLabel =
    result.valid
      ? `${result.payoffYears} ${result.payoffYears === 1
        ? 'year'
        : 'years'
      }${result.payoffMonths > 0
        ? ` ${result.payoffMonths} ${result.payoffMonths === 1
          ? 'month'
          : 'months'
        }`
        : ''
      }`
      : '—';

  return (
    <CalculatorShell
      title="Loan Calculator"
      description="Estimate monthly loan payments, total interest, total repayment cost, and how extra payments could affect your payoff time."
      result={
        <CalculatorResult
          label="Monthly payment"
          value={
            result.valid
              ? formatCurrency(
                result.actualPayment
              )
              : '—'
          }
          description={
            result.extra > 0
              ? 'Includes your regular monthly payment plus the extra payment amount.'
              : 'Estimated fixed monthly payment for the selected loan amount, rate, and term.'
          }
          items={[
            {
              label:
                'Scheduled payment',
              value:
                result.valid
                  ? formatCurrency(
                    result.monthlyPayment
                  )
                  : '—',
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
                'Total repayment',
              value:
                result.valid
                  ? formatCurrency(
                    result.totalPaid
                  )
                  : '—',
            },
            {
              label:
                'Estimated payoff',
              value: payoffLabel,
            },
            ...(result.extra > 0
              ? [
                {
                  label:
                    'Interest saved',
                  value:
                    result.valid
                      ? formatCurrency(
                        result.interestSaved
                      )
                      : '—',
                },
                {
                  label:
                    'Time saved',
                  value:
                    result.valid
                      ? `${result.monthsSaved} ${result.monthsSaved ===
                        1
                        ? 'month'
                        : 'months'
                      }`
                      : '—',
                },
              ]
              : []),
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
              Monthly payment
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              The standard payment is calculated using a fixed-rate amortizing loan formula.
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
              Extra payments
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Additional principal payments can reduce both the loan term and the total interest paid.
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
              This calculator does not include lender fees, insurance, taxes, variable rates, penalties, or other loan-specific charges.
            </p>
          </div>
        </div>
      }
    >
      <CalculatorField
        label="Loan amount"
        value={loanAmount}
        onChange={setLoanAmount}
        prefix="$"
        min={0}
        step={0.01}
      />

      <CalculatorField
        label="Annual interest rate"
        value={interestRate}
        onChange={setInterestRate}
        suffix="%"
        min={0}
        step={0.01}
      />

      <CalculatorField
        label="Loan term"
        value={termYears}
        onChange={setTermYears}
        suffix="years"
        min={0.1}
        step={0.5}
      />

      <CalculatorField
        label="Extra monthly payment"
        value={extraPayment}
        onChange={setExtraPayment}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Optional. Enter an additional amount you plan to pay toward principal each month."
      />
    </CalculatorShell>
  );
}