'use client';

import { FileText } from 'lucide-react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

interface RequirementsProps {
  docs: string[];
}

const REQUIREMENT_GROUPS = [
  {
    title: 'Cash Purchase',
    items: [
      '2 valid government-issued IDs',
      'Proof of billing address',
      'TIN or BIR documents',
    ],
  },
  {
    title: 'Bank Financing',
    items: [
      '2 valid government-issued IDs',
      'Proof of billing address',
      'Latest 3 months payslips or ITR',
      'Certificate of Employment',
      'Bank statements (3 months)',
      'TIN or BIR documents',
    ],
  },
  {
    title: 'In-House Financing',
    items: [
      '2 valid government-issued IDs',
      'Proof of billing address',
      'Latest 3 months payslips or proof of income',
      'Post-dated checks or auto-debit arrangement',
    ],
  },
];

export function Requirements({ docs }: RequirementsProps) {
  // Use custom docs if provided, otherwise show default groups
  const hasCustomDocs = docs.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="size-5 text-primary-600" />
        <h3 className="text-lg font-semibold">Requirements</h3>
      </div>

      {hasCustomDocs ? (
        <div className="rounded-xl border bg-card p-4">
          <ul className="space-y-2">
            {docs.map((doc) => (
              <li key={doc} className="flex items-start gap-2 text-sm">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary-600" />
                {doc}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Accordion>
          {REQUIREMENT_GROUPS.map((group) => (
            <AccordionItem key={group.title} value={group.title}>
              <AccordionTrigger>{group.title}</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-1.5 pl-1">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
