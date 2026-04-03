import { toAbsoluteUrl } from '@/lib/seo';

interface CarLinkInput {
  carId: string;
  carName: string;
  stockNumber: string;
  priceCash: number;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(price);
}

export function sanitizePhoneNumber(phoneNumber: string | null | undefined) {
  return phoneNumber?.replace(/\D/g, '') ?? '';
}

export function getCarListingUrl(carId: string) {
  return toAbsoluteUrl(`/cars/${carId}`);
}

export function buildCarInquiryMessage({
  carId,
  carName,
  stockNumber,
  priceCash,
}: CarLinkInput) {
  const listingUrl = getCarListingUrl(carId);

  return [
    `Hi! I'm interested in the ${carName}.`,
    `Stock number: ${stockNumber}`,
    `Cash price: ${formatPrice(priceCash)}`,
    `Listing: ${listingUrl}`,
    'Is it still available?',
  ].join('\n');
}

export function getWhatsAppLink(
  phoneNumber: string | null | undefined,
  message?: string
) {
  const sanitized = sanitizePhoneNumber(phoneNumber);

  if (!sanitized) {
    return null;
  }

  if (!message) {
    return `https://wa.me/${sanitized}`;
  }

  return `https://wa.me/${sanitized}?text=${encodeURIComponent(message)}`;
}

export function getCarWhatsAppLink(input: CarLinkInput & {
  phoneNumber: string | null | undefined;
}) {
  return getWhatsAppLink(input.phoneNumber, buildCarInquiryMessage(input));
}

export function getFacebookShareLink(url: string) {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
}

export function getMessengerShareLink(url: string) {
  const encodedUrl = encodeURIComponent(url);
  return `https://www.facebook.com/dialog/send/?app_id=1217981644879628&link=${encodedUrl}&redirect_uri=${encodedUrl}`;
}
