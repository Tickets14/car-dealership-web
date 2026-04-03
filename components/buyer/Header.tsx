'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, MessageCircle, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { BUSINESS_NAME } from '@/lib/constants';
import { getWhatsAppLink } from '@/lib/dealership-links';
import { useContactInfo } from '@/lib/hooks/use-settings';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/cars', label: 'Browse Cars' },
  { href: '/sell', label: 'Sell Your Car' },
  { href: '/pre-qualify', label: 'Pre-Qualify' },
] as const;

function WhatsAppButton({
  className,
  phoneNumber,
}: {
  className?: string;
  phoneNumber: string;
}) {
  const href =
    getWhatsAppLink(
      phoneNumber,
      'Hi! I would like to ask about your available cars.'
    ) ?? '#';

  return (
    <Button
      className={cn(
        'bg-amber-500 text-primary-900 font-semibold hover:bg-amber-400 border-amber-500',
        className
      )}
      size="sm"
      render={<a href={href} target="_blank" rel="noopener noreferrer" />}
      aria-label="Open WhatsApp inquiry"
    >
      <MessageCircle className="size-4" data-icon="inline-start" />
      WhatsApp Us
    </Button>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { contactInfo, whatsappNumber } = useContactInfo();
  const phoneNumber = contactInfo.phone || whatsappNumber;
  const emailAddress = contactInfo.email || 'info@autodeals.ph';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full bg-primary-600 text-white transition-shadow duration-200',
        scrolled && 'shadow-lg backdrop-blur-md bg-primary-600/95'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight">
          {BUSINESS_NAME}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10',
                pathname === link.href && 'bg-white/15'
              )}
            >
              {link.label}
            </Link>
          ))}
          {whatsappNumber && (
            <WhatsAppButton className="ml-3" phoneNumber={whatsappNumber} />
          )}
        </nav>

        {/* Mobile hamburger */}
        <Sheet key={pathname}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 md:hidden"
              />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </SheetTrigger>

          <SheetContent side="right" className="w-72 bg-primary-600 text-white border-primary-700">
            <SheetHeader>
              <SheetTitle className="text-white">{BUSINESS_NAME}</SheetTitle>
              <SheetDescription className="text-white/60">Navigation</SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col gap-1 px-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10',
                    pathname === link.href && 'bg-white/15'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-white/10 p-4 space-y-3">
              {whatsappNumber && (
                <WhatsAppButton className="w-full" phoneNumber={whatsappNumber} />
              )}
              {(phoneNumber || emailAddress) && (
                <div className="flex flex-col gap-2 text-sm text-white/70">
                  {phoneNumber && (
                    <a
                      href={`tel:${phoneNumber}`}
                      className="flex items-center gap-2 hover:text-white"
                      aria-label={`Call ${phoneNumber}`}
                    >
                      <Phone className="size-3.5" />
                      {phoneNumber}
                    </a>
                  )}
                  <a
                    href={`mailto:${emailAddress}`}
                    className="flex items-center gap-2 hover:text-white"
                    aria-label={`Email ${emailAddress}`}
                  >
                    <Mail className="size-3.5" />
                    {emailAddress}
                  </a>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
