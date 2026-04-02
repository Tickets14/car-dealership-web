'use client';

import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/lib/hooks/use-settings';
import type { InstallmentTerms } from '@/lib/types';

interface FinancingCalculatorProps {
  price: number;
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(n);
}

function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (principal <= 0 || months <= 0) return 0;
  if (annualRate <= 0) return principal / months;
  const monthlyRate = annualRate / 100 / 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

export function FinancingCalculator({ price }: FinancingCalculatorProps) {
  const { data: settings, isLoading } = useSettings(['installment_terms']);

  const terms: InstallmentTerms = useMemo(() => {
    if (settings?.installment_terms) {
      try {
        const parsed =
          typeof settings.installment_terms === 'string'
            ? JSON.parse(settings.installment_terms)
            : settings.installment_terms;
        return parsed as InstallmentTerms;
      } catch {
        // fall through to defaults
      }
    }
    return {
      interest_rate_annual: 8,
      available_terms: [12, 24, 36, 48, 60],
      min_down_payment_percent: 20,
    };
  }, [settings]);

  const minDown = Math.ceil(price * (terms.min_down_payment_percent / 100));
  const [downPayment, setDownPayment] = useState(minDown);
  const [selectedTerm, setSelectedTerm] = useState(
    terms.available_terms[2] ?? 36
  );
  const [tradeIn, setTradeIn] = useState(0);

  const effectiveDown = Math.max(downPayment, minDown);
  const loanAmount = Math.max(price - effectiveDown - tradeIn, 0);
  const monthly = calculateMonthlyPayment(
    loanAmount,
    terms.interest_rate_annual,
    selectedTerm
  );
  const totalCost = monthly * selectedTerm;
  const totalInterest = totalCost - loanAmount;

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-xl border bg-card p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-xl border bg-card p-6">
      <div className="flex items-center gap-2">
        <Calculator className="size-5 text-primary-600" />
        <h3 className="text-lg font-semibold">Financing Calculator</h3>
      </div>

      {/* Down Payment */}
      <div className="space-y-2">
        <Label htmlFor="downpayment">
          Down Payment ({terms.min_down_payment_percent}% min)
        </Label>
        <div className="flex items-center gap-3">
          <Slider
            min={minDown}
            max={price}
            value={[effectiveDown]}
            onValueChange={(value) => {
              const v = Array.isArray(value) ? value[0] : value;
              setDownPayment(v);
            }}
            className="flex-1"
          />
          <Input
            id="downpayment"
            type="number"
            min={minDown}
            max={price}
            value={effectiveDown}
            onChange={(e) => setDownPayment(Number(e.target.value))}
            className="w-32 tabular-nums"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          {formatCurrency(effectiveDown)} (
          {((effectiveDown / price) * 100).toFixed(0)}%)
        </p>
      </div>

      {/* Term */}
      <div className="space-y-2">
        <Label>Loan Term (months)</Label>
        <RadioGroup
          value={String(selectedTerm)}
          onValueChange={(v: string) => setSelectedTerm(Number(v))}
          className="flex flex-wrap gap-2"
        >
          {terms.available_terms.map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
            >
              <RadioGroupItem value={String(t)} />
              {t}mo
            </label>
          ))}
        </RadioGroup>
      </div>

      {/* Trade-in */}
      <div className="space-y-2">
        <Label htmlFor="tradein">Trade-in Value (optional)</Label>
        <Input
          id="tradein"
          type="number"
          min={0}
          max={price}
          value={tradeIn || ''}
          onChange={(e) => setTradeIn(Number(e.target.value) || 0)}
          placeholder="₱0"
          className="tabular-nums"
        />
      </div>

      {/* Result */}
      <div className="rounded-xl bg-primary-50 p-4 space-y-3">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Estimated Monthly Payment
          </p>
          <p className="text-3xl font-bold text-primary-600 tabular-nums">
            {formatCurrency(monthly)}
            <span className="text-base font-normal text-muted-foreground">
              /mo
            </span>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between rounded-lg bg-white/80 px-3 py-2">
            <span className="text-muted-foreground">Loan Amount</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(loanAmount)}
            </span>
          </div>
          <div className="flex justify-between rounded-lg bg-white/80 px-3 py-2">
            <span className="text-muted-foreground">Interest</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(totalInterest)}
            </span>
          </div>
          <div className="flex justify-between rounded-lg bg-white/80 px-3 py-2">
            <span className="text-muted-foreground">Total Cost</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(totalCost + effectiveDown + tradeIn)}
            </span>
          </div>
          <div className="flex justify-between rounded-lg bg-white/80 px-3 py-2">
            <span className="text-muted-foreground">Rate</span>
            <span className="font-medium tabular-nums">
              {terms.interest_rate_annual}% p.a.
            </span>
          </div>
        </div>
        <p className="text-center text-[11px] text-muted-foreground">
          Estimates are for reference only and may vary from actual financing
          terms.
        </p>
      </div>
    </div>
  );
}
