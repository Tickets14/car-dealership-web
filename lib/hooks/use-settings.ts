'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { BusinessHours, ContactInfo } from '@/lib/types';
import {
  DEFAULT_BUSINESS_HOURS,
  DEFAULT_CONTACT_INFO,
  normalizeSettingsPayload,
  parseSettingValue,
  resolveWhatsAppNumber,
  type SettingsPayload,
} from '@/lib/site-settings';

export function useSettings(keys: string[]) {
  return useQuery<SettingsPayload, Error, Record<string, unknown>>({
    queryKey: ['settings', ...keys],
    queryFn: () =>
      apiClient.get('/settings', { params: { keys: keys.join(',') } }),
    enabled: keys.length > 0,
    select: normalizeSettingsPayload,
  });
}

export function useContactInfo() {
  const query = useSettings(['contact_info']);
  const contactInfo = parseSettingValue<ContactInfo>(
    query.data?.contact_info,
    DEFAULT_CONTACT_INFO
  );

  return {
    ...query,
    contactInfo,
    whatsappNumber: resolveWhatsAppNumber(contactInfo),
  };
}

export function useBusinessHours() {
  const query = useSettings(['business_hours']);
  const businessHours = parseSettingValue<BusinessHours>(
    query.data?.business_hours,
    DEFAULT_BUSINESS_HOURS
  );

  return {
    ...query,
    businessHours,
  };
}

export function useDealershipSettings() {
  const query = useSettings(['business_hours', 'contact_info']);
  const businessHours = parseSettingValue<BusinessHours>(
    query.data?.business_hours,
    DEFAULT_BUSINESS_HOURS
  );
  const contactInfo = parseSettingValue<ContactInfo>(
    query.data?.contact_info,
    DEFAULT_CONTACT_INFO
  );

  return {
    ...query,
    businessHours,
    contactInfo,
    whatsappNumber: resolveWhatsAppNumber(contactInfo),
  };
}
