import type { Testimonial } from '@/lib/types';

function isTestimonialArray(value: unknown): value is Testimonial[] {
  return Array.isArray(value);
}

export function normalizeTestimonialsPayload(payload: unknown): Testimonial[] {
  if (isTestimonialArray(payload)) {
    return payload;
  }

  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const directCandidates = [record.testimonials, record.items, record.data];

  for (const candidate of directCandidates) {
    if (isTestimonialArray(candidate)) {
      return candidate;
    }

    if (!candidate || typeof candidate !== 'object') {
      continue;
    }

    const nestedRecord = candidate as Record<string, unknown>;

    if (isTestimonialArray(nestedRecord.testimonials)) {
      return nestedRecord.testimonials;
    }

    if (isTestimonialArray(nestedRecord.items)) {
      return nestedRecord.items;
    }

    if (isTestimonialArray(nestedRecord.data)) {
      return nestedRecord.data;
    }
  }

  return [];
}
