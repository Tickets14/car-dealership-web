const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const ABSOLUTE_URL_PATTERN = /^(?:https?:)?\/\//i;
const SPECIAL_URL_PATTERN = /^(?:data:|blob:)/i;

export const IMAGE_BLUR_DATA_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 12">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e2e8f0" />
        <stop offset="50%" stop-color="#f8fafc" />
        <stop offset="100%" stop-color="#cbd5e1" />
      </linearGradient>
    </defs>
    <rect width="16" height="12" fill="url(#g)" />
  </svg>`
)}`;

export function shouldBypassImageOptimization(src: string) {
  return SPECIAL_URL_PATTERN.test(src);
}

export function resolveMediaUrl(src: string) {
  if (!src || ABSOLUTE_URL_PATTERN.test(src) || SPECIAL_URL_PATTERN.test(src)) {
    return src;
  }

  try {
    const origin = new URL(API_URL).origin;
    return new URL(src.startsWith('/') ? src : `/${src}`, origin).toString();
  } catch {
    return src;
  }
}
