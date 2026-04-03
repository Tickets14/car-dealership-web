import { WHATSAPP_NUMBER } from '@/lib/constants';
import type { BusinessHours, ContactInfo, InstallmentTerms } from '@/lib/types';

export const DAY_LABELS: ReadonlyArray<{
  key: keyof BusinessHours;
  label: string;
}> = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const;

export const DEFAULT_INSTALLMENT_TERMS: InstallmentTerms = {
  interest_rate_annual: 12,
  available_terms: [12, 18, 24, 36, 48],
  min_down_payment_percent: 20,
};

export const DEFAULT_BUSINESS_HOURS: BusinessHours = {
  monday: { open: '09:00', close: '18:00' },
  tuesday: { open: '09:00', close: '18:00' },
  wednesday: { open: '09:00', close: '18:00' },
  thursday: { open: '09:00', close: '18:00' },
  friday: { open: '09:00', close: '18:00' },
  saturday: { open: '09:00', close: '18:00' },
  sunday: null,
};

export const DEFAULT_CONTACT_INFO: ContactInfo = {
  business_name: 'AutoDeals',
  address: '',
  phone: '',
  whatsapp: '',
  email: '',
  facebook: '',
  instagram: '',
};

export type SettingsPayload =
  | Record<string, unknown>
  | Array<{ key: string; value: unknown }>
  | undefined;

export function normalizeSettingsPayload(payload: SettingsPayload) {
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

export function parseSettingValue<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) {
    return fallback;
  }

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

export function getDayKeyFromDate(date: Date): keyof BusinessHours {
  return [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ][date.getDay()] as keyof BusinessHours;
}

export function getBusinessHoursForDate(
  businessHours: BusinessHours,
  date: Date
) {
  return businessHours[getDayKeyFromDate(date)];
}

export function isClosedOnDate(businessHours: BusinessHours, date: Date) {
  return getBusinessHoursForDate(businessHours, date) === null;
}

export function resolveWhatsAppNumber(
  contactInfo?: Partial<ContactInfo> | null
) {
  return contactInfo?.whatsapp?.trim() || WHATSAPP_NUMBER.trim();
}
