'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

type PayType =
  | 'hourly'
  | 'salary';

type PayFrequency =
  | 'weekly'
  | 'biweekly'
  | 'semimonthly'
  | 'monthly';

const frequencies: {
  id: PayFrequency;
  label: string;
  periodsPerYear: number;
}[] = [
    {
      id: 'weekly',
      label: 'Weekly',
      periodsPerYear: 52,
    },
    {
      id: 'biweekly',
      label: 'Biweekly',
      periodsPerYear: 26,
    },
    {
      id: 'semimonthly',
      label: 'Twice monthly',
      periodsPerYear: 24,
    },
    {
      id: 'monthly',
      label: 'Monthly',
      periodsPerYear: 12,
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

export function PaycheckCalculator() {
  const [payType, setPayType] =
    useState<PayType>('hourly');

  const [frequency, setFrequency] =
    useState<PayFrequency>('biweekly');

  const [hourlyRate, setHourlyRate] =
    useState('25');

  const [regularHours, setRegularHours] =
    useState('80');

  const [overtimeHours, setOvertimeHours] =
    useState('0');

  const [overtimeMultiplier, setOvertimeMultiplier] =
    useState('1.5');

  const [annualSalary, setAnnualSalary] =
    useState('60000');

  const [withholdingRate, setWithholdingRate] =
    useState('20');

  const [preTaxDeductions, setPreTaxDeductions] =
    useState('0');

  const [postTaxDeductions, setPostTaxDeductions] =
    useState('0');

  const result = useMemo(() => {
    const selectedFrequency =
      frequencies.find(
        (item) => item.id === frequency
      ) ?? frequencies[1];

    const periodsPerYear =
      selectedFrequency.periodsPerYear;

    let grossPay = 0;

    if (payType === 'hourly') {
      const rate = Math.max(
        parseValue(hourlyRate),
        0
      );

      const regular = Math.max(
        parseValue(regularHours),
        0
      );

      const overtime = Math.max(
        parseValue(overtimeHours),
        0
      );

      const multiplier = Math.max(
        parseValue(overtimeMultiplier),
        0
      );

      const regularPay =
        rate * regular;

      const overtimePay =
        rate *
        multiplier *
        overtime;

      grossPay =
        regularPay +
        overtimePay;
    } else {
      const salary = Math.max(
        parseValue(annualSalary),
        0
      );

      grossPay =
        periodsPerYear === 0
          ? 0
          : salary / periodsPerYear;
    }

    const preTax = Math.min(
      Math.max(
        parseValue(preTaxDeductions),
        0
      ),
      grossPay
    );

    const taxablePay =
      Math.max(
        grossPay - preTax,
        0
      );

    const withholdingPercent = Math.max(
      parseValue(withholdingRate),
      0
    );

    const estimatedWithholding =
      taxablePay *
      (withholdingPercent / 100);

    const postTax = Math.max(
      parseValue(postTaxDeductions),
      0
    );

    const netPay =
      Math.max(
        taxablePay -
        estimatedWithholding -
        postTax,
        0
      );

    const annualGross =
      grossPay * periodsPerYear;

    const annualNet =
      netPay * periodsPerYear;

    const deductionTotal =
      preTax +
      estimatedWithholding +
      postTax;

    const takeHomeRate =
      grossPay === 0
        ? 0
        : (netPay / grossPay) * 100;

    return {
      grossPay,
      preTax,
      taxablePay,
      estimatedWithholding,
      postTax,
      netPay,
      annualGross,
      annualNet,
      deductionTotal,
      takeHomeRate,
      periodsPerYear,
    };
  }, [
    payType,
    frequency,
    hourlyRate,
    regularHours,
    overtimeHours,
    overtimeMultiplier,
    annualSalary,
    withholdingRate,
    preTaxDeductions,
    postTaxDeductions,
  ]);

  return (
    <CalculatorShell
      title="Paycheck Calculator"
      description="Estimate gross pay and take-home pay using hourly or salary income, deductions, and your own withholding estimate."
      result={
        <CalculatorResult
          label="Estimated take-home pay"
          value={formatCurrency(
            result.netPay
          )}
          description="Estimated net paycheck after the deductions and withholding values you entered."
          items={[
            {
              label: 'Gross pay',
              value: formatCurrency(
                result.grossPay
              ),
            },
            {
              label: 'Pre-tax deductions',
              value: formatCurrency(
                result.preTax
              ),
            },
            {
              label: 'Taxable pay',
              value: formatCurrency(
                result.taxablePay
              ),
            },
            {
              label: 'Estimated withholding',
              value: formatCurrency(
                result.estimatedWithholding
              ),
            },
            {
              label: 'Post-tax deductions',
              value: formatCurrency(
                result.postTax
              ),
            },
            {
              label: 'Take-home rate',
              value: formatPercent(
                result.takeHomeRate
              ),
            },
            {
              label: 'Estimated annual gross',
              value: formatCurrency(
                result.annualGross
              ),
            },
            {
              label: 'Estimated annual take-home',
              value: formatCurrency(
                result.annualNet
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
              Gross pay
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              For hourly workers, gross pay includes regular and overtime earnings. For salaried workers, annual salary is divided by the selected number of pay periods.
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
              Deductions
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Pre-tax deductions reduce the amount used for the withholding estimate. Post-tax deductions are subtracted afterward.
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
              This calculator does not automatically apply federal, state, local, Social Security, Medicare, or other payroll tax rules. Use your expected combined withholding rate for an estimate.
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
          Pay type
        </span>

        <div className="grid gap-2 sm:grid-cols-2">
          {[
            {
              id: 'hourly' as const,
              label: 'Hourly',
            },
            {
              id: 'salary' as const,
              label: 'Salary',
            },
          ].map((item) => {
            const active =
              payType === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setPayType(item.id)
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
          Pay frequency
        </span>

        <div
          className="
            grid
            grid-cols-2
            gap-2
            sm:grid-cols-4
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
                    px-3
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

      {payType === 'hourly' ? (
        <>
          <CalculatorField
            label="Hourly rate"
            value={hourlyRate}
            onChange={setHourlyRate}
            prefix="$"
            min={0}
            step={0.01}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <CalculatorField
              label="Regular hours this pay period"
              value={regularHours}
              onChange={setRegularHours}
              suffix="hours"
              min={0}
              step={0.25}
            />

            <CalculatorField
              label="Overtime hours"
              value={overtimeHours}
              onChange={setOvertimeHours}
              suffix="hours"
              min={0}
              step={0.25}
            />
          </div>

          <CalculatorField
            label="Overtime multiplier"
            value={overtimeMultiplier}
            onChange={setOvertimeMultiplier}
            suffix="×"
            min={0}
            step={0.1}
            helperText="For example, 1.5 means time-and-a-half."
          />
        </>
      ) : (
        <CalculatorField
          label="Annual salary"
          value={annualSalary}
          onChange={setAnnualSalary}
          prefix="$"
          min={0}
          step={0.01}
        />
      )}

      <CalculatorField
        label="Pre-tax deductions"
        value={preTaxDeductions}
        onChange={setPreTaxDeductions}
        prefix="$"
        min={0}
        step={0.01}
        helperText="Examples may include eligible retirement, insurance, or benefit deductions."
      />

      <CalculatorField
        label="Estimated withholding rate"
        value={withholdingRate}
        onChange={setWithholdingRate}
        suffix="%"
        min={0}
        step={0.01}
        helperText="Enter your own estimated combined withholding percentage."
      />

      <CalculatorField
        label="Post-tax deductions"
        value={postTaxDeductions}
        onChange={setPostTaxDeductions}
        prefix="$"
        min={0}
        step={0.01}
      />
    </CalculatorShell>
  );
}