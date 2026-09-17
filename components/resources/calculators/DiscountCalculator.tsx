'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

type DiscountMode =
  | 'percentage'
  | 'fixed';

const modes: {
  id: DiscountMode;
  label: string;
}[] = [
    {
      id: 'percentage',
      label: 'Percentage discount',
    },
    {
      id: 'fixed',
      label: 'Fixed discount',
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

export function DiscountCalculator() {
  const [mode, setMode] =
    useState<DiscountMode>('percentage');

  const [originalPrice, setOriginalPrice] =
    useState('100');

  const [discountPercent, setDiscountPercent] =
    useState('20');

  const [fixedDiscount, setFixedDiscount] =
    useState('20');

  const result = useMemo(() => {
    const price = Math.max(
      parseValue(originalPrice),
      0
    );

    if (mode === 'percentage') {
      const percent = Math.max(
        parseValue(discountPercent),
        0
      );

      const discountAmount =
        price * (percent / 100);

      const finalPrice =
        Math.max(
          price - discountAmount,
          0
        );

      const effectiveDiscount =
        price === 0
          ? 0
          : (discountAmount / price) * 100;

      return {
        price,
        discountAmount,
        finalPrice,
        effectiveDiscount,
      };
    }

    const requestedDiscount = Math.max(
      parseValue(fixedDiscount),
      0
    );

    const discountAmount =
      Math.min(
        requestedDiscount,
        price
      );

    const finalPrice =
      Math.max(
        price - discountAmount,
        0
      );

    const effectiveDiscount =
      price === 0
        ? 0
        : (discountAmount / price) * 100;

    return {
      price,
      discountAmount,
      finalPrice,
      effectiveDiscount,
    };
  }, [
    mode,
    originalPrice,
    discountPercent,
    fixedDiscount,
  ]);

  return (
    <CalculatorShell
      title="Discount Calculator"
      description="Calculate the final price, total savings, and effective discount from a percentage or fixed discount amount."
      result={
        <CalculatorResult
          label="Final price"
          value={formatCurrency(
            result.finalPrice
          )}
          description="The price remaining after the discount is applied."
          items={[
            {
              label: 'Original price',
              value: formatCurrency(
                result.price
              ),
            },
            {
              label: 'You save',
              value: formatCurrency(
                result.discountAmount
              ),
            },
            {
              label: 'Effective discount',
              value: formatPercent(
                result.effectiveDiscount
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
              Percentage discount
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              A percentage discount reduces the original price by a selected percentage.
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
              Savings = Price × Discount %
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
              Fixed discount
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              A fixed discount subtracts a specific dollar amount from the original price.
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
              Final price
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              The calculator prevents the final price from falling below zero when a discount is larger than the original price.
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
          Discount type
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

      <CalculatorField
        label="Original price"
        value={originalPrice}
        onChange={setOriginalPrice}
        prefix="$"
        min={0}
        step={0.01}
      />

      {mode === 'percentage' ? (
        <CalculatorField
          label="Discount"
          value={discountPercent}
          onChange={setDiscountPercent}
          suffix="%"
          min={0}
          step={0.01}
        />
      ) : (
        <CalculatorField
          label="Discount amount"
          value={fixedDiscount}
          onChange={setFixedDiscount}
          prefix="$"
          min={0}
          step={0.01}
        />
      )}
    </CalculatorShell>
  );
}