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

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 4,
  }).format(value);
}

export function StockGainsCalculator() {
  const [shares, setShares] =
    useState('100');

  const [purchasePrice, setPurchasePrice] =
    useState('25');

  const [salePrice, setSalePrice] =
    useState('32');

  const [buyFees, setBuyFees] =
    useState('0');

  const [sellFees, setSellFees] =
    useState('0');

  const result = useMemo(() => {
    const totalShares = Math.max(
      parseValue(shares),
      0
    );

    const buyPrice = Math.max(
      parseValue(purchasePrice),
      0
    );

    const exitPrice = Math.max(
      parseValue(salePrice),
      0
    );

    const purchaseFees = Math.max(
      parseValue(buyFees),
      0
    );

    const saleFees = Math.max(
      parseValue(sellFees),
      0
    );

    const grossPurchaseValue =
      totalShares * buyPrice;

    const costBasis =
      grossPurchaseValue +
      purchaseFees;

    const grossSaleValue =
      totalShares * exitPrice;

    const proceeds =
      Math.max(
        grossSaleValue -
        saleFees,
        0
      );

    const gainLoss =
      proceeds - costBasis;

    const gainLossPercent =
      costBasis === 0
        ? null
        : (gainLoss /
          costBasis) *
        100;

    const priceChange =
      exitPrice -
      buyPrice;

    const priceChangePercent =
      buyPrice === 0
        ? null
        : (priceChange /
          buyPrice) *
        100;

    const breakEvenSalePrice =
      totalShares === 0
        ? null
        : (
          costBasis +
          saleFees
        ) /
        totalShares;

    return {
      totalShares,
      buyPrice,
      exitPrice,
      purchaseFees,
      saleFees,
      grossPurchaseValue,
      costBasis,
      grossSaleValue,
      proceeds,
      gainLoss,
      gainLossPercent,
      priceChange,
      priceChangePercent,
      breakEvenSalePrice,
    };
  }, [
    shares,
    purchasePrice,
    salePrice,
    buyFees,
    sellFees,
  ]);

  const profitable =
    result.gainLoss >= 0;

  return (
    <CalculatorShell
      title="Stock Gains Calculator"
      description="Calculate stock investment gains or losses using purchase price, sale price, number of shares, and trading fees."
      result={
        <CalculatorResult
          label={
            profitable
              ? 'Investment gain'
              : 'Investment loss'
          }
          value={formatCurrency(
            result.gainLoss
          )}
          description={
            result.gainLossPercent === null
              ? 'Enter a valid investment cost to calculate your return percentage.'
              : profitable
                ? 'Estimated gain after including the purchase and sale fees you entered.'
                : 'Estimated loss after including the purchase and sale fees you entered.'
          }
          items={[
            {
              label:
                'Cost basis',
              value: formatCurrency(
                result.costBasis
              ),
            },
            {
              label:
                'Net proceeds',
              value: formatCurrency(
                result.proceeds
              ),
            },
            {
              label:
                'Return',
              value:
                result.gainLossPercent === null
                  ? '—'
                  : formatPercent(
                    result.gainLossPercent
                  ),
            },
            {
              label:
                'Share price change',
              value: formatCurrency(
                result.priceChange
              ),
            },
            {
              label:
                'Price change',
              value:
                result.priceChangePercent === null
                  ? '—'
                  : formatPercent(
                    result.priceChangePercent
                  ),
            },
            {
              label:
                'Break-even sale price',
              value:
                result.breakEvenSalePrice === null
                  ? '—'
                  : formatCurrency(
                    result.breakEvenSalePrice
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
              Cost basis
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Cost basis is the amount spent to acquire the shares, including any purchase fees entered.
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
              Cost Basis = Shares × Purchase Price + Buy Fees
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
              Gain or loss
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              Investment gain or loss compares your net sale proceeds with your total cost basis.
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
              Gain = Proceeds − Cost Basis
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
              Taxes not included
            </h2>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-muted-foreground
              "
            >
              This calculator does not estimate capital gains taxes, dividends, currency effects, tax lots, or other investment costs.
            </p>
          </div>
        </div>
      }
    >
      <CalculatorField
        label="Number of shares"
        value={shares}
        onChange={setShares}
        min={0}
        step={0.0001}
        helperText="Fractional shares are supported."
      />

      <CalculatorField
        label="Purchase price per share"
        value={purchasePrice}
        onChange={setPurchasePrice}
        prefix="$"
        min={0}
        step={0.01}
      />

      <CalculatorField
        label="Sale or current price per share"
        value={salePrice}
        onChange={setSalePrice}
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
          label="Purchase fees"
          value={buyFees}
          onChange={setBuyFees}
          prefix="$"
          min={0}
          step={0.01}
        />

        <CalculatorField
          label="Sale fees"
          value={sellFees}
          onChange={setSellFees}
          prefix="$"
          min={0}
          step={0.01}
        />
      </div>
    </CalculatorShell>
  );
}