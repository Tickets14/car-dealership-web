import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Search,
  FileCheck,
  CarFront,
  ArrowRight,
  ShieldCheck,
  Car,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS_NAME } from '@/lib/constants';
import { HeroSearchBar } from '@/components/buyer/home/HeroSearchBar';
import { FeaturedCarsSection } from '@/components/buyer/home/FeaturedCarsSection';
import { RecentlySoldSection } from '@/components/buyer/home/RecentlySoldSection';
import { TestimonialsSection } from '@/components/buyer/home/TestimonialsSection';

export const metadata: Metadata = {
  title: `${BUSINESS_NAME} — Quality Pre-Owned Cars`,
  description:
    'Find your next car at AutoDeals. Browse quality pre-owned vehicles, get pre-qualified for financing, or sell your car. Trusted dealership in Metro Manila.',
  openGraph: {
    title: `${BUSINESS_NAME} — Quality Pre-Owned Cars`,
    description:
      'Browse quality pre-owned vehicles, get pre-qualified for financing, or sell your car.',
    type: 'website',
  },
};

const STEPS = [
  {
    icon: <Search className="size-6" />,
    title: 'Browse & Compare',
    description:
      'Search our inventory by make, model, price, and more. Compare up to 3 cars side by side.',
  },
  {
    icon: <FileCheck className="size-6" />,
    title: 'Inquire or Pre-Qualify',
    description:
      'Send us a message or check your financing eligibility in minutes — no commitment required.',
  },
  {
    icon: <CarFront className="size-6" />,
    title: 'Reserve & Drive Home',
    description:
      'Reserve your car, finalize the paperwork, and drive home in your new ride.',
  },
] as const;

const STATS = [
  { value: '500+', label: 'Cars Sold' },
  { value: '4.8★', label: 'Avg. Rating' },
  { value: '5+', label: 'Years Trusted' },
] as const;

export default function HomePage() {
  return (
    <>
      {/* ──── Hero Section ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary-600 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-600 to-primary-700" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.08),transparent_60%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Find Your Next Car
            </h1>
            <p className="mt-4 text-lg text-white/80 leading-relaxed sm:text-xl">
              Quality pre-owned vehicles at fair prices. Browse our inventory,
              compare options, and drive home with confidence.
            </p>

            <div className="mt-8">
              <HeroSearchBar />
            </div>

            <div className="mt-10 flex gap-8 sm:gap-12">
              {STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold sm:text-3xl">{stat.value}</p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──── Featured Cars ─────────────────────────────────────────── */}
      <FeaturedCarsSection />

      {/* ──── How It Works ──────────────────────────────────────────── */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              How It Works
            </h2>
            <p className="mt-2 text-muted-foreground">
              Three simple steps to your next car
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex flex-col items-center text-center">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-md">
                  {step.icon}
                </div>
                <span className="mt-4 text-xs font-semibold text-primary-600 uppercase tracking-wider">
                  Step {i + 1}
                </span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ──── Recently Sold ─────────────────────────────────────────── */}
      <RecentlySoldSection />

      {/* ──── Sell Your Car CTA ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-primary-600 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700" />
            <div className="relative">
              <Car className="mx-auto size-10 text-amber-400" />
              <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
                Want to Sell Your Car?
              </h2>
              <p className="mt-2 text-white/80 max-w-md mx-auto">
                Get a fair offer from us. Submit your car details and we&apos;ll
                get back to you within 24 hours.
              </p>
              <Button
                className="mt-6 h-11 bg-amber-500 px-6 text-sm font-semibold text-primary-900 hover:bg-amber-400 border-amber-500"
                render={<Link href="/sell" />}
              >
                Submit Your Car
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ──── Testimonials ──────────────────────────────────────────── */}
      <TestimonialsSection />

      {/* ──── Pre-Qualify CTA ───────────────────────────────────────── */}
      <section className="border-t bg-muted/30 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                <ShieldCheck className="size-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold">Pre-Qualify for Financing</p>
                <p className="text-sm text-muted-foreground">
                  Check your eligibility in minutes — no impact on your credit
                </p>
              </div>
            </div>
            <Button
              className="h-10 bg-primary-600 px-5 text-sm font-semibold text-white hover:bg-primary-700 border-primary-600"
              render={<Link href="/pre-qualify" />}
            >
              Pre-Qualify Now
              <ArrowRight className="size-4" data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
