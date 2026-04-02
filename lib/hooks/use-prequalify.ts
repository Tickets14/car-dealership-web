'use client';

import { useMutation } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { EmploymentStatus } from '@/lib/types';

export interface CreatePreQualificationData {
  full_name: string;
  email: string;
  contact_number: string;
  employment_status: EmploymentStatus;
  employer_name: string;
  employment_length: string;
  monthly_income_range: string;
  credit_score_range: string;
  down_payment: number;
  existing_car_loans: boolean;
}

export interface CreatePreQualificationResponse {
  reference_number?: string;
  referenceNumber?: string;
  id?: string;
  inquiry_id?: string;
  data?: {
    reference_number?: string;
    referenceNumber?: string;
    id?: string;
    inquiry_id?: string;
  };
}

function estimateIncomeFromRange(range: string) {
  const matches = range.match(/\d[\d,]*/g)?.map((value) =>
    Number(value.replace(/,/g, ''))
  );

  if (!matches?.length || Number.isNaN(matches[0])) {
    return 0;
  }

  return matches[0];
}

export function useCreatePreQualification() {
  return useMutation<CreatePreQualificationResponse, Error, CreatePreQualificationData>({
    mutationFn: (data) =>
      apiClient.post('/pre-qualify', {
        ...data,
        name: data.full_name,
        phone: data.contact_number,
        income: estimateIncomeFromRange(data.monthly_income_range),
        creditScore: data.credit_score_range,
        downPayment: data.down_payment ?? 0,
      }),
  });
}
