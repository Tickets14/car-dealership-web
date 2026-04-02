'use client';

import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import imageCompression from 'browser-image-compression';
import { toast } from 'sonner';
import {
  Car,
  Camera,
  ClipboardCheck,
  DollarSign,
  FileCheck,
  Loader2,
  Upload,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
} from 'lucide-react';

import { StepIndicator } from '@/components/forms/StepIndicator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import {
  sellCarStep1Schema,
  sellCarStep3Schema,
  sellCarStep4Schema,
} from '@/lib/validations';
import {
  FUEL_TYPES,
  TRANSMISSIONS,
  PHOTO_LABELS,
  CONDITION_CHECKS,
  REASONS_FOR_SELLING,
  CONTACT_METHODS,
} from '@/lib/constants';
import { useCreateSubmission } from '@/lib/hooks/use-submissions';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Step1Data = z.infer<typeof sellCarStep1Schema>;
type Step3Data = z.infer<typeof sellCarStep3Schema>;
type Step4Data = z.infer<typeof sellCarStep4Schema>;

interface PhotoSlot {
  label: string;
  file: File | null;
  preview: string | null;
}

const STEPS = [
  { label: 'Car Details' },
  { label: 'Photos' },
  { label: 'Condition' },
  { label: 'Pricing' },
  { label: 'Review' },
];

const MIN_PHOTOS = 8;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function SelectField({
  label,
  id,
  options,
  value,
  onChange,
  error,
  placeholder = 'Select...',
}: {
  label: string;
  id: string;
  options: readonly (string | { value: string; label: string })[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label} *</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id} className="w-full" aria-invalid={!!error}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => {
            const val = typeof opt === 'string' ? opt : opt.value;
            const lbl = typeof opt === 'string' ? opt : opt.label;
            return (
              <SelectItem key={val} value={val}>
                {lbl}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Car Details
// ---------------------------------------------------------------------------

function StepCarDetails({
  form,
}: {
  form: ReturnType<typeof useForm<Step1Data>>;
}) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Car className="size-5 text-primary-600" />
        Car Details
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="make">Make *</Label>
          <Input
            id="make"
            placeholder="e.g. Toyota"
            aria-invalid={!!errors.make}
            {...register('make')}
          />
          {errors.make && (
            <p className="text-xs text-destructive">{errors.make.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="model">Model *</Label>
          <Input
            id="model"
            placeholder="e.g. Vios"
            aria-invalid={!!errors.model}
            {...register('model')}
          />
          {errors.model && (
            <p className="text-xs text-destructive">{errors.model.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            type="number"
            placeholder="e.g. 2020"
            aria-invalid={!!errors.year}
            {...register('year')}
          />
          {errors.year && (
            <p className="text-xs text-destructive">{errors.year.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="variant">Variant</Label>
          <Input
            id="variant"
            placeholder="e.g. 1.3 XLE"
            {...register('variant')}
          />
        </div>

        <Controller
          name="transmission"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Transmission"
              id="transmission"
              options={TRANSMISSIONS}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.transmission?.message}
            />
          )}
        />

        <Controller
          name="fuel_type"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Fuel Type"
              id="fuel_type"
              options={FUEL_TYPES}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.fuel_type?.message}
            />
          )}
        />

        <div className="space-y-1.5">
          <Label htmlFor="mileage">Mileage (km) *</Label>
          <Input
            id="mileage"
            type="number"
            placeholder="e.g. 45000"
            aria-invalid={!!errors.mileage}
            {...register('mileage')}
          />
          {errors.mileage && (
            <p className="text-xs text-destructive">
              {errors.mileage.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="color">Color *</Label>
          <Input
            id="color"
            placeholder="e.g. White"
            aria-invalid={!!errors.color}
            {...register('color')}
          />
          {errors.color && (
            <p className="text-xs text-destructive">{errors.color.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Photos
// ---------------------------------------------------------------------------

function StepPhotos({
  photos,
  setPhotos,
  compressing,
  setCompressing,
}: {
  photos: PhotoSlot[];
  setPhotos: React.Dispatch<React.SetStateAction<PhotoSlot[]>>;
  compressing: boolean;
  setCompressing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const filledCount = photos.filter((p) => p.file).length;

  const handleFile = useCallback(
    async (index: number, file: File | null) => {
      if (!file) return;
      setCompressing(true);
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        const preview = URL.createObjectURL(compressed);
        setPhotos((prev) => {
          const next = [...prev];
          // Revoke old preview
          if (next[index].preview) URL.revokeObjectURL(next[index].preview!);
          next[index] = { ...next[index], file: compressed, preview };
          return next;
        });
      } catch {
        toast.error('Failed to compress image. Please try another file.');
      } finally {
        setCompressing(false);
      }
    },
    [setPhotos, setCompressing]
  );

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      if (next[index].preview) URL.revokeObjectURL(next[index].preview!);
      next[index] = { ...next[index], file: null, preview: null };
      return next;
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <Camera className="size-5 text-primary-600" />
        Photos
      </div>

      <p className="text-sm text-muted-foreground">
        Upload at least <strong>{MIN_PHOTOS}</strong> photos. Clear, well-lit
        photos help us evaluate your car faster.
      </p>

      {filledCount < MIN_PHOTOS && (
        <p className="text-sm font-medium text-amber-600">
          {filledCount} / {MIN_PHOTOS} minimum photos uploaded
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((slot, idx) => (
          <div key={slot.label} className="space-y-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              {slot.label}
            </span>
            {slot.preview ? (
              <div className="group relative aspect-[4/3] overflow-hidden rounded-lg ring-1 ring-border">
                <img
                  src={slot.preview}
                  alt={slot.label}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(idx)}
                  className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary-600/40 hover:bg-muted">
                <ImagePlus className="size-6 text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground/60">
                  Upload
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(idx, e.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>
        ))}
      </div>

      {compressing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Compressing image...
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Condition
// ---------------------------------------------------------------------------

function StepCondition({
  form,
}: {
  form: ReturnType<typeof useForm<Step3Data>>;
}) {
  const { watch, setValue } = form;
  const checklist = watch('condition_checklist') ?? {};
  const notes = watch('condition_notes') ?? {};

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <ClipboardCheck className="size-5 text-primary-600" />
        Condition
      </div>

      <p className="text-sm text-muted-foreground">
        Be honest — it helps us give you a fair valuation.
      </p>

      <div className="space-y-4">
        {CONDITION_CHECKS.map(({ key, label }) => {
          const checked = checklist[key] ?? false;
          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                <span className="text-sm font-medium">{label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {checked ? 'Yes' : 'No'}
                  </span>
                  <Switch
                    checked={checked}
                    onCheckedChange={(val: boolean) =>
                      setValue(`condition_checklist.${key}`, val, {
                        shouldDirty: true,
                      })
                    }
                  />
                </div>
              </div>
              {!checked && (
                <Textarea
                  placeholder={`Details about ${label.toLowerCase()}...`}
                  rows={2}
                  value={notes[key] ?? ''}
                  onChange={(e) =>
                    setValue(`condition_notes.${key}`, e.target.value)
                  }
                  className="ml-4"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Pricing & Contact
// ---------------------------------------------------------------------------

function StepPricing({
  form,
}: {
  form: ReturnType<typeof useForm<Step4Data>>;
}) {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = form;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <DollarSign className="size-5 text-primary-600" />
        Pricing & Contact
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="asking_price">Asking Price (PHP) *</Label>
          <Input
            id="asking_price"
            type="number"
            placeholder="e.g. 650000"
            aria-invalid={!!errors.asking_price}
            {...register('asking_price')}
          />
          {errors.asking_price && (
            <p className="text-xs text-destructive">
              {errors.asking_price.message}
            </p>
          )}
        </div>

        <div className="flex items-end gap-3 pb-0.5">
          <Controller
            name="negotiable"
            control={control}
            render={({ field }) => (
              <div className="flex items-center gap-2">
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <Label>Price is negotiable</Label>
              </div>
            )}
          />
        </div>

        <Controller
          name="reason_for_selling"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Reason for Selling"
              id="reason_for_selling"
              options={REASONS_FOR_SELLING}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.reason_for_selling?.message}
            />
          )}
        />

        <Controller
          name="contact_method"
          control={control}
          render={({ field }) => (
            <SelectField
              label="Preferred Contact Method"
              id="contact_method"
              options={CONTACT_METHODS}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.contact_method?.message}
            />
          )}
        />
      </div>

      <hr className="border-border" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="seller_name">Full Name *</Label>
          <Input
            id="seller_name"
            placeholder="Juan Dela Cruz"
            aria-invalid={!!errors.seller_name}
            {...register('seller_name')}
          />
          {errors.seller_name && (
            <p className="text-xs text-destructive">
              {errors.seller_name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="seller_email">Email *</Label>
          <Input
            id="seller_email"
            type="email"
            placeholder="you@email.com"
            aria-invalid={!!errors.seller_email}
            {...register('seller_email')}
          />
          {errors.seller_email && (
            <p className="text-xs text-destructive">
              {errors.seller_email.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="seller_phone">Phone *</Label>
          <Input
            id="seller_phone"
            type="tel"
            placeholder="09XX XXX XXXX"
            aria-invalid={!!errors.seller_phone}
            {...register('seller_phone')}
          />
          {errors.seller_phone && (
            <p className="text-xs text-destructive">
              {errors.seller_phone.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            placeholder="e.g. Quezon City, Metro Manila"
            aria-invalid={!!errors.location}
            {...register('location')}
          />
          {errors.location && (
            <p className="text-xs text-destructive">
              {errors.location.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 5 — Review & Submit
// ---------------------------------------------------------------------------

function StepReview({
  step1Data,
  photos,
  step3Data,
  step4Data,
  confirmed,
  setConfirmed,
}: {
  step1Data: Step1Data;
  photos: PhotoSlot[];
  step3Data: Step3Data;
  step4Data: Step4Data;
  confirmed: boolean;
  setConfirmed: (v: boolean) => void;
}) {
  const filledPhotos = photos.filter((p) => p.file);
  const checklist = step3Data.condition_checklist ?? {};
  const notes = step3Data.condition_notes ?? {};

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <FileCheck className="size-5 text-primary-600" />
        Review & Submit
      </div>

      <p className="text-sm text-muted-foreground">
        Please review your submission before sending.
      </p>

      {/* Car Details */}
      <section className="space-y-2 rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Car Details
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">Make:</span>{' '}
            {step1Data.make}
          </div>
          <div>
            <span className="text-muted-foreground">Model:</span>{' '}
            {step1Data.model}
          </div>
          <div>
            <span className="text-muted-foreground">Year:</span>{' '}
            {step1Data.year}
          </div>
          {step1Data.variant && (
            <div>
              <span className="text-muted-foreground">Variant:</span>{' '}
              {step1Data.variant}
            </div>
          )}
          <div>
            <span className="text-muted-foreground">Transmission:</span>{' '}
            {step1Data.transmission}
          </div>
          <div>
            <span className="text-muted-foreground">Fuel:</span>{' '}
            {step1Data.fuel_type}
          </div>
          <div>
            <span className="text-muted-foreground">Mileage:</span>{' '}
            {Number(step1Data.mileage).toLocaleString()} km
          </div>
          <div>
            <span className="text-muted-foreground">Color:</span>{' '}
            {step1Data.color}
          </div>
        </div>
      </section>

      {/* Photos */}
      <section className="space-y-2 rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Photos ({filledPhotos.length})
        </h3>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {filledPhotos.map((p) => (
            <div key={p.label} className="space-y-0.5">
              <div className="aspect-square overflow-hidden rounded-md ring-1 ring-border">
                <img
                  src={p.preview!}
                  alt={p.label}
                  className="size-full object-cover"
                />
              </div>
              <span className="block truncate text-[10px] text-muted-foreground">
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Condition */}
      <section className="space-y-2 rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Condition
        </h3>
        <div className="space-y-1 text-sm">
          {CONDITION_CHECKS.map(({ key, label }) => (
            <div key={key} className="flex items-start gap-2">
              {checklist[key] ? (
                <Check className="mt-0.5 size-3.5 shrink-0 text-green-600" />
              ) : (
                <X className="mt-0.5 size-3.5 shrink-0 text-red-500" />
              )}
              <div>
                <span>{label}</span>
                {!checklist[key] && notes[key] && (
                  <p className="text-xs text-muted-foreground">{notes[key]}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing & Contact */}
      <section className="space-y-2 rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Pricing & Contact
        </h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
          <div>
            <span className="text-muted-foreground">Asking Price:</span> PHP{' '}
            {Number(step4Data.asking_price).toLocaleString()}
          </div>
          <div>
            <span className="text-muted-foreground">Negotiable:</span>{' '}
            {step4Data.negotiable ? 'Yes' : 'No'}
          </div>
          <div>
            <span className="text-muted-foreground">Reason:</span>{' '}
            {REASONS_FOR_SELLING.find(
              (r) => r.value === step4Data.reason_for_selling
            )?.label ?? step4Data.reason_for_selling}
          </div>
          <div>
            <span className="text-muted-foreground">Name:</span>{' '}
            {step4Data.seller_name}
          </div>
          <div>
            <span className="text-muted-foreground">Email:</span>{' '}
            {step4Data.seller_email}
          </div>
          <div>
            <span className="text-muted-foreground">Phone:</span>{' '}
            {step4Data.seller_phone}
          </div>
          <div>
            <span className="text-muted-foreground">Contact via:</span>{' '}
            {CONTACT_METHODS.find(
              (m) => m.value === step4Data.contact_method
            )?.label ?? step4Data.contact_method}
          </div>
          <div>
            <span className="text-muted-foreground">Location:</span>{' '}
            {step4Data.location}
          </div>
        </div>
      </section>

      {/* Confirmation */}
      <div className="flex items-start gap-2.5 rounded-lg border border-primary-600/20 bg-primary-600/5 p-4">
        <Checkbox
          checked={confirmed}
          onCheckedChange={(val: boolean) => setConfirmed(val)}
          id="confirm"
        />
        <Label htmlFor="confirm" className="text-sm leading-relaxed">
          I confirm that the information above is accurate. I understand the
          dealership will review my submission and contact me within 48 hours.
        </Label>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Success Screen
// ---------------------------------------------------------------------------

function SuccessScreen({ referenceNumber }: { referenceNumber: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <Check className="size-8" />
      </div>
      <h2 className="text-2xl font-bold">Submission Received!</h2>
      <p className="max-w-md text-muted-foreground">
        Your reference number is{' '}
        <span className="font-mono font-semibold text-foreground">
          {referenceNumber}
        </span>
        . We&apos;ll review your submission and get back to you within{' '}
        <strong>48 hours</strong>.
      </p>
      <Button
        variant="outline"
        onClick={() => window.location.assign('/cars')}
        className="mt-2"
      >
        Browse Our Inventory
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SellPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  // Photo state
  const [photos, setPhotos] = useState<PhotoSlot[]>(
    PHOTO_LABELS.map((label) => ({ label, file: null, preview: null }))
  );

  // Forms for each validated step
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(sellCarStep1Schema),
    defaultValues: {
      make: '',
      model: '',
      year: undefined as unknown as number,
      variant: '',
      transmission: '',
      fuel_type: '',
      mileage: undefined as unknown as number,
      color: '',
    },
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(sellCarStep3Schema),
    defaultValues: {
      condition_checklist: Object.fromEntries(
        CONDITION_CHECKS.map(({ key }) => [key, true])
      ),
      condition_notes: {},
    },
  });

  const step4Form = useForm<Step4Data>({
    resolver: zodResolver(sellCarStep4Schema),
    defaultValues: {
      asking_price: undefined as unknown as number,
      negotiable: true,
      reason_for_selling: '',
      seller_name: '',
      seller_email: '',
      seller_phone: '',
      contact_method: '',
      location: '',
    },
  });

  const { mutate: createSubmission, isPending } = useCreateSubmission();

  // Validate current step before proceeding
  const validateStep = async (): Promise<boolean> => {
    switch (currentStep) {
      case 0:
        return step1Form.trigger();
      case 1: {
        const filled = photos.filter((p) => p.file).length;
        if (filled < MIN_PHOTOS) {
          toast.error(`Please upload at least ${MIN_PHOTOS} photos.`);
          return false;
        }
        return true;
      }
      case 2:
        return step3Form.trigger();
      case 3:
        return step4Form.trigger();
      default:
        return true;
    }
  };

  const goNext = async () => {
    const valid = await validateStep();
    if (!valid) return;
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goPrev = () => {
    setCurrentStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    if (!confirmed) {
      toast.error('Please confirm before submitting.');
      return;
    }

    const s1 = step1Form.getValues();
    const s3 = step3Form.getValues();
    const s4 = step4Form.getValues();

    const formData = new FormData();

    // Car details
    formData.append('make', s1.make);
    formData.append('model', s1.model);
    formData.append('year', String(s1.year));
    if (s1.variant) formData.append('variant', s1.variant);
    formData.append('transmission', s1.transmission);
    formData.append('fuel_type', s1.fuel_type);
    formData.append('mileage', String(s1.mileage));
    formData.append('color', s1.color);

    // Condition
    formData.append(
      'condition_checklist',
      JSON.stringify(s3.condition_checklist)
    );

    // Pricing & contact
    formData.append('asking_price', String(s4.asking_price));
    formData.append('negotiable', String(s4.negotiable));
    formData.append('reason_for_selling', s4.reason_for_selling);
    formData.append('seller_name', s4.seller_name);
    formData.append('seller_email', s4.seller_email);
    formData.append('seller_phone', s4.seller_phone);
    formData.append('contact_method', s4.contact_method);
    formData.append('location', s4.location);

    // Photos
    photos.forEach((slot) => {
      if (slot.file) {
        formData.append('photos', slot.file);
        formData.append('photo_labels', slot.label);
      }
    });

    createSubmission(formData, {
      onSuccess: (res: { data?: { reference_number?: string } }) => {
        const ref =
          res?.data?.reference_number ?? 'SUB-' + Date.now().toString(36).toUpperCase();
        setReferenceNumber(ref);
        toast.success('Submission sent successfully!');
      },
      onError: () => {
        toast.error('Failed to submit. Please try again.');
      },
    });
  };

  // Success screen
  if (referenceNumber) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <SuccessScreen referenceNumber={referenceNumber} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-2 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Sell Your Car</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill out the form below and we&apos;ll get back to you with a
          valuation.
        </p>
      </div>

      <div className="mt-8 mb-8">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm sm:p-8">
        {currentStep === 0 && <StepCarDetails form={step1Form} />}
        {currentStep === 1 && (
          <StepPhotos
            photos={photos}
            setPhotos={setPhotos}
            compressing={compressing}
            setCompressing={setCompressing}
          />
        )}
        {currentStep === 2 && <StepCondition form={step3Form} />}
        {currentStep === 3 && <StepPricing form={step4Form} />}
        {currentStep === 4 && (
          <StepReview
            step1Data={step1Form.getValues()}
            photos={photos}
            step3Data={step3Form.getValues()}
            step4Data={step4Form.getValues()}
            confirmed={confirmed}
            setConfirmed={setConfirmed}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="size-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={goNext}
              disabled={compressing}
              className="bg-primary-600 text-white hover:bg-primary-700 border-primary-600"
            >
              Next
              <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isPending || !confirmed}
              className="bg-primary-600 text-white hover:bg-primary-700 border-primary-600"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Submit for Review
              <Upload className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
