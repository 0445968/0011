'use client';

import { useMemo, useState } from 'react';

import { CalculatorField } from './CalculatorField';
import { CalculatorResult } from './CalculatorResult';
import { CalculatorShell } from './CalculatorShell';

type MarkupMode =
  | 'from-cost-price'
  | 'from-cost-markup';

const modes: {
  id: MarkupMode;
  label: string;
}[] = [
    {
      id: 'from-cost-price',
      label: 'Cost + selling price',
    },
    {
      id: 'from-cost-markup',
      label: 'Cost + markup',
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

export function MarkupCalculator() {
  const [mode, setMode] =
    useState<MarkupMode>('from-cost-price');

  const [cost, setCost] =
    useState('50');

  const [sellingPrice, setSellingPrice] =
    useState('75');

  const [markupRate, setMarkupRate] =
    useState('50');

  const result = useMemo(() => {
    const productCost = Math.max(
      parseValue(cost),
      0
    );

    if (mode === 'from-cost-price') {
      const price = Math.max(
        parseValue(sellingPrice),
        0
      );

      const grossProfit =
        price - productCost;

      const markup =
        productCost === 0
          ? 0
          : (grossProfit / productCost) * 100;

      const margin =
        price === 0
          ? 0
          : (grossProfit / price) * 100;

      return {
        productCost,
        sellingPrice: price,
        grossProfit,
        markup,
        margin,
      };
    }

    const markup = Math.max(
      parseValue(markupRate),
      0
    );

    const grossProfit =
      productCost * (markup / 100);

    const price =
      productCost + grossProfit;

    const margin =
      price === 0
        ? 0
        : (grossProfit / price) * 100;

    return {
      productCost,
      sellingPrice: price,
      grossProfit,
      markup,
      margin,
    };
  }, [
    mode,
    cost,
    sellingPrice,
    markupRate,
  ]);

  return (
    <CalculatorShell
      title="Markup Calculator"
      description="Calculate markup percentage, selling price, gross profit, and margin from your product or service cost."
      result={
        <CalculatorResult
          label={
            mode === 'from-cost-price'
              ? 'Markup'
              : 'Selling price'
          }
          value={
            mode === 'from-cost-price'
              ? formatPercent(result.markup)
              : formatCurrency(result.sellingPrice)
          }
          description={
            mode === 'from-cost-price'
              ? 'Markup measures profit as a percentage of your original cost.'
              : 'The estimated selling price based on your cost and target markup.'
          }
          items={[
            {
              label: 'Cost',
              value: formatCurrency(
                result.productCost
              ),
            },
            {
              label: 'Selling price',
              value: formatCurrency(
                result.sellingPrice
              ),
            },
            {
              label: 'Gross profit',
              value: formatCurrency(
                result.grossProfit
              ),
            },
            {
              label: 'Markup',
              value: formatPercent(
                result.markup
              ),
            },
            {
              label: 'Margin',
              value: formatPercent(
                result.margin
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
              Markup
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Markup compares your profit with the original cost of the product or service.
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
              Markup = (Price − Cost) ÷ Cost × 100
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
              Selling price
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Enter a target markup to calculate the selling price needed to achieve it.
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
              Price = Cost × (1 + Markup)
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
              Markup vs margin
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Markup is based on cost, while margin measures profit as a percentage of the final selling price.
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

        <div
          className="
            grid
            gap-2
            sm:grid-cols-2
          "
        >
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
        label="Cost"
        value={cost}
        onChange={setCost}
        prefix="$"
        min={0}
        step={0.01}
      />

      {mode === 'from-cost-price' ? (
        <CalculatorField
          label="Selling price"
          value={sellingPrice}
          onChange={setSellingPrice}
          prefix="$"
          min={0}
          step={0.01}
        />
      ) : (
        <CalculatorField
          label="Markup"
          value={markupRate}
          onChange={setMarkupRate}
          suffix="%"
          min={0}
          step={0.01}
        />
      )}
    </CalculatorShell>
  );
}