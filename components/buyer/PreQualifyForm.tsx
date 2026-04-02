'use client';

import Link from 'next/link';
import { type ComponentProps, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  Loader2,
  PhoneCall,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  CREDIT_SCORES,
  EMPLOYMENT_LENGTHS,
  EMPLOYMENT_STATUSES,
  INCOME_RANGES,
} from '@/lib/constants';
import {
  useCreatePreQualification,
  type CreatePreQualificationResponse,
} from '@/lib/hooks/use-prequalify';
import {
  preQualifySchema,
  type PreQualifyFormInput,
  type PreQualifyFormData,
} from '@/lib/validations';

const NEXT_STEPS = [
  {
    icon: PhoneCall,
    title: 'Application review',
    description: 'We review your details and check the best financing options for your profile.',
  },
  {
    icon: BadgeCheck,
    title: 'Callback within 24 hours',
    description: 'A financing specialist will reach out to confirm eligibility and next steps.',
  },
  {
    icon: FileText,
    title: 'Prepare your documents',
    description: 'Once you choose a vehicle, we help you complete the requirements quickly.',
  },
] as const;

const REQUIRED_DOCUMENTS = [
  'Government-issued ID',
  'Latest proof of income',
  'Proof of billing',
  'Bank statement or payslips',
] as const;

function SelectField({
  id,
  label,
  placeholder,
  value,
  onChange,
  options,
  error,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string | null) => void;
  options: readonly string[] | readonly { value: string; label: string }[];
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full" aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const label = typeof option === 'string' ? option : option.label;
            return (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function TextField({
  id,
  label,
  type = 'text',
  placeholder,
  error,
  ...props
}: ComponentProps<typeof Input> & {
  id: string;
  label: string;
  placeholder: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function resolveReferenceNumber(response: CreatePreQualificationResponse | undefined) {
  const fallback = `PQ-${Date.now().toString(36).toUpperCase()}`;

  return (
    response?.reference_number ??
    response?.referenceNumber ??
    response?.data?.reference_number ??
    response?.data?.referenceNumber ??
    response?.id ??
    response?.data?.id ??
    response?.inquiry_id ??
    response?.data?.inquiry_id ??
    fallback
  );
}

function SuccessState({ referenceNumber }: { referenceNumber: string }) {
  return (
    <Card className="mx-auto w-full max-w-2xl border-0 bg-white/95 shadow-2xl ring-1 ring-primary-600/10 backdrop-blur">
      <CardContent className="flex flex-col items-center gap-5 px-6 py-10 text-center sm:px-8 sm:py-12">
        <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="size-9" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Pre-Qualification Submitted
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            We&apos;ve received your details. We&apos;ll contact you within 24
            hours with the next steps.
          </p>
        </div>

        <div className="w-full max-w-sm rounded-2xl bg-green-50 px-4 py-3 ring-1 ring-green-200">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-green-700">
            Reference Number
          </p>
          <p className="mt-1 font-mono text-lg font-semibold text-green-800">
            {referenceNumber}
          </p>
        </div>

        <Button
          size="lg"
          className="mt-2 h-10 bg-primary-600 px-5 text-white hover:bg-primary-700"
          render={<Link href="/cars" />}
        >
          Browse Cars While You Wait
          <ArrowRight className="size-4" data-icon="inline-end" />
        </Button>
      </CardContent>
    </Card>
  );
}

export function PreQualifyForm() {
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const { mutate: createPreQualification, isPending } =
    useCreatePreQualification();

  const form = useForm<PreQualifyFormInput, unknown, PreQualifyFormData>({
    resolver: zodResolver(preQualifySchema),
    defaultValues: {
      full_name: '',
      email: '',
      contact_number: '',
      employment_status: 'employed',
      employer_name: '',
      employment_length: '',
      monthly_income_range: '',
      credit_score_range: '',
      down_payment: '',
      existing_car_loans: false,
    },
  });

  const employmentStatus = useWatch({
    control: form.control,
    name: 'employment_status',
  });
  const employerLabel =
    employmentStatus === 'business_owner' ||
    employmentStatus === 'self_employed'
      ? 'Business Name *'
      : employmentStatus === 'ofw'
        ? 'Employer / Agency *'
        : 'Employer Name *';

  const handleSubmit = (values: PreQualifyFormData) => {
    createPreQualification(values, {
      onSuccess: (response) => {
        setReferenceNumber(resolveReferenceNumber(response));
        toast.success('Your pre-qualification request has been sent.');
      },
      onError: () => {
        toast.error('Failed to submit your request. Please try again.');
      },
    });
  };

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(30,58,95,0.08),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_28%)] py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="mx-auto w-full">
            {referenceNumber ? (
              <SuccessState referenceNumber={referenceNumber} />
            ) : (
              <Card className="mx-auto w-full max-w-2xl border-0 bg-white/95 shadow-2xl ring-1 ring-primary-600/10 backdrop-blur">
                <CardHeader className="space-y-3 px-6 pt-6 sm:px-8 sm:pt-8">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                    <ShieldCheck className="size-6" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-2xl tracking-tight sm:text-3xl">
                      Get Pre-Qualified for Financing
                    </CardTitle>
                    <CardDescription className="max-w-xl text-sm leading-relaxed sm:text-base">
                      Complete the short form below and our team will review
                      your details. There&apos;s no obligation, and we&apos;ll
                      contact you within 24 hours.
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-8"
                  >
                    <section className="space-y-4">
                      <div className="flex items-center gap-2">
                        <UserRound className="size-4 text-primary-600" />
                        <h2 className="text-base font-semibold">Personal Info</h2>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <TextField
                            id="full_name"
                            label="Full Name *"
                            placeholder="Juan Dela Cruz"
                            autoComplete="name"
                            error={form.formState.errors.full_name?.message}
                            {...form.register('full_name')}
                          />
                        </div>

                        <TextField
                          id="email"
                          label="Email Address *"
                          type="email"
                          placeholder="you@email.com"
                          autoComplete="email"
                          error={form.formState.errors.email?.message}
                          {...form.register('email')}
                        />

                        <TextField
                          id="contact_number"
                          label="Contact Number *"
                          type="tel"
                          placeholder="09XX XXX XXXX"
                          autoComplete="tel"
                          error={form.formState.errors.contact_number?.message}
                          {...form.register('contact_number')}
                        />
                      </div>
                    </section>

                    <section className="space-y-4 border-t pt-8">
                      <div className="flex items-center gap-2">
                        <BriefcaseBusiness className="size-4 text-primary-600" />
                        <h2 className="text-base font-semibold">Employment</h2>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Controller
                          name="employment_status"
                          control={form.control}
                          render={({ field }) => (
                            <SelectField
                              id="employment_status"
                              label="Employment Status *"
                              placeholder="Select status"
                              value={field.value}
                              onChange={field.onChange}
                              options={EMPLOYMENT_STATUSES}
                              error={
                                form.formState.errors.employment_status?.message
                              }
                            />
                          )}
                        />

                        <Controller
                          name="employment_length"
                          control={form.control}
                          render={({ field }) => (
                            <SelectField
                              id="employment_length"
                              label="Employment Length *"
                              placeholder="Select length"
                              value={field.value}
                              onChange={field.onChange}
                              options={EMPLOYMENT_LENGTHS}
                              error={
                                form.formState.errors.employment_length?.message
                              }
                            />
                          )}
                        />

                        <div className="sm:col-span-2">
                          <TextField
                            id="employer_name"
                            label={employerLabel}
                            placeholder="Company or business name"
                            autoComplete="organization"
                            error={form.formState.errors.employer_name?.message}
                            {...form.register('employer_name')}
                          />
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4 border-t pt-8">
                      <div className="flex items-center gap-2">
                        <CircleDollarSign className="size-4 text-primary-600" />
                        <h2 className="text-base font-semibold">Financial</h2>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Controller
                          name="monthly_income_range"
                          control={form.control}
                          render={({ field }) => (
                            <SelectField
                              id="monthly_income_range"
                              label="Monthly Income Range *"
                              placeholder="Select range"
                              value={field.value}
                              onChange={field.onChange}
                              options={INCOME_RANGES}
                              error={
                                form.formState.errors.monthly_income_range
                                  ?.message
                              }
                            />
                          )}
                        />

                        <Controller
                          name="credit_score_range"
                          control={form.control}
                          render={({ field }) => (
                            <SelectField
                              id="credit_score_range"
                              label="Credit Profile *"
                              placeholder="Select profile"
                              value={field.value}
                              onChange={field.onChange}
                              options={CREDIT_SCORES}
                              error={
                                form.formState.errors.credit_score_range
                                  ?.message
                              }
                            />
                          )}
                        />

                        <TextField
                          id="down_payment"
                          label="Planned Down Payment (PHP)"
                          type="number"
                          min={0}
                          placeholder="e.g. 150000"
                          error={form.formState.errors.down_payment?.message}
                          {...form.register('down_payment')}
                        />

                        <div className="rounded-2xl border bg-muted/40 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1">
                              <Label htmlFor="existing_car_loans">
                                Existing Car Loan
                              </Label>
                              <p className="text-sm leading-relaxed text-muted-foreground">
                                Let us know if you currently have an active auto
                                loan so we can prepare the right options.
                              </p>
                            </div>
                            <Controller
                              name="existing_car_loans"
                              control={form.control}
                              render={({ field }) => (
                                <Switch
                                  id="existing_car_loans"
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </section>

                    <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
                      <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                        By submitting this form, you agree to be contacted by
                        our financing team regarding your application.
                      </p>

                      <Button
                        type="submit"
                        size="lg"
                        disabled={isPending}
                        className="h-10 bg-primary-600 px-5 text-white hover:bg-primary-700"
                      >
                        {isPending && <Loader2 className="size-4 animate-spin" />}
                        Submit Application
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>

          <aside className="hidden lg:block">
            <Card className="sticky top-24 border-0 bg-white/90 shadow-xl ring-1 ring-primary-600/10 backdrop-blur">
              <CardHeader className="space-y-1">
                <CardTitle>What happens next?</CardTitle>
                <CardDescription>
                  We keep the process simple and fast.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-7">
                <div className="space-y-4">
                  {NEXT_STEPS.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.title} className="flex gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                          <Icon className="size-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">
                            Step {index + 1}
                          </p>
                          <h3 className="font-medium">{step.title}</h3>
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 rounded-2xl bg-muted/45 p-4">
                  <h3 className="font-semibold">What you&apos;ll need to bring</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {REQUIRED_DOCUMENTS.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </section>
  );
}
