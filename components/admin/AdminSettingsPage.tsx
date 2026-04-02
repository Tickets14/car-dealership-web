'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Building2,
  Calculator,
  Clock3,
  Loader2,
  Save,
  Settings2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAdminSettings, useUpdateSetting } from '@/lib/hooks/use-admin';
import type { BusinessHours, ContactInfo, InstallmentTerms } from '@/lib/types';

const DAY_LABELS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

const DEFAULT_INSTALLMENT_TERMS: InstallmentTerms = {
  interest_rate_annual: 12,
  available_terms: [12, 18, 24, 36, 48],
  min_down_payment_percent: 20,
};

const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { open: '09:00', close: '18:00' },
  tuesday: { open: '09:00', close: '18:00' },
  wednesday: { open: '09:00', close: '18:00' },
  thursday: { open: '09:00', close: '18:00' },
  friday: { open: '09:00', close: '18:00' },
  saturday: { open: '09:00', close: '18:00' },
  sunday: null,
};

const DEFAULT_CONTACT_INFO: ContactInfo = {
  business_name: 'AutoDeals',
  address: '',
  phone: '',
  whatsapp: '',
  email: '',
  facebook: '',
  instagram: '',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
) {
  if (principal <= 0 || months <= 0) return 0;
  if (annualRate <= 0) return principal / months;

  const monthlyRate = annualRate / 100 / 12;

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );
}

function normalizeSettingsPayload(
  payload:
    | Record<string, unknown>
    | Array<{ key: string; value: unknown }>
    | undefined
) {
  if (Array.isArray(payload)) {
    return Object.fromEntries(
      payload
        .filter(
          (
            item
          ): item is {
            key: string;
            value: unknown;
          } => Boolean(item && typeof item.key === 'string')
        )
        .map((item) => [item.key, item.value])
    );
  }

  return payload ?? {};
}

function parseSettingValue<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;

  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }

  if (typeof value === 'object') {
    return value as T;
  }

  return fallback;
}

function sanitizeAvailableTerms(values: number[]) {
  const cleaned = Array.from(
    new Set(
      values
        .map((value) => Math.round(value))
        .filter((value) => Number.isFinite(value) && value > 0)
    )
  ).sort((left, right) => left - right);

  return cleaned.length > 0 ? cleaned : DEFAULT_INSTALLMENT_TERMS.available_terms;
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
        <CardContent className="space-y-4 px-6 py-6 sm:px-8">
          <Skeleton className="h-4 w-28 bg-white/20" />
          <Skeleton className="h-10 w-72 bg-white/20" />
          <Skeleton className="h-5 w-96 max-w-full bg-white/15" />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-5 px-6 py-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </CardContent>
      </Card>
    </div>
  );
}

function AdminSettingsView({
  initialInstallmentTerms,
  initialBusinessHours,
  initialContactInfo,
}: {
  initialInstallmentTerms: InstallmentTerms;
  initialBusinessHours: BusinessHours;
  initialContactInfo: ContactInfo;
}) {
  const updateSetting = useUpdateSetting();
  const [installmentTerms, setInstallmentTerms] = useState(initialInstallmentTerms);
  const [availableTermsInput, setAvailableTermsInput] = useState(
    initialInstallmentTerms.available_terms.join(', ')
  );
  const [businessHours, setBusinessHours] = useState(initialBusinessHours);
  const [contactInfo, setContactInfo] = useState(initialContactInfo);
  const [previewPrice, setPreviewPrice] = useState(1250000);
  const [previewDownPayment, setPreviewDownPayment] = useState(
    Math.ceil(
      1250000 * (initialInstallmentTerms.min_down_payment_percent / 100)
    )
  );
  const [previewTradeIn, setPreviewTradeIn] = useState(0);
  const [previewTermSelection, setPreviewTermSelection] = useState(
    initialInstallmentTerms.available_terms[2] ??
      initialInstallmentTerms.available_terms[0] ??
      36
  );
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const parsedTerms = sanitizeAvailableTerms(
    availableTermsInput
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value))
  );

  const effectiveInstallmentTerms: InstallmentTerms = {
    interest_rate_annual: installmentTerms.interest_rate_annual,
    min_down_payment_percent: installmentTerms.min_down_payment_percent,
    available_terms: parsedTerms,
  };

  const selectedPreviewTerm = effectiveInstallmentTerms.available_terms.includes(
    previewTermSelection
  )
    ? previewTermSelection
    : effectiveInstallmentTerms.available_terms[0];

  const minDownPayment = Math.ceil(
    previewPrice * (effectiveInstallmentTerms.min_down_payment_percent / 100)
  );
  const effectiveDownPayment = Math.min(
    previewPrice,
    Math.max(previewDownPayment, minDownPayment)
  );
  const loanAmount = Math.max(previewPrice - effectiveDownPayment - previewTradeIn, 0);
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    effectiveInstallmentTerms.interest_rate_annual,
    selectedPreviewTerm
  );
  const totalLoanCost = monthlyPayment * selectedPreviewTerm;

  async function saveInstallmentTerms() {
    const sanitizedTerms: InstallmentTerms = {
      interest_rate_annual: Number(
        effectiveInstallmentTerms.interest_rate_annual || 0
      ),
      min_down_payment_percent: Number(
        effectiveInstallmentTerms.min_down_payment_percent || 0
      ),
      available_terms: effectiveInstallmentTerms.available_terms,
    };

    try {
      setSavingKey('installment_terms');
      await updateSetting.mutateAsync({
        key: 'installment_terms',
        value: sanitizedTerms,
      });
      setInstallmentTerms(sanitizedTerms);
      setAvailableTermsInput(sanitizedTerms.available_terms.join(', '));
      toast.success('Installment terms updated.');
    } catch {
      toast.error('Failed to update installment terms.');
    } finally {
      setSavingKey(null);
    }
  }

  async function saveBusinessHours() {
    try {
      setSavingKey('business_hours');
      await updateSetting.mutateAsync({
        key: 'business_hours',
        value: businessHours,
      });
      toast.success('Business hours updated.');
    } catch {
      toast.error('Failed to update business hours.');
    } finally {
      setSavingKey(null);
    }
  }

  async function saveContactInfo() {
    try {
      setSavingKey('contact_info');
      await updateSetting.mutateAsync({
        key: 'contact_info',
        value: contactInfo,
      });
      toast.success('Contact information updated.');
    } catch {
      toast.error('Failed to update contact information.');
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
        <CardContent className="flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Settings2 className="size-4 text-amber-300" />
              <span>Settings</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Manage dealership operating details
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-white/70 sm:text-base">
                Configure financing rules, business hours, and storefront contact
                information from one admin screen.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/10">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
              Last Reviewed
            </p>
            <p className="mt-1 text-sm text-white/80">
              {format(new Date(), 'MMMM d, yyyy')}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardContent className="px-6 py-6">
          <Tabs defaultValue="installment" className="gap-6">
            <TabsList
              variant="line"
              className="h-auto w-full justify-start gap-2 overflow-x-auto rounded-none p-0"
            >
              <TabsTrigger
                value="installment"
                className="h-10 rounded-xl px-3 data-active:bg-muted/60"
              >
                Installment Terms
              </TabsTrigger>
              <TabsTrigger
                value="hours"
                className="h-10 rounded-xl px-3 data-active:bg-muted/60"
              >
                Business Hours
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="h-10 rounded-xl px-3 data-active:bg-muted/60"
              >
                Contact &amp; Business Info
              </TabsTrigger>
            </TabsList>

            <TabsContent value="installment" className="space-y-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
                <Card className="shadow-sm">
                  <CardContent className="space-y-5 px-5 py-5">
                    <div className="flex items-center gap-2">
                      <Calculator className="size-4 text-primary-600" />
                      <h3 className="font-medium">Installment Terms</h3>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="interest_rate_annual">
                          Interest Rate (% p.a.)
                        </Label>
                        <Input
                          id="interest_rate_annual"
                          type="number"
                          value={installmentTerms.interest_rate_annual}
                          onChange={(event) =>
                            setInstallmentTerms((current) => ({
                              ...current,
                              interest_rate_annual: Number(event.target.value) || 0,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="min_down_payment_percent">
                          Minimum Down Payment (%)
                        </Label>
                        <Input
                          id="min_down_payment_percent"
                          type="number"
                          value={installmentTerms.min_down_payment_percent}
                          onChange={(event) =>
                            setInstallmentTerms((current) => ({
                              ...current,
                              min_down_payment_percent:
                                Number(event.target.value) || 0,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="available_terms">Available Terms</Label>
                      <Input
                        id="available_terms"
                        value={availableTermsInput}
                        onChange={(event) =>
                          setAvailableTermsInput(event.target.value)
                        }
                        placeholder="12, 24, 36, 48"
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter terms in months, separated by commas.
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        disabled={
                          updateSetting.isPending &&
                          savingKey === 'installment_terms'
                        }
                        onClick={saveInstallmentTerms}
                      >
                        {updateSetting.isPending &&
                        savingKey === 'installment_terms' ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Save className="size-4" />
                        )}
                        Save Installment Terms
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm">
                  <CardContent className="space-y-5 px-5 py-5">
                    <div className="flex items-center gap-2">
                      <Calculator className="size-4 text-primary-600" />
                      <h3 className="font-medium">Preview Calculator</h3>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="preview_price">Vehicle Price</Label>
                      <Input
                        id="preview_price"
                        type="number"
                        value={previewPrice}
                        onChange={(event) =>
                          setPreviewPrice(Number(event.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preview_down_payment">
                        Down Payment ({effectiveInstallmentTerms.min_down_payment_percent}% min)
                      </Label>
                      <div className="flex items-center gap-3">
                        <Slider
                          min={minDownPayment}
                          max={Math.max(previewPrice, minDownPayment)}
                          value={[effectiveDownPayment]}
                          onValueChange={(value) =>
                            setPreviewDownPayment(
                              Array.isArray(value) ? value[0] : value
                            )
                          }
                          className="flex-1"
                        />
                        <Input
                          id="preview_down_payment"
                          type="number"
                          min={minDownPayment}
                          max={previewPrice}
                          value={effectiveDownPayment}
                          onChange={(event) =>
                            setPreviewDownPayment(Number(event.target.value) || 0)
                          }
                          className="w-32"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Available Terms</Label>
                      <RadioGroup
                        value={String(selectedPreviewTerm)}
                        onValueChange={(value: string) =>
                          setPreviewTermSelection(Number(value))
                        }
                        className="flex flex-wrap gap-2"
                      >
                        {effectiveInstallmentTerms.available_terms.map((term) => (
                          <label
                            key={term}
                            className="flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm has-[:checked]:border-primary-600 has-[:checked]:bg-primary-50"
                          >
                            <RadioGroupItem value={String(term)} />
                            {term} mo
                          </label>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="preview_trade_in">Trade-in Value</Label>
                      <Input
                        id="preview_trade_in"
                        type="number"
                        value={previewTradeIn || ''}
                        onChange={(event) =>
                          setPreviewTradeIn(Number(event.target.value) || 0)
                        }
                        placeholder="0"
                      />
                    </div>

                    <div className="space-y-3 rounded-2xl bg-primary-50 p-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                          Estimated Monthly Payment
                        </p>
                        <p className="text-3xl font-bold text-primary-600">
                          {formatCurrency(monthlyPayment)}
                          <span className="text-base font-normal text-muted-foreground">
                            /mo
                          </span>
                        </p>
                      </div>

                      <div className="grid gap-2 text-sm">
                        <div className="flex justify-between rounded-lg bg-white/80 px-3 py-2">
                          <span className="text-muted-foreground">Loan Amount</span>
                          <span className="font-medium">
                            {formatCurrency(loanAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between rounded-lg bg-white/80 px-3 py-2">
                          <span className="text-muted-foreground">Interest</span>
                          <span className="font-medium">
                            {formatCurrency(totalLoanCost - loanAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between rounded-lg bg-white/80 px-3 py-2">
                          <span className="text-muted-foreground">Total Cost</span>
                          <span className="font-medium">
                            {formatCurrency(
                              totalLoanCost + effectiveDownPayment + previewTradeIn
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="hours" className="space-y-6">
              <Card className="shadow-sm">
                <CardContent className="space-y-5 px-5 py-5">
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-4 text-primary-600" />
                    <h3 className="font-medium">Business Hours</h3>
                  </div>

                  <div className="space-y-3">
                    {DAY_LABELS.map((day) => {
                      const value = businessHours[day.key];
                      const closed = value === null;

                      return (
                        <div
                          key={day.key}
                          className="rounded-2xl border bg-muted/15 p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="font-medium">{day.label}</p>
                              <p className="text-sm text-muted-foreground">
                                {closed ? 'Closed' : 'Open for visits and inquiries'}
                              </p>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                Closed
                              </span>
                              <Switch
                                checked={closed}
                                onCheckedChange={(checked) =>
                                  setBusinessHours((current) => ({
                                    ...current,
                                    [day.key]: checked
                                      ? null
                                      : current[day.key] ?? {
                                          open: '09:00',
                                          close: '18:00',
                                        },
                                  }))
                                }
                              />
                            </div>
                          </div>

                          {!closed && value && (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                              <div className="space-y-1.5">
                                <Label htmlFor={`${day.key}_open`}>Open</Label>
                                <Input
                                  id={`${day.key}_open`}
                                  type="time"
                                  value={value.open}
                                  onChange={(event) =>
                                    setBusinessHours((current) => ({
                                      ...current,
                                      [day.key]: {
                                        open: event.target.value,
                                        close:
                                          current[day.key]?.close ?? '18:00',
                                      },
                                    }))
                                  }
                                />
                              </div>

                              <div className="space-y-1.5">
                                <Label htmlFor={`${day.key}_close`}>Close</Label>
                                <Input
                                  id={`${day.key}_close`}
                                  type="time"
                                  value={value.close}
                                  onChange={(event) =>
                                    setBusinessHours((current) => ({
                                      ...current,
                                      [day.key]: {
                                        open:
                                          current[day.key]?.open ?? '09:00',
                                        close: event.target.value,
                                      },
                                    }))
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      disabled={
                        updateSetting.isPending && savingKey === 'business_hours'
                      }
                      onClick={saveBusinessHours}
                    >
                      {updateSetting.isPending &&
                      savingKey === 'business_hours' ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Save Business Hours
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card className="shadow-sm">
                <CardContent className="space-y-5 px-5 py-5">
                  <div className="flex items-center gap-2">
                    <Building2 className="size-4 text-primary-600" />
                    <h3 className="font-medium">Contact &amp; Business Info</h3>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="business_name">Business Name</Label>
                      <Input
                        id="business_name"
                        value={contactInfo.business_name}
                        onChange={(event) =>
                          setContactInfo((current) => ({
                            ...current,
                            business_name: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        rows={3}
                        value={contactInfo.address}
                        onChange={(event) =>
                          setContactInfo((current) => ({
                            ...current,
                            address: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={contactInfo.phone}
                        onChange={(event) =>
                          setContactInfo((current) => ({
                            ...current,
                            phone: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <Input
                        id="whatsapp"
                        value={contactInfo.whatsapp}
                        onChange={(event) =>
                          setContactInfo((current) => ({
                            ...current,
                            whatsapp: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={contactInfo.email}
                        onChange={(event) =>
                          setContactInfo((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={contactInfo.facebook}
                        onChange={(event) =>
                          setContactInfo((current) => ({
                            ...current,
                            facebook: event.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={contactInfo.instagram}
                        onChange={(event) =>
                          setContactInfo((current) => ({
                            ...current,
                            instagram: event.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      disabled={
                        updateSetting.isPending && savingKey === 'contact_info'
                      }
                      onClick={saveContactInfo}
                    >
                      {updateSetting.isPending &&
                      savingKey === 'contact_info' ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Save className="size-4" />
                      )}
                      Save Contact Info
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminSettingsPage() {
  const settingsQuery = useAdminSettings();

  if (settingsQuery.isLoading && !settingsQuery.data) {
    return <SettingsSkeleton />;
  }

  if (settingsQuery.isError && !settingsQuery.data) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="px-6 py-6">
          <p className="font-medium text-destructive">
            Failed to load admin settings.
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Refresh the page or verify the admin settings endpoint response.
          </p>
        </CardContent>
      </Card>
    );
  }

  const normalized = normalizeSettingsPayload(settingsQuery.data);
  const installmentTerms = parseSettingValue<InstallmentTerms>(
    normalized.installment_terms,
    DEFAULT_INSTALLMENT_TERMS
  );
  const businessHours = parseSettingValue<BusinessHours>(
    normalized.business_hours,
    DEFAULT_BUSINESS_HOURS
  );
  const contactInfo = parseSettingValue<ContactInfo>(
    normalized.contact_info,
    DEFAULT_CONTACT_INFO
  );

  return (
    <AdminSettingsView
      key={JSON.stringify({
        installmentTerms,
        businessHours,
        contactInfo,
      })}
      initialInstallmentTerms={installmentTerms}
      initialBusinessHours={businessHours}
      initialContactInfo={contactInfo}
    />
  );
}
