'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

type RevenueMode =
  | 'units'
  | 'customers';

const modes: {
  id: RevenueMode;
  label: string;
}[] = [
    {
      id: 'units',
      label: 'Units sold',
    },
    {
      id: 'customers',
      label: 'Customers',
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

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value);
}

export function RevenueCalculator() {
  const [mode, setMode] =
    useState<RevenueMode>('units');

  const [units, setUnits] =
    useState('500');

  const [pricePerUnit, setPricePerUnit] =
    useState('40');

  const [customers, setCustomers] =
    useState('250');

  const [revenuePerCustomer, setRevenuePerCustomer] =
    useState('80');

  const [periods, setPeriods] =
    useState('1');

  const result = useMemo(() => {
    const totalPeriods = Math.max(
      parseValue(periods),
      0
    );

    if (mode === 'units') {
      const totalUnits = Math.max(
        parseValue(units),
        0
      );

      const price = Math.max(
        parseValue(pricePerUnit),
        0
      );

      const revenuePerPeriod =
        totalUnits * price;

      const totalRevenue =
        revenuePerPeriod * totalPeriods;

      return {
        revenuePerPeriod,
        totalRevenue,
        quantity: totalUnits,
        valuePerItem: price,
      };
    }

    const totalCustomers = Math.max(
      parseValue(customers),
      0
    );

    const averageRevenue = Math.max(
      parseValue(revenuePerCustomer),
      0
    );

    const revenuePerPeriod =
      totalCustomers * averageRevenue;

    const totalRevenue =
      revenuePerPeriod * totalPeriods;

    return {
      revenuePerPeriod,
      totalRevenue,
      quantity: totalCustomers,
      valuePerItem: averageRevenue,
    };
  }, [
    mode,
    units,
    pricePerUnit,
    customers,
    revenuePerCustomer,
    periods,
  ]);

  return (
    <CalculatorShell
      title="Revenue Calculator"
      description="Estimate total revenue from units sold and price, or from customers and average revenue per customer."
      result={
        <CalculatorResult
          label="Total revenue"
          value={formatCurrency(
            result.totalRevenue
          )}
          description="Estimated gross revenue before costs, taxes, refunds, or other deductions."
          items={[
            {
              label: 'Revenue per period',
              value: formatCurrency(
                result.revenuePerPeriod
              ),
            },
            {
              label:
                mode === 'units'
                  ? 'Units per period'
                  : 'Customers per period',
              value: formatNumber(
                result.quantity
              ),
            },
            {
              label:
                mode === 'units'
                  ? 'Price per unit'
                  : 'Revenue per customer',
              value: formatCurrency(
                result.valuePerItem
              ),
            },
            {
              label: 'Number of periods',
              value: formatNumber(
                Math.max(
                  parseValue(periods),
                  0
                )
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
              Unit revenue
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              For product-based businesses, revenue can be estimated by multiplying units sold by the selling price.
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
              Revenue = Units × Price
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
              Customer revenue
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Service and subscription businesses can estimate revenue using customer count and average revenue per customer.
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
              Revenue = Customers × Revenue per Customer
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
              Multiple periods
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Use the number of periods to project the same revenue level across several months, quarters, weeks, or other periods.
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
          Revenue model
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
                  text-left
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

      {mode === 'units' ? (
        <>
          <CalculatorField
            label="Units sold per period"
            value={units}
            onChange={setUnits}
            min={0}
            step={1}
          />

          <CalculatorField
            label="Price per unit"
            value={pricePerUnit}
            onChange={setPricePerUnit}
            prefix="$"
            min={0}
            step={0.01}
          />
        </>
      ) : (
        <>
          <CalculatorField
            label="Customers per period"
            value={customers}
            onChange={setCustomers}
            min={0}
            step={1}
          />

          <CalculatorField
            label="Average revenue per customer"
            value={revenuePerCustomer}
            onChange={setRevenuePerCustomer}
            prefix="$"
            min={0}
            step={0.01}
          />
        </>
      )}

      <CalculatorField
        label="Number of periods"
        value={periods}
        onChange={setPeriods}
        min={1}
        step={1}
        helperText="For example, enter 12 to project the same monthly revenue across one year."
      />
    </CalculatorShell>
  );
}