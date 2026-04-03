import type { BusinessHours, ContactInfo } from '@/lib/types';
import { getBusinessHoursForDate } from '@/lib/site-settings';
import { getCarListingUrl } from '@/lib/dealership-links';

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function formatIcsDate(date: Date) {
  return date
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function parseTimeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

export function formatTimeLabel(value: string) {
  const minutes = parseTimeToMinutes(value);

  if (minutes === null) {
    return value;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;

  return `${displayHours}:${String(mins).padStart(2, '0')} ${period}`;
}

export function generateTimeSlots(
  businessHours: BusinessHours,
  date: Date,
  intervalMinutes = 30
) {
  const dayHours = getBusinessHoursForDate(businessHours, date);

  if (!dayHours) {
    return [];
  }

  const openMinutes = parseTimeToMinutes(dayHours.open);
  const closeMinutes = parseTimeToMinutes(dayHours.close);

  if (
    openMinutes === null ||
    closeMinutes === null ||
    openMinutes >= closeMinutes
  ) {
    return [];
  }

  const slots: Array<{ value: string; label: string }> = [];

  for (
    let minutes = openMinutes;
    minutes + intervalMinutes <= closeMinutes;
    minutes += intervalMinutes
  ) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const value = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    slots.push({ value, label: formatTimeLabel(value) });
  }

  return slots;
}

export function combineDateAndTime(date: Date, time: string) {
  const minutes = parseTimeToMinutes(time);
  const value = new Date(date);

  if (minutes === null) {
    return value;
  }

  value.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return value;
}

export function createVisitCalendarFile(options: {
  carId: string;
  carName: string;
  stockNumber: string;
  priceCash: number;
  visitDate: Date;
  time: string;
  contactInfo: ContactInfo;
  durationMinutes?: number;
}) {
  const {
    carId,
    carName,
    stockNumber,
    priceCash,
    visitDate,
    time,
    contactInfo,
    durationMinutes = 30,
  } = options;
  const start = combineDateAndTime(visitDate, time);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const title = `Visit for ${carName}`;
  const listingUrl = getCarListingUrl(carId);
  const description = [
    `Vehicle: ${carName}`,
    `Stock number: ${stockNumber}`,
    `Cash price: ${new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      maximumFractionDigits: 0,
    }).format(priceCash)}`,
    `Listing: ${listingUrl}`,
  ].join('\n');

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AutoDeals//Visit Schedule//EN',
    'BEGIN:VEVENT',
    `UID:visit-${carId}-${start.getTime()}@autodeals`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(start)}`,
    `DTEND:${formatIcsDate(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    contactInfo.address
      ? `LOCATION:${escapeIcsText(contactInfo.address)}`
      : undefined,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);

  return {
    fileName: `visit-${carId}-${time.replace(':', '')}.ics`,
    content: lines.join('\r\n'),
    start,
    end,
  };
}

export function downloadCalendarFile(fileName: string, content: string) {
  const blob = new Blob([content], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
