'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ShieldCheck,
  CalendarDays,
  MessageCircle,
  GitCompareArrows,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useCar } from '@/lib/hooks/use-cars';
import { useCompare } from '@/lib/hooks/use-compare';
import { useContactInfo } from '@/lib/hooks/use-settings';
import { PhotoGallery } from '@/components/buyer/PhotoGallery';
import { SpecsGrid } from '@/components/buyer/SpecsGrid';
import { ConditionSummary } from '@/components/buyer/ConditionSummary';
import { FinancingCalculator } from '@/components/buyer/FinancingCalculator';
import { Requirements } from '@/components/buyer/Requirements';
import { ReserveModal } from '@/components/buyer/ReserveModal';
import { VisitModal } from '@/components/buyer/VisitModal';
import { CarCard } from '@/components/buyer/CarCard';
import { CarShareButton } from '@/components/buyer/CarShareButton';
import { getCarListingUrl, getCarWhatsAppLink } from '@/lib/dealership-links';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(price);
}

function estimateMonthly(price: number) {
  // Quick estimate: 20% down, 8% rate, 60 months
  const principal = price * 0.8;
  const r = 0.08 / 12;
  const n = 60;
  const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return formatPrice(monthly);
}

export default function CarDetailPage({
  id,
}: {
  id: string;
}) {
  const { data: car, isLoading, isError } = useCar(id);
  const { whatsappNumber } = useContactInfo();
  const {
    addToCompare,
    removeFromCompare,
    isInCompare,
    isFull,
    compareList,
  } = useCompare();
  const [reserveOpen, setReserveOpen] = useState(false);
  const [visitOpen, setVisitOpen] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-5 w-64 mb-6" />
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="size-16 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // 404 state
  if (isError || !car) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Car Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          The car you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button
          className="mt-6 bg-primary-600 text-white hover:bg-primary-700 border-primary-600"
          render={<Link href="/cars" />}
        >
          Browse All Cars
        </Button>
      </div>
    );
  }

  const title = `${car.year} ${car.make} ${car.model}`;
  const fullTitle = car.variant ? `${title} ${car.variant}` : title;
  const compared = isInCompare(car.id);
  const hasCompareBar = compareList.length >= 2;
  const listingUrl = getCarListingUrl(car.id);

  const whatsappUrl = getCarWhatsAppLink({
    phoneNumber: whatsappNumber,
    carId: car.id,
    carName: fullTitle,
    stockNumber: car.stock_number,
    priceCash: car.price_cash,
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCompareToggle = () => {
    if (compared) {
      removeFromCompare(car.id);
    } else {
      addToCompare({
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        photo: car.photos?.[0]?.url,
      });
    }
  };

  return (
    <>
      <div
        className={cn(
          'mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:pb-8 print:px-0 print:py-4',
          hasCompareBar ? 'pb-44' : 'pb-28'
        )}
      >
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3.5" />
          <Link href="/cars" className="hover:text-foreground transition-colors">
            Cars
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground font-medium truncate">{title}</span>
        </nav>

        {/* Main layout: 3/5 gallery | 2/5 info on desktop */}
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left column: Photos */}
          <div className="lg:col-span-3">
            <PhotoGallery photos={car.photos} alt={fullTitle} />
          </div>

          {/* Right column: Title, Price, Quick Actions */}
          <div className="lg:col-span-2 space-y-5">
            {/* Status badge */}
            {car.status === 'reserved' && (
              <Badge className="bg-amber-600 text-white border-0">Reserved</Badge>
            )}
            {car.status === 'sold' && (
              <Badge className="bg-red-600 text-white border-0">Sold</Badge>
            )}

            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {fullTitle}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Stock #{car.stock_number}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3 print:hidden"
                onClick={handlePrint}
                aria-label={`Print details for ${fullTitle}`}
              >
                <Printer className="size-4" />
                Print
              </Button>
            </div>

            {/* Price */}
            <div>
              <p className="text-3xl font-bold text-primary-600 tabular-nums">
                {formatPrice(car.price_cash)}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                As low as{' '}
                <span className="font-medium text-foreground">
                  {estimateMonthly(car.price_cash)}/mo
                </span>
              </p>
            </div>

            <Separator />

            {/* Quick specs */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-muted-foreground">Mileage</span>
                <p className="font-medium">
                  {new Intl.NumberFormat('en').format(car.mileage)}{' '}
                  {car.mileage_unit}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-muted-foreground">Transmission</span>
                <p className="font-medium capitalize">{car.transmission}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-muted-foreground">Fuel</span>
                <p className="font-medium capitalize">{car.fuel_type}</p>
              </div>
              <div className="rounded-lg bg-muted/50 px-3 py-2">
                <span className="text-muted-foreground">Condition</span>
                <p className="font-medium capitalize">{car.condition_rating}</p>
              </div>
            </div>

            {/* Desktop action buttons */}
            <div className="hidden print:hidden lg:flex flex-col gap-2">
              {car.status === 'available' && (
                <Button
                  className="h-11 bg-primary-600 text-white hover:bg-primary-700 border-primary-600"
                  onClick={() => setReserveOpen(true)}
                >
                  <ShieldCheck className="size-4" />
                  Reserve This Car
                </Button>
              )}
              <Button
                variant="outline"
                className="h-11"
                onClick={() => setVisitOpen(true)}
              >
                <CalendarDays className="size-4" />
                Schedule a Visit
              </Button>
              <div className="flex gap-2">
                {whatsappUrl && (
                  <Button
                    variant="outline"
                    className="flex-1 h-10 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                    render={
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Inquire about ${fullTitle} on WhatsApp`}
                      />
                    }
                  >
                    <MessageCircle className="size-4" />
                    Inquire on WhatsApp
                  </Button>
                )}
                <CarShareButton
                  title={fullTitle}
                  url={listingUrl}
                  className="h-10"
                  ariaLabel={`Share ${fullTitle}`}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    'h-10',
                    compared && 'border-primary-600 bg-primary-50 text-primary-600'
                  )}
                  onClick={handleCompareToggle}
                  disabled={isFull && !compared}
                  aria-label={compared ? 'Remove from compare' : 'Add to compare'}
                >
                  <GitCompareArrows className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content sections below gallery */}
        <div className="mt-8 space-y-8 lg:mt-10 lg:max-w-4xl lg:space-y-10">
          {/* Specs Grid */}
          <section>
            <h2 className="text-xl font-bold mb-4">Specifications</h2>
            <SpecsGrid car={car} />
          </section>

          {/* Description */}
          {car.description && (
            <section>
              <h2 className="text-xl font-bold mb-3">Description</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                {car.description}
              </div>
            </section>
          )}

          {/* Condition Summary */}
          <section>
            <h2 className="text-xl font-bold mb-4">Condition</h2>
            <ConditionSummary
              rating={car.condition_rating}
              details={car.condition_details}
            />
          </section>

          {/* Financing Calculator */}
          <section className="print:hidden">
            <FinancingCalculator price={car.price_cash} />
          </section>

          {/* Requirements */}
          <section>
            <Requirements docs={car.requirements_docs} />
          </section>
        </div>

        {/* Similar Cars */}
        {car.similar && car.similar.length > 0 && (
          <section className="mt-16 print:hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Similar Cars</h2>
              <Button
                variant="link"
                className="text-primary-600"
                render={<Link href="/cars" />}
              >
                View All
              </Button>
            </div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {car.similar.slice(0, 4).map((similar) => (
                <CarCard key={similar.id} car={similar} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky mobile action bar */}
      <div
        className={cn(
          'fixed inset-x-0 z-40 border-t bg-background/95 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm print:hidden lg:hidden',
          hasCompareBar ? 'bottom-[72px]' : 'bottom-0'
        )}
      >
        <div className="flex gap-2">
          {car.status === 'available' && (
            <Button
              className="flex-1 h-11 bg-primary-600 text-white hover:bg-primary-700 border-primary-600"
              onClick={() => setReserveOpen(true)}
            >
              <ShieldCheck className="size-4" />
              Reserve
            </Button>
          )}
          <Button
            variant="outline"
            className="flex-1 h-11"
            onClick={() => setVisitOpen(true)}
          >
            <CalendarDays className="size-4" />
            Visit
          </Button>
          {whatsappUrl && (
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 shrink-0 text-emerald-600 border-emerald-200"
              render={
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Inquire about ${fullTitle} on WhatsApp`}
                />
              }
              aria-label={`Inquire about ${fullTitle} on WhatsApp`}
            >
              <MessageCircle className="size-4" />
            </Button>
          )}
          <CarShareButton
            title={fullTitle}
            url={listingUrl}
            className="h-11 w-11 shrink-0"
            ariaLabel={`Share ${fullTitle}`}
          />
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'h-11 w-11 shrink-0',
              compared && 'border-primary-600 bg-primary-50 text-primary-600'
            )}
            onClick={handleCompareToggle}
            disabled={isFull && !compared}
            aria-label={compared ? 'Remove from compare' : 'Add to compare'}
          >
            <GitCompareArrows className="size-4" />
          </Button>
        </div>
      </div>

      {/* Modals */}
      <ReserveModal
        open={reserveOpen}
        onOpenChange={setReserveOpen}
        carId={car.id}
        carTitle={fullTitle}
      />
      <VisitModal
        open={visitOpen}
        onOpenChange={setVisitOpen}
        carId={car.id}
        carTitle={fullTitle}
        stockNumber={car.stock_number}
        priceCash={car.price_cash}
      />
    </>
  );
}
