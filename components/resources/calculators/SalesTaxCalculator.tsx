'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

type StateRate = {
  code: string;
  name: string;
  rate: number;
};

const stateRates: StateRate[] = [
  { code: 'AL', name: 'Alabama', rate: 4 },
  { code: 'AK', name: 'Alaska', rate: 0 },
  { code: 'AZ', name: 'Arizona', rate: 5.6 },
  { code: 'AR', name: 'Arkansas', rate: 6.5 },
  { code: 'CA', name: 'California', rate: 7.25 },
  { code: 'CO', name: 'Colorado', rate: 2.9 },
  { code: 'CT', name: 'Connecticut', rate: 6.35 },
  { code: 'DE', name: 'Delaware', rate: 0 },
  { code: 'FL', name: 'Florida', rate: 6 },
  { code: 'GA', name: 'Georgia', rate: 4 },
  { code: 'HI', name: 'Hawaii', rate: 4 },
  { code: 'ID', name: 'Idaho', rate: 6 },
  { code: 'IL', name: 'Illinois', rate: 6.25 },
  { code: 'IN', name: 'Indiana', rate: 7 },
  { code: 'IA', name: 'Iowa', rate: 6 },
  { code: 'KS', name: 'Kansas', rate: 6.5 },
  { code: 'KY', name: 'Kentucky', rate: 6 },
  { code: 'LA', name: 'Louisiana', rate: 5 },
  { code: 'ME', name: 'Maine', rate: 5.5 },
  { code: 'MD', name: 'Maryland', rate: 6 },
  { code: 'MA', name: 'Massachusetts', rate: 6.25 },
  { code: 'MI', name: 'Michigan', rate: 6 },
  { code: 'MN', name: 'Minnesota', rate: 6.875 },
  { code: 'MS', name: 'Mississippi', rate: 7 },
  { code: 'MO', name: 'Missouri', rate: 4.225 },
  { code: 'MT', name: 'Montana', rate: 0 },
  { code: 'NE', name: 'Nebraska', rate: 5.5 },
  { code: 'NV', name: 'Nevada', rate: 6.85 },
  { code: 'NH', name: 'New Hampshire', rate: 0 },
  { code: 'NJ', name: 'New Jersey', rate: 6.625 },
  { code: 'NM', name: 'New Mexico', rate: 4.875 },
  { code: 'NY', name: 'New York', rate: 4 },
  { code: 'NC', name: 'North Carolina', rate: 4.75 },
  { code: 'ND', name: 'North Dakota', rate: 5 },
  { code: 'OH', name: 'Ohio', rate: 5.75 },
  { code: 'OK', name: 'Oklahoma', rate: 4.5 },
  { code: 'OR', name: 'Oregon', rate: 0 },
  { code: 'PA', name: 'Pennsylvania', rate: 6 },
  { code: 'RI', name: 'Rhode Island', rate: 7 },
  { code: 'SC', name: 'South Carolina', rate: 6 },
  { code: 'SD', name: 'South Dakota', rate: 4.2 },
  { code: 'TN', name: 'Tennessee', rate: 7 },
  { code: 'TX', name: 'Texas', rate: 6.25 },
  { code: 'UT', name: 'Utah', rate: 6.1 },
  { code: 'VT', name: 'Vermont', rate: 6 },
  { code: 'VA', name: 'Virginia', rate: 5.3 },
  { code: 'WA', name: 'Washington', rate: 6.5 },
  { code: 'WV', name: 'West Virginia', rate: 6 },
  { code: 'WI', name: 'Wisconsin', rate: 5 },
  { code: 'WY', name: 'Wyoming', rate: 4 },
  { code: 'DC', name: 'District of Columbia', rate: 6 },
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
    maximumFractionDigits: 3,
  }).format(value)}%`;
}

export function SalesTaxCalculator() {
  const [amount, setAmount] =
    useState('100');

  const [selectedState, setSelectedState] =
    useState('TX');

  const [localRate, setLocalRate] =
    useState('0');

  const [useCustomRate, setUseCustomRate] =
    useState(false);

  const [customRate, setCustomRate] =
    useState('8.25');

  const result = useMemo(() => {
    const subtotal = Math.max(
      parseValue(amount),
      0
    );

    const state =
      stateRates.find(
        (item) =>
          item.code === selectedState
      ) ?? stateRates[0];

    const stateRate = Math.max(
      state.rate,
      0
    );

    const additionalLocalRate = Math.max(
      parseValue(localRate),
      0
    );

    const manualRate = Math.max(
      parseValue(customRate),
      0
    );

    const effectiveRate =
      useCustomRate
        ? manualRate
        : stateRate +
        additionalLocalRate;

    const tax =
      subtotal *
      (effectiveRate / 100);

    const total =
      subtotal + tax;

    return {
      subtotal,
      state,
      stateRate,
      localRate: additionalLocalRate,
      effectiveRate,
      tax,
      total,
    };
  }, [
    amount,
    selectedState,
    localRate,
    useCustomRate,
    customRate,
  ]);

  return (
    <CalculatorShell
      title="Sales Tax Calculator"
      description="Estimate sales tax using a U.S. state-level tax preset, an additional local rate, or your own custom tax rate."
      result={
        <CalculatorResult
          label="Total after tax"
          value={formatCurrency(
            result.total
          )}
          description={
            useCustomRate
              ? 'Calculated using the custom sales tax rate you entered.'
              : 'Calculated using the selected state-level rate plus any local rate you entered.'
          }
          items={[
            {
              label: 'Subtotal',
              value: formatCurrency(
                result.subtotal
              ),
            },
            {
              label: 'Sales tax',
              value: formatCurrency(
                result.tax
              ),
            },
            {
              label: 'Effective tax rate',
              value: formatPercent(
                result.effectiveRate
              ),
            },
            ...(!useCustomRate
              ? [
                {
                  label:
                    'State-level rate',
                  value: formatPercent(
                    result.stateRate
                  ),
                },
                {
                  label:
                    'Additional local rate',
                  value: formatPercent(
                    result.localRate
                  ),
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
              Sales tax
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Sales tax is calculated by multiplying the taxable purchase amount by the applicable tax rate.
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
              Tax = Price × Tax Rate
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
              State + local rates
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Many states allow counties, cities, or special districts to add local sales taxes. Add the applicable local rate when you know it.
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
              Taxability varies
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Actual sales tax can vary by location, product or service type, exemptions, and other rules. Use the custom option when you know the exact applicable rate.
            </p>
          </div>
        </div>
      }
    >
      <CalculatorField
        label="Purchase amount"
        value={amount}
        onChange={setAmount}
        prefix="$"
        min={0}
        step={0.01}
      />

      {/* Rate mode */}
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
          Tax rate
        </span>

        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() =>
              setUseCustomRate(false)
            }
            className={`
              rounded-xl
              border
              px-4
              py-3
              text-sm
              font-medium
              transition-colors
              ${!useCustomRate
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
            State preset
          </button>

          <button
            type="button"
            onClick={() =>
              setUseCustomRate(true)
            }
            className={`
              rounded-xl
              border
              px-4
              py-3
              text-sm
              font-medium
              transition-colors
              ${useCustomRate
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
            Custom rate
          </button>
        </div>
      </div>

      {!useCustomRate ? (
        <>
          <label className="block">
            <span
              className="
                mb-2
                block
                text-sm
                font-medium
                text-foreground
              "
            >
              State
            </span>

            <select
              value={selectedState}
              onChange={(event) =>
                setSelectedState(
                  event.target.value
                )
              }
              className="
                min-h-[52px]
                w-full
                rounded-2xl
                border
                border-border
                bg-background
                px-4
                py-3
                text-base
                text-foreground
                outline-none
                transition-colors
                focus:border-foreground/40
                focus:ring-2
                focus:ring-ring/20
              "
            >
              {stateRates.map(
                (state) => (
                  <option
                    key={state.code}
                    value={state.code}
                  >
                    {state.name} —{' '}
                    {formatPercent(
                      state.rate
                    )}
                  </option>
                )
              )}
            </select>

            <span
              className="
                mt-2
                block
                text-xs
                leading-5
                text-muted-foreground
              "
            >
              State-level rate only. Local rates may apply.
            </span>
          </label>

          <CalculatorField
            label="Additional local tax rate"
            value={localRate}
            onChange={setLocalRate}
            suffix="%"
            min={0}
            step={0.01}
            helperText="Optional. Add the applicable city, county, or district rate."
          />
        </>
      ) : (
        <CalculatorField
          label="Custom sales tax rate"
          value={customRate}
          onChange={setCustomRate}
          suffix="%"
          min={0}
          step={0.001}
          helperText="Enter the complete sales tax rate you want applied."
        />
      )}
    </CalculatorShell>
  );
}