'use client';

import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ConditionRating } from '@/lib/types';

const ratingConfig: Record<
  ConditionRating,
  { color: string; bgColor: string; label: string }
> = {
  excellent: {
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    label: 'Excellent',
  },
  good: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Good' },
  fair: { color: 'text-amber-700', bgColor: 'bg-amber-100', label: 'Fair' },
  project: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Project' },
};

interface ConditionSummaryProps {
  rating: ConditionRating;
  details: Record<string, unknown>;
}

export function ConditionSummary({ rating, details }: ConditionSummaryProps) {
  const config = ratingConfig[rating];
  const entries = Object.entries(details);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Badge
          className={cn(
            'px-3 py-1 text-sm font-semibold border-0',
            config.bgColor,
            config.color
          )}
        >
          {config.label} Condition
        </Badge>
      </div>

      {entries.length > 0 && (
        <div className="grid gap-2 sm:grid-cols-2">
          {entries.map(([key, value]) => {
            const isGood = value === true || value === 'good' || value === 'yes';
            const isBad =
              value === false || value === 'bad' || value === 'poor' || value === 'no';

            return (
              <div
                key={key}
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
              >
                {isGood ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                ) : isBad ? (
                  <XCircle className="size-4 shrink-0 text-red-500" />
                ) : (
                  <AlertCircle className="size-4 shrink-0 text-amber-500" />
                )}
                <span className="text-sm capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                {typeof value === 'string' &&
                  value !== 'good' &&
                  value !== 'bad' &&
                  value !== 'yes' &&
                  value !== 'no' &&
                  value !== 'poor' && (
                    <span className="ml-auto text-xs text-muted-foreground capitalize">
                      {value}
                    </span>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
