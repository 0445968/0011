'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

function parseValue(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

export function ConversionRateCalculator() {
  const [visitors, setVisitors] =
    useState('10000');

  const [conversions, setConversions] =
    useState('350');

  const result = useMemo(() => {
    const totalVisitors = Math.max(
      parseValue(visitors),
      0
    );

    const totalConversions = Math.max(
      parseValue(conversions),
      0
    );

    const conversionRate =
      totalVisitors === 0
        ? null
        : (totalConversions / totalVisitors) * 100;

    const nonConversions = Math.max(
      totalVisitors - totalConversions,
      0
    );

    const visitorsPerConversion =
      totalConversions === 0
        ? null
        : totalVisitors / totalConversions;

    return {
      totalVisitors,
      totalConversions,
      conversionRate,
      nonConversions,
      visitorsPerConversion,
    };
  }, [
    visitors,
    conversions,
  ]);

  const conversionsExceedVisitors =
    result.totalConversions >
    result.totalVisitors;

  return (
    <CalculatorShell
      title="Conversion Rate Calculator"
      description="Calculate the percentage of visitors, leads, or users who complete a desired action."
      result={
        <CalculatorResult
          label="Conversion rate"
          value={
            result.conversionRate === null
              ? '—'
              : formatPercent(
                result.conversionRate
              )
          }
          description={
            result.conversionRate === null
              ? 'Enter more than zero visitors to calculate a conversion rate.'
              : conversionsExceedVisitors
                ? 'Conversions are greater than total visitors. Check the values if each visitor can only convert once.'
                : 'The percentage of total visitors who completed the desired action.'
          }
          items={[
            {
              label: 'Visitors',
              value: formatNumber(
                result.totalVisitors
              ),
            },
            {
              label: 'Conversions',
              value: formatNumber(
                result.totalConversions
              ),
            },
            {
              label: 'Non-conversions',
              value: formatNumber(
                result.nonConversions
              ),
            },
            {
              label: 'Visitors per conversion',
              value:
                result.visitorsPerConversion === null
                  ? '—'
                  : formatNumber(
                    result.visitorsPerConversion
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
              Conversion rate
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Conversion rate measures how many people complete your target action compared with the total audience.
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
              Rate = Conversions ÷ Visitors × 100
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
              What counts as a conversion?
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              A conversion can be a purchase, signup, booked call, form submission, download, registration, or any other goal.
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
              Compare like with like
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Use visitors and conversions from the same campaign, page, audience, and reporting period for a useful comparison.
            </p>
          </div>
        </div>
      }
    >
      <CalculatorField
        label="Visitors"
        value={visitors}
        onChange={setVisitors}
        min={0}
        step={1}
        helperText="Enter the total number of visitors, leads, users, or opportunities."
      />

      <CalculatorField
        label="Conversions"
        value={conversions}
        onChange={setConversions}
        min={0}
        step={1}
        helperText="Enter how many completed the action you are measuring."
      />
    </CalculatorShell>
  );
}