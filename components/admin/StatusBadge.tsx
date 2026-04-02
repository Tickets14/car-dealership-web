import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  // Car statuses
  available: 'bg-emerald-100 text-emerald-800',
  reserved: 'bg-amber-100 text-amber-800',
  sold: 'bg-red-100 text-red-800',
  draft: 'bg-gray-100 text-gray-600',

  // Submission statuses
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-red-100 text-red-800',
  counter_offered: 'bg-blue-100 text-blue-800',

  // Inquiry statuses
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-cyan-100 text-cyan-800',
  qualified: 'bg-emerald-100 text-emerald-800',
  visit_scheduled: 'bg-purple-100 text-purple-800',
  converted: 'bg-emerald-100 text-emerald-800',
  lost: 'bg-gray-100 text-gray-600',

  // Pre-qualification
  not_qualified: 'bg-red-100 text-red-800',
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = status.replace(/_/g, ' ');

  return (
    <Badge
      className={cn(
        'border-0 capitalize',
        statusStyles[status] ?? 'bg-gray-100 text-gray-600',
        className
      )}
    >
      {label}
    </Badge>
  );
}
