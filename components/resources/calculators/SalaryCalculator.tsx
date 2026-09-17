'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

type SalaryPeriod =
  | 'hour'
  | 'day'
  | 'week'
  | 'month'
  | 'year';

const periods: {
  id: SalaryPeriod;
  label: string;
}[] = [
    {
      id: 'hour',
      label: 'Hourly',
    },
    {
      id: 'day',
      label: 'Daily',
    },
    {
      id: 'week',
      label: 'Weekly',
    },
    {
      id: 'month',
      label: 'Monthly',
    },
    {
      id: 'year',
      label: 'Yearly',
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

export function SalaryCalculator() {
  const [period, setPeriod] =
    useState<SalaryPeriod>('year');

  const [amount, setAmount] =
    useState('60000');

  const [hoursPerWeek, setHoursPerWeek] =
    useState('40');

  const [daysPerWeek, setDaysPerWeek] =
    useState('5');

  const [weeksPerYear, setWeeksPerYear] =
    useState('52');

  const result = useMemo(() => {
    const income = Math.max(
      parseValue(amount),
      0
    );

    const hours = Math.max(
      parseValue(hoursPerWeek),
      0
    );

    const days = Math.max(
      parseValue(daysPerWeek),
      0
    );

    const weeks = Math.max(
      parseValue(weeksPerYear),
      0
    );

    const safeHours =
      hours > 0 ? hours : 1;

    const safeDays =
      days > 0 ? days : 1;

    const safeWeeks =
      weeks > 0 ? weeks : 1;

    let annualIncome = 0;

    switch (period) {
      case 'hour':
        annualIncome =
          income *
          safeHours *
          safeWeeks;
        break;

      case 'day':
        annualIncome =
          income *
          safeDays *
          safeWeeks;
        break;

      case 'week':
        annualIncome =
          income *
          safeWeeks;
        break;

      case 'month':
        annualIncome =
          income * 12;
        break;

      case 'year':
        annualIncome = income;
        break;
    }

    const yearly = annualIncome;

    const monthly =
      yearly / 12;

    const weekly =
      yearly / safeWeeks;

    const daily =
      weekly / safeDays;

    const hourly =
      weekly / safeHours;

    return {
      yearly,
      monthly,
      weekly,
      daily,
      hourly,
    };
  }, [
    period,
    amount,
    hoursPerWeek,
    daysPerWeek,
    weeksPerYear,
  ]);

  const periodLabel =
    periods.find(
      (item) => item.id === period
    )?.label ?? 'Income';

  return (
    <CalculatorShell
      title="Salary Calculator"
      description="Convert your income between hourly, daily, weekly, monthly, and annual pay. Adjust your work schedule to get a more accurate equivalent rate."
      result={
        <CalculatorResult
          label="Estimated annual income"
          value={formatCurrency(
            result.yearly
          )}
          description="Estimated gross income before taxes, benefits, deductions, or unpaid time off."
          items={[
            {
              label: 'Hourly',
              value: formatCurrency(
                result.hourly
              ),
            },
            {
              label: 'Daily',
              value: formatCurrency(
                result.daily
              ),
            },
            {
              label: 'Weekly',
              value: formatCurrency(
                result.weekly
              ),
            },
            {
              label: 'Monthly',
              value: formatCurrency(
                result.monthly
              ),
            },
            {
              label: 'Yearly',
              value: formatCurrency(
                result.yearly
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
              Compare pay rates
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Enter income using any common pay period and compare its equivalent across the others.
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
              Adjust your schedule
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Change hours per week, days per week, or working weeks per year to reflect your actual schedule.
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
              Gross income
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              These figures represent gross income and do not account for taxes, deductions, or benefits.
            </p>
          </div>
        </div>
      }
    >
      {/* Pay period */}
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
          Income period
        </span>

        <div
          className="
            grid
            grid-cols-2
            gap-2
            sm:grid-cols-5
          "
        >
          {periods.map((item) => {
            const active =
              period === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  setPeriod(item.id)
                }
                className={`
                  rounded-xl
                  border
                  px-3
                  py-3
                  text-center
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
        label={`${periodLabel} income`}
        value={amount}
        onChange={setAmount}
        prefix="$"
        min={0}
        step={0.01}
      />

      <div
        className="
          grid
          gap-5
          sm:grid-cols-2
        "
      >
        <CalculatorField
          label="Hours per week"
          value={hoursPerWeek}
          onChange={setHoursPerWeek}
          suffix="hours"
          min={1}
          max={168}
          step={1}
        />

        <CalculatorField
          label="Days per week"
          value={daysPerWeek}
          onChange={setDaysPerWeek}
          suffix="days"
          min={1}
          max={7}
          step={1}
        />
      </div>

      <CalculatorField
        label="Working weeks per year"
        value={weeksPerYear}
        onChange={setWeeksPerYear}
        suffix="weeks"
        min={1}
        max={52}
        step={1}
        helperText="Use fewer than 52 weeks if you want unpaid vacation or time off excluded."
      />
    </CalculatorShell>
  );
}