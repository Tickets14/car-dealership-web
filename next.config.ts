import type { NextConfig } from "next";

function toRemotePattern(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    return new URL('/**', `${url.protocol}//${url.host}`);
  } catch {
    return null;
  }
}

type RemotePattern = URL;

const remotePatternCandidates = [
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api',
  'http://127.0.0.1:5000/api',
]
  .map(toRemotePattern)
  .filter((pattern): pattern is RemotePattern => Boolean(pattern));

const remotePatterns = remotePatternCandidates.filter(
  (pattern, index, patterns) =>
    patterns.findIndex((candidate) => candidate.toString() === pattern.toString()) ===
    index
);

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
};

export default nextConfig;
