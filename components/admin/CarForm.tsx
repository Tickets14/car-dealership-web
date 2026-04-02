'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { format } from 'date-fns';
import {
  AlertTriangle,
  CarFront,
  Loader2,
  Save,
  ShieldCheck,
  Trash2,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  CarPhotoManager,
  type ExistingCarPhotoItem,
  type PendingCarPhotoItem,
} from '@/components/admin/CarPhotoManager';
import {
  ADMIN_BODY_TYPE_OPTIONS,
  ADMIN_CAR_STATUS_OPTIONS,
  ADMIN_CONDITION_RATING_OPTIONS,
  ADMIN_FUEL_TYPE_OPTIONS,
  ADMIN_TRANSMISSION_OPTIONS,
  MILEAGE_UNIT_OPTIONS,
} from '@/lib/constants';
import {
  useAdminCar,
  useAdminSubmission,
  useCreateCar,
  useDeleteCar,
  useDeleteCarPhotos,
  useReorderCarPhotos,
  useUpdateCar,
  useUploadCarPhotos,
  type AdminCarMutationResponse,
} from '@/lib/hooks/use-admin';
import {
  adminCarFormSchema,
  type AdminCarFormData,
  type AdminCarFormInput,
} from '@/lib/validations';
import type { Car, CarWithPhotos, SellerSubmissionWithPhotos } from '@/lib/types';

interface CarFormProps {
  mode: 'create' | 'edit';
  carId?: string;
  fromSubmission?: string | null;
}

interface SelectOption {
  value: string;
  label: string;
}

const DEFAULT_VALUES: AdminCarFormInput = {
  make: '',
  model: '',
  year: new Date().getFullYear(),
  variant: '',
  transmission: 'automatic',
  fuel_type: 'gasoline',
  mileage: 0,
  mileage_unit: 'km',
  color: '',
  body_type: '',
  engine_displacement: '',
  drivetrain: '',
  seats: undefined,
  plate_ending: '',
  price_cash: 0,
  status: 'draft',
  is_featured: false,
  condition_rating: 'good',
  description: '',
  accident_history: false,
  accident_notes: '',
  flood_damage: false,
  repainted_panels: false,
  repaint_notes: '',
  mechanical_issues: false,
  mechanical_notes: '',
  dashboard_warnings: '',
  ac_functional: true,
  power_accessories_working: true,
  tire_condition: '',
  modifications: false,
  modification_notes: '',
  requirements_text: '',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(price);
}

function toNullableString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function toLineSeparatedText(values: string[] | null | undefined) {
  return values?.join('\n') ?? '';
}

function normalizeOptionValue(value?: string | null) {
  return value ? value.trim().toLowerCase().replace(/\s+/g, '_') : '';
}

function mapCarToFormValues(car: CarWithPhotos): AdminCarFormInput {
  const details = (car.condition_details ?? {}) as Record<string, unknown>;

  return {
    make: car.make ?? '',
    model: car.model ?? '',
    year: car.year,
    variant: car.variant ?? '',
    transmission: car.transmission,
    fuel_type: car.fuel_type,
    mileage: car.mileage,
    mileage_unit: car.mileage_unit,
    color: car.color ?? '',
    body_type: car.body_type ?? '',
    engine_displacement: car.engine_displacement ?? '',
    drivetrain: car.drivetrain ?? '',
    seats: car.seats ?? undefined,
    plate_ending: car.plate_ending ?? '',
    price_cash: car.price_cash,
    status: car.status,
    is_featured: car.is_featured,
    condition_rating: car.condition_rating,
    description: car.description ?? '',
    accident_history: Boolean(details.accident_history),
    accident_notes: String(details.accident_notes ?? ''),
    flood_damage: Boolean(details.flood_damage),
    repainted_panels: Boolean(details.repainted_panels),
    repaint_notes: String(details.repaint_notes ?? ''),
    mechanical_issues: Boolean(details.mechanical_issues),
    mechanical_notes: String(details.mechanical_notes ?? ''),
    dashboard_warnings: String(details.dashboard_warnings ?? ''),
    ac_functional:
      details.ac_functional === undefined ? true : Boolean(details.ac_functional),
    power_accessories_working:
      details.power_accessories_working === undefined
        ? true
        : Boolean(details.power_accessories_working),
    tire_condition: String(details.tire_condition ?? ''),
    modifications: Boolean(details.modifications),
    modification_notes: String(details.modification_notes ?? ''),
    requirements_text: toLineSeparatedText(car.requirements_docs),
  };
}

function mapSubmissionToFormValues(
  submission: SellerSubmissionWithPhotos
): AdminCarFormInput {
  return {
    ...DEFAULT_VALUES,
    make: submission.make ?? '',
    model: submission.model ?? '',
    year: submission.year,
    variant: submission.variant ?? '',
    transmission:
      normalizeOptionValue(submission.transmission) === 'manual'
        ? 'manual'
        : normalizeOptionValue(submission.transmission) === 'cvt'
          ? 'cvt'
          : 'automatic',
    fuel_type:
      normalizeOptionValue(submission.fuel_type) === 'diesel'
        ? 'diesel'
        : normalizeOptionValue(submission.fuel_type) === 'hybrid'
          ? 'hybrid'
          : normalizeOptionValue(submission.fuel_type) === 'electric'
            ? 'electric'
            : 'gasoline',
    mileage: submission.mileage ?? 0,
    color: submission.color ?? '',
    price_cash: submission.asking_price ?? 0,
    description: submission.admin_notes ?? '',
  };
}

function buildCarPayload(values: AdminCarFormData) {
  return {
    make: values.make,
    model: values.model,
    year: values.year,
    variant: toNullableString(values.variant),
    transmission: values.transmission,
    fuel_type: values.fuel_type,
    mileage: values.mileage,
    mileage_unit: values.mileage_unit,
    color: values.color,
    body_type: values.body_type || null,
    engine_displacement: toNullableString(values.engine_displacement),
    drivetrain: toNullableString(values.drivetrain),
    seats: values.seats ?? null,
    plate_ending: toNullableString(values.plate_ending),
    price_cash: values.price_cash,
    status: values.status,
    is_featured: values.is_featured,
    condition_rating: values.condition_rating,
    description: toNullableString(values.description),
    requirements_docs: (values.requirements_text ?? '')
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean),
    condition_details: {
      accident_history: values.accident_history,
      accident_notes: toNullableString(values.accident_notes),
      flood_damage: values.flood_damage,
      repainted_panels: values.repainted_panels,
      repaint_notes: toNullableString(values.repaint_notes),
      mechanical_issues: values.mechanical_issues,
      mechanical_notes: toNullableString(values.mechanical_notes),
      dashboard_warnings: toNullableString(values.dashboard_warnings),
      ac_functional: values.ac_functional,
      power_accessories_working: values.power_accessories_working,
      tire_condition: toNullableString(values.tire_condition),
      modifications: values.modifications,
      modification_notes: toNullableString(values.modification_notes),
    },
  };
}

function resolveCarId(
  response: AdminCarMutationResponse | undefined,
  fallbackId?: string
) {
  return response?.id ?? response?.data?.id ?? fallbackId ?? null;
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string | null) => void;
  options: readonly SelectOption[];
  placeholder: string;
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
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4 px-6 py-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardContent>
      </Card>

      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <Skeleton className="h-5 w-40" />
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((__, fieldIndex) => (
              <Skeleton key={fieldIndex} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
export function CarForm({ mode, carId, fromSubmission }: CarFormProps) {
  const router = useRouter();
  const isEdit = mode === 'edit';
  const [sourceKey, setSourceKey] = useState<string | null>(null);
  const [existingPhotos, setExistingPhotos] = useState<ExistingCarPhotoItem[]>([]);
  const [initialPhotoOrder, setInitialPhotoOrder] = useState<string[]>([]);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<PendingCarPhotoItem[]>([]);

  const form = useForm<AdminCarFormInput, unknown, AdminCarFormData>({
    resolver: zodResolver(adminCarFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { data: car, isLoading: carLoading } = useAdminCar(carId);
  const {
    data: submission,
    isLoading: submissionLoading,
  } = useAdminSubmission(!isEdit ? fromSubmission ?? undefined : undefined);

  const createCar = useCreateCar();
  const updateCar = useUpdateCar();
  const deleteCar = useDeleteCar();
  const uploadCarPhotos = useUploadCarPhotos();
  const reorderCarPhotos = useReorderCarPhotos();
  const deleteCarPhotos = useDeleteCarPhotos();

  /* eslint-disable react-hooks/set-state-in-effect -- Hydrating editable local state from async query data. */
  useEffect(() => {
    const carPhotos = [...(car?.photos ?? [])].sort(
      (left, right) => left.sort_order - right.sort_order
    );
    const nextSourceKey =
      car &&
      `car:${car.id}:${car.updated_at}:${carPhotos
        .map((photo) => `${photo.id}:${photo.sort_order}`)
        .join('|')}`;

    if (isEdit && car && nextSourceKey && sourceKey !== nextSourceKey) {
      form.reset(mapCarToFormValues(car));
      setExistingPhotos(
        carPhotos.map((photo) => ({
          id: photo.id,
          url: photo.url,
          alt_text: photo.alt_text,
          sort_order: photo.sort_order,
        }))
      );
      setInitialPhotoOrder(carPhotos.map((photo) => photo.id));
      setDeletedPhotoIds([]);
      setSourceKey(nextSourceKey);
    }
  }, [car, form, isEdit, sourceKey]);

  useEffect(() => {
    if (!isEdit && submission && sourceKey !== `submission:${submission.id}`) {
      form.reset(mapSubmissionToFormValues(submission));
      setExistingPhotos([]);
      setInitialPhotoOrder([]);
      setDeletedPhotoIds([]);
      setSourceKey(`submission:${submission.id}`);
    }
  }, [form, isEdit, sourceKey, submission]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    return () => {
      newPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, [newPhotos]);

  const accidentHistory =
    (useWatch({ control: form.control, name: 'accident_history' }) as boolean | undefined) ??
    false;
  const repaintedPanels =
    (useWatch({ control: form.control, name: 'repainted_panels' }) as boolean | undefined) ??
    false;
  const mechanicalIssues =
    (useWatch({ control: form.control, name: 'mechanical_issues' }) as boolean | undefined) ??
    false;
  const modifications =
    (useWatch({ control: form.control, name: 'modifications' }) as boolean | undefined) ??
    false;
  const status =
    (useWatch({ control: form.control, name: 'status' }) as Car['status'] | undefined) ??
    'draft';
  const price =
    (useWatch({ control: form.control, name: 'price_cash' }) as number | undefined) ?? 0;

  const loading = isEdit ? carLoading : Boolean(fromSubmission) && submissionLoading;
  const isSaving =
    createCar.isPending ||
    updateCar.isPending ||
    uploadCarPhotos.isPending ||
    reorderCarPhotos.isPending ||
    deleteCarPhotos.isPending ||
    deleteCar.isPending;

  const activePhotoOrder = useMemo(
    () => existingPhotos.map((photo) => photo.id),
    [existingPhotos]
  );

  function handleAddPhotos(files: FileList | null) {
    if (!files?.length) return;

    const incoming = Array.from(files).map((file) => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setNewPhotos((current) => [...current, ...incoming]);
  }

  function handleRemoveExisting(photoId: string) {
    setExistingPhotos((current) => current.filter((photo) => photo.id !== photoId));
    setDeletedPhotoIds((current) =>
      current.includes(photoId) ? current : [...current, photoId]
    );
  }

  function handleMoveExisting(photoId: string, direction: 'up' | 'down') {
    setExistingPhotos((current) => {
      const index = current.findIndex((photo) => photo.id === photoId);
      if (index === -1) return current;

      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  }

  function handleRemoveNew(photoId: string) {
    setNewPhotos((current) => {
      const photo = current.find((item) => item.id === photoId);
      if (photo) {
        URL.revokeObjectURL(photo.previewUrl);
      }
      return current.filter((item) => item.id !== photoId);
    });
  }

  async function persistPhotos(targetCarId: string) {
    if (isEdit && deletedPhotoIds.length > 0) {
      await deleteCarPhotos.mutateAsync({ id: targetCarId, ids: deletedPhotoIds });
    }

    if (
      isEdit &&
      existingPhotos.length > 0 &&
      initialPhotoOrder.join(',') !== activePhotoOrder.join(',')
    ) {
      await reorderCarPhotos.mutateAsync({
        id: targetCarId,
        photoOrder: existingPhotos.map((photo, index) => ({
          id: photo.id,
          sort_order: index,
        })),
      });
    }

    if (newPhotos.length > 0) {
      const formData = new FormData();
      newPhotos.forEach((photo) => {
        formData.append('photos', photo.file);
      });

      await uploadCarPhotos.mutateAsync({ id: targetCarId, formData });

      newPhotos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
      setNewPhotos([]);
    }
  }

  async function handlePersist(values: AdminCarFormData, nextStatus?: Car['status']) {
    const payload = buildCarPayload({ ...values, status: nextStatus ?? values.status });

    const response = isEdit && carId
      ? await updateCar.mutateAsync({ id: carId, data: payload })
      : await createCar.mutateAsync(payload);

    const resolvedCarId = resolveCarId(response, carId);
    if (!resolvedCarId) {
      throw new Error('Unable to determine the saved car ID.');
    }

    await persistPhotos(resolvedCarId);

    toast.success(
      isEdit ? 'Car listing updated successfully.' : 'Car listing created successfully.'
    );

    if (isEdit) {
      setDeletedPhotoIds([]);
      setInitialPhotoOrder(activePhotoOrder);
      router.refresh();
      return;
    }

    router.replace(`/admin/inventory/${resolvedCarId}/edit`);
  }

  async function handleDelete() {
    if (!carId) return;

    const confirmed = window.confirm(
      'Delete this listing? This will remove the car and its photos.'
    );
    if (!confirmed) return;

    try {
      await deleteCar.mutateAsync(carId);
      toast.success('Car listing deleted.');
      router.push('/admin/inventory');
    } catch {
      toast.error('Failed to delete the listing.');
    }
  }

  const pageTitle = isEdit ? 'Edit Listing' : 'Add New Listing';
  const pageDescription = isEdit
    ? 'Update inventory details, status, and photos.'
    : fromSubmission
      ? 'Create a listing using details from the selected submission.'
      : 'Create a new inventory listing and publish it when ready.';

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
        <CardContent className="flex flex-col gap-4 px-6 py-6 sm:px-8 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-white/70">
              <CarFront className="size-4 text-amber-300" />
              <span>{pageTitle}</span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {pageTitle}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-white/70 sm:text-base">
                {pageDescription}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/10">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
              Listing Preview
            </p>
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={status} className="bg-white/15 text-white" />
              <span className="text-sm text-white/80">
                {price > 0 ? formatPrice(price) : 'Set a price'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            await handlePersist(values);
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : 'Failed to save the listing.';
            toast.error(message);
          }
        })}
      >
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Basic Info</CardTitle>
            <CardDescription>
              Core vehicle details for the inventory listing.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                placeholder="Toyota"
                aria-invalid={!!form.formState.errors.make}
                disabled={isSaving}
                {...form.register('make')}
              />
              {form.formState.errors.make && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.make.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="Fortuner"
                aria-invalid={!!form.formState.errors.model}
                disabled={isSaving}
                {...form.register('model')}
              />
              {form.formState.errors.model && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.model.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="2022"
                aria-invalid={!!form.formState.errors.year}
                disabled={isSaving}
                {...form.register('year')}
              />
              {form.formState.errors.year && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.year.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="variant">Variant</Label>
              <Input
                id="variant"
                placeholder="G 4x2 AT"
                aria-invalid={!!form.formState.errors.variant}
                disabled={isSaving}
                {...form.register('variant')}
              />
              {form.formState.errors.variant && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.variant.message}
                </p>
              )}
            </div>

            <Controller
              control={form.control}
              name="body_type"
              render={({ field }) => (
                <SelectField
                  id="body_type"
                  label="Body Type"
                  value={field.value ?? ''}
                  onChange={(value) => field.onChange(value ?? '')}
                  options={ADMIN_BODY_TYPE_OPTIONS}
                  placeholder="Select body type"
                  error={form.formState.errors.body_type?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="transmission"
              render={({ field }) => (
                <SelectField
                  id="transmission"
                  label="Transmission"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 'automatic')}
                  options={ADMIN_TRANSMISSION_OPTIONS}
                  placeholder="Select transmission"
                  error={form.formState.errors.transmission?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="fuel_type"
              render={({ field }) => (
                <SelectField
                  id="fuel_type"
                  label="Fuel Type"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 'gasoline')}
                  options={ADMIN_FUEL_TYPE_OPTIONS}
                  placeholder="Select fuel type"
                  error={form.formState.errors.fuel_type?.message}
                />
              )}
            />

            <div className="space-y-1.5">
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                type="number"
                placeholder="45000"
                aria-invalid={!!form.formState.errors.mileage}
                disabled={isSaving}
                {...form.register('mileage')}
              />
              {form.formState.errors.mileage && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.mileage.message}
                </p>
              )}
            </div>

            <Controller
              control={form.control}
              name="mileage_unit"
              render={({ field }) => (
                <SelectField
                  id="mileage_unit"
                  label="Mileage Unit"
                  value={field.value ?? 'km'}
                  onChange={(value) => field.onChange(value ?? 'km')}
                  options={MILEAGE_UNIT_OPTIONS}
                  placeholder="Select unit"
                  error={form.formState.errors.mileage_unit?.message}
                />
              )}
            />

            <div className="space-y-1.5">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                placeholder="Pearl White"
                aria-invalid={!!form.formState.errors.color}
                disabled={isSaving}
                {...form.register('color')}
              />
              {form.formState.errors.color && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.color.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="engine_displacement">Engine</Label>
              <Input
                id="engine_displacement"
                placeholder="2.4L"
                aria-invalid={!!form.formState.errors.engine_displacement}
                disabled={isSaving}
                {...form.register('engine_displacement')}
              />
              {form.formState.errors.engine_displacement && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.engine_displacement.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="drivetrain">Drivetrain</Label>
              <Input
                id="drivetrain"
                placeholder="4x2"
                aria-invalid={!!form.formState.errors.drivetrain}
                disabled={isSaving}
                {...form.register('drivetrain')}
              />
              {form.formState.errors.drivetrain && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.drivetrain.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="seats">Seats</Label>
              <Input
                id="seats"
                type="number"
                placeholder="7"
                aria-invalid={!!form.formState.errors.seats}
                disabled={isSaving}
                {...form.register('seats')}
              />
              {form.formState.errors.seats && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.seats.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="plate_ending">Plate Ending</Label>
              <Input
                id="plate_ending"
                placeholder="7"
                aria-invalid={!!form.formState.errors.plate_ending}
                disabled={isSaving}
                {...form.register('plate_ending')}
              />
              {form.formState.errors.plate_ending && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.plate_ending.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Pricing &amp; Status</CardTitle>
            <CardDescription>
              Set the selling price, publication state, and merchandising flags.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="price_cash">Cash Price</Label>
              <Input
                id="price_cash"
                type="number"
                placeholder="1250000"
                aria-invalid={!!form.formState.errors.price_cash}
                disabled={isSaving}
                {...form.register('price_cash')}
              />
              {form.formState.errors.price_cash && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.price_cash.message}
                </p>
              )}
            </div>

            <Controller
              control={form.control}
              name="status"
              render={({ field }) => (
                <SelectField
                  id="status"
                  label="Status"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 'draft')}
                  options={ADMIN_CAR_STATUS_OPTIONS}
                  placeholder="Select status"
                  error={form.formState.errors.status?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="condition_rating"
              render={({ field }) => (
                <SelectField
                  id="condition_rating"
                  label="Condition Rating"
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? 'good')}
                  options={ADMIN_CONDITION_RATING_OPTIONS}
                  placeholder="Select condition"
                  error={form.formState.errors.condition_rating?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <div className="rounded-2xl border bg-muted/20 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="is_featured">Featured Listing</Label>
                      <p className="text-sm text-muted-foreground">
                        Highlight this car on the storefront and admin inventory.
                      </p>
                    </div>
                    <Switch
                      id="is_featured"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isSaving}
                    />
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Condition</CardTitle>
            <CardDescription>
              Capture the known condition details that sales staff should review.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-2">
              <Controller
                control={form.control}
                name="accident_history"
                render={({ field }) => (
                  <div className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="accident_history">Accident History</Label>
                        <p className="text-sm text-muted-foreground">
                          Mark if the vehicle has a documented accident record.
                        </p>
                      </div>
                      <Switch
                        id="accident_history"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                      />
                    </div>

                    {accidentHistory && (
                      <div className="mt-4 space-y-1.5">
                        <Label htmlFor="accident_notes">Accident Notes</Label>
                        <Textarea
                          id="accident_notes"
                          rows={4}
                          placeholder="Summarize the repairs or known issues."
                          aria-invalid={!!form.formState.errors.accident_notes}
                          disabled={isSaving}
                          {...form.register('accident_notes')}
                        />
                        {form.formState.errors.accident_notes && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.accident_notes.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="flood_damage"
                render={({ field }) => (
                  <div className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="flood_damage">Flood Damage</Label>
                        <p className="text-sm text-muted-foreground">
                          Track any confirmed flood exposure before publishing.
                        </p>
                      </div>
                      <Switch
                        id="flood_damage"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="repainted_panels"
                render={({ field }) => (
                  <div className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="repainted_panels">Repainted Panels</Label>
                        <p className="text-sm text-muted-foreground">
                          Mark if repainting or bodywork is visible or disclosed.
                        </p>
                      </div>
                      <Switch
                        id="repainted_panels"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                      />
                    </div>

                    {repaintedPanels && (
                      <div className="mt-4 space-y-1.5">
                        <Label htmlFor="repaint_notes">Repaint Notes</Label>
                        <Textarea
                          id="repaint_notes"
                          rows={4}
                          placeholder="Identify which panels were repainted."
                          aria-invalid={!!form.formState.errors.repaint_notes}
                          disabled={isSaving}
                          {...form.register('repaint_notes')}
                        />
                        {form.formState.errors.repaint_notes && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.repaint_notes.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="mechanical_issues"
                render={({ field }) => (
                  <div className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="mechanical_issues">Mechanical Issues</Label>
                        <p className="text-sm text-muted-foreground">
                          Note current mechanical concerns that buyers should know.
                        </p>
                      </div>
                      <Switch
                        id="mechanical_issues"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                      />
                    </div>

                    {mechanicalIssues && (
                      <div className="mt-4 space-y-1.5">
                        <Label htmlFor="mechanical_notes">Mechanical Notes</Label>
                        <Textarea
                          id="mechanical_notes"
                          rows={4}
                          placeholder="Describe symptoms, repairs, or pending work."
                          aria-invalid={!!form.formState.errors.mechanical_notes}
                          disabled={isSaving}
                          {...form.register('mechanical_notes')}
                        />
                        {form.formState.errors.mechanical_notes && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.mechanical_notes.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="modifications"
                render={({ field }) => (
                  <div className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="modifications">Modifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Flag aftermarket modifications or non-stock components.
                        </p>
                      </div>
                      <Switch
                        id="modifications"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                      />
                    </div>

                    {modifications && (
                      <div className="mt-4 space-y-1.5">
                        <Label htmlFor="modification_notes">Modification Notes</Label>
                        <Textarea
                          id="modification_notes"
                          rows={4}
                          placeholder="List major modifications and relevant details."
                          aria-invalid={!!form.formState.errors.modification_notes}
                          disabled={isSaving}
                          {...form.register('modification_notes')}
                        />
                        {form.formState.errors.modification_notes && (
                          <p className="text-xs text-destructive">
                            {form.formState.errors.modification_notes.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="ac_functional"
                render={({ field }) => (
                  <div className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="ac_functional">A/C Functional</Label>
                        <p className="text-sm text-muted-foreground">
                          Confirm the climate control system is working.
                        </p>
                      </div>
                      <Switch
                        id="ac_functional"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="power_accessories_working"
                render={({ field }) => (
                  <div className="rounded-2xl border p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="power_accessories_working">
                          Power Accessories Working
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Confirm power windows, locks, and related accessories.
                        </p>
                      </div>
                      <Switch
                        id="power_accessories_working"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                      />
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="dashboard_warnings">Dashboard Warnings</Label>
                <Textarea
                  id="dashboard_warnings"
                  rows={4}
                  placeholder="List any active warning lights or dashboard alerts."
                  aria-invalid={!!form.formState.errors.dashboard_warnings}
                  disabled={isSaving}
                  {...form.register('dashboard_warnings')}
                />
                {form.formState.errors.dashboard_warnings && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.dashboard_warnings.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tire_condition">Tire Condition</Label>
                <Textarea
                  id="tire_condition"
                  rows={4}
                  placeholder="Document tread depth, brand, or replacement needs."
                  aria-invalid={!!form.formState.errors.tire_condition}
                  disabled={isSaving}
                  {...form.register('tire_condition')}
                />
                {form.formState.errors.tire_condition && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.tire_condition.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <CarPhotoManager
          existingPhotos={existingPhotos}
          newPhotos={newPhotos}
          onAddPhotos={handleAddPhotos}
          onRemoveExisting={handleRemoveExisting}
          onMoveExisting={handleMoveExisting}
          onRemoveNew={handleRemoveNew}
        />

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-5 text-primary-600" />
              <CardTitle>Requirements</CardTitle>
            </div>
            <CardDescription>
              Add the listing description and any required documents or buyer notes.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="description">Listing Description</Label>
              <Textarea
                id="description"
                rows={8}
                placeholder="Write the main selling points, inspection notes, and standout features."
                aria-invalid={!!form.formState.errors.description}
                disabled={isSaving}
                {...form.register('description')}
              />
              {form.formState.errors.description && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="requirements_text">Requirements</Label>
              <Textarea
                id="requirements_text"
                rows={8}
                placeholder={'One requirement per line\nValid government ID\nProof of income'}
                aria-invalid={!!form.formState.errors.requirements_text}
                disabled={isSaving}
                {...form.register('requirements_text')}
              />
              {form.formState.errors.requirements_text && (
                <p className="text-xs text-destructive">
                  {form.formState.errors.requirements_text.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="font-medium">
                {isEdit ? 'Update this listing' : 'Save this listing'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isEdit
                  ? 'Save changes after updating details, photos, or status.'
                  : 'Create the listing as a draft or publish it immediately.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                render={<Link href="/admin/inventory" />}
                disabled={isSaving}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="secondary"
                disabled={isSaving}
                onClick={form.handleSubmit(async (values) => {
                  try {
                    await handlePersist(values, 'draft');
                  } catch (error) {
                    const message =
                      error instanceof Error
                        ? error.message
                        : 'Failed to save the draft.';
                    toast.error(message);
                  }
                })}
              >
                {isSaving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Draft
              </Button>

              {!isEdit && (
                <Button
                  type="button"
                  disabled={isSaving}
                  onClick={form.handleSubmit(async (values) => {
                    try {
                      await handlePersist(values, 'available');
                    } catch (error) {
                      const message =
                        error instanceof Error
                          ? error.message
                          : 'Failed to publish the listing.';
                      toast.error(message);
                    }
                  })}
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Publish
                </Button>
              )}

              {isEdit && (
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save Changes
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {isEdit && car && (
          <Card className="border-amber-200 bg-amber-50/60 shadow-sm">
            <CardContent className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-2xl bg-amber-100 p-2 text-amber-700">
                  <AlertTriangle className="size-4" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-amber-900">Manage listing record</p>
                  <p className="text-sm text-amber-900/80">
                    Stock #{car.stock_number} created{' '}
                    {format(new Date(car.created_at), 'MMM d, yyyy')}. Current
                    status: <StatusBadge status={car.status} className="ml-1" />
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="destructive"
                disabled={isSaving}
                onClick={handleDelete}
              >
                {deleteCar.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="size-4" />
                )}
                Delete
              </Button>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}
