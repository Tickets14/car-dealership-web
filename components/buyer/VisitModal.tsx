'use client';

import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateInquiry } from '@/lib/hooks/use-inquiries';
import { useDealershipSettings } from '@/lib/hooks/use-settings';
import {
  combineDateAndTime,
  createVisitCalendarFile,
  downloadCalendarFile,
  formatTimeLabel,
  generateTimeSlots,
} from '@/lib/calendar-utils';
import { getCarListingUrl } from '@/lib/dealership-links';
import { DAY_LABELS, isClosedOnDate } from '@/lib/site-settings';
import { cn } from '@/lib/utils';

interface VisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
  carTitle: string;
  stockNumber: string;
  priceCash: number;
}

interface VisitConfirmation {
  date: Date;
  time: string;
  message: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(price);
}

function startOfToday() {
  const value = new Date();
  value.setHours(0, 0, 0, 0);
  return value;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getCurrentTimeFloor() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;
}

export function VisitModal({
  open,
  onOpenChange,
  carId,
  carTitle,
  stockNumber,
  priceCash,
}: VisitModalProps) {
  const { mutate, isPending } = useCreateInquiry();
  const { businessHours, contactInfo } = useDealershipSettings();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [confirmation, setConfirmation] = useState<VisitConfirmation | null>(
    null
  );

  const today = useMemo(() => startOfToday(), []);
  const closedDays = useMemo(
    () =>
      DAY_LABELS.filter((day) => businessHours[day.key] === null).map(
        (day) => day.label
      ),
    [businessHours]
  );

  const availableSlots = useMemo(() => {
    if (!selectedDate) {
      return [];
    }

    const slots = generateTimeSlots(businessHours, selectedDate);

    if (!isSameDay(selectedDate, today)) {
      return slots;
    }

    const currentTime = getCurrentTimeFloor();
    return slots.filter((slot) => slot.value >= currentTime);
  }, [businessHours, selectedDate, today]);
  const selectedTime = availableSlots.some((slot) => slot.value === time)
    ? time
    : '';

  function isDateDisabled(date: Date) {
    return date < today || isClosedOnDate(businessHours, date);
  }

  function resetForm() {
    setName('');
    setEmail('');
    setPhone('');
    setSelectedDate(undefined);
    setTime('');
    setMessage('');
    setCalendarOpen(false);
    setConfirmation(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      resetForm();
    }

    onOpenChange(nextOpen);
  }

  function handleDownloadCalendar() {
    if (!confirmation) {
      return;
    }

    const file = createVisitCalendarFile({
      carId,
      carName: carTitle,
      stockNumber,
      priceCash,
      visitDate: confirmation.date,
      time: confirmation.time,
      contactInfo,
    });

    downloadCalendarFile(file.fileName, file.content);
    toast.success('Calendar file downloaded.');
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedDate || !selectedTime) {
      toast.error('Select a valid visit date and time.');
      return;
    }

    const listingUrl = getCarListingUrl(carId);
    const scheduledAt = combineDateAndTime(selectedDate, selectedTime);
    const summary = [
      `I would like to schedule a visit to see the ${carTitle}.`,
      `Stock number: ${stockNumber}`,
      `Cash price: ${formatPrice(priceCash)}`,
      `Preferred date: ${format(scheduledAt, 'PPP')}`,
      `Preferred time: ${formatTimeLabel(selectedTime)}`,
      `Listing: ${listingUrl}`,
      message && `Note: ${message}`,
    ]
      .filter(Boolean)
      .join('\n');

    mutate(
      {
        name,
        email,
        phone,
        subject: `Visit Request: ${carTitle}`,
        message: summary,
        carId,
      },
      {
        onSuccess: () => {
          setConfirmation({
            date: selectedDate,
            time: selectedTime,
            message,
          });
          toast.success('Visit request sent! Your summary is ready.');
        },
        onError: () => {
          toast.error('Failed to send request. Please try again.');
        },
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {confirmation ? (
          <>
            <DialogHeader>
              <div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="size-6" />
              </div>
              <DialogTitle className="pt-2">Visit Request Sent</DialogTitle>
              <DialogDescription>
                We&apos;ll confirm your schedule shortly. You can download a
                calendar file now to save the appointment request.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="rounded-2xl border bg-muted/20 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Vehicle
                    </p>
                    <p className="mt-1 font-medium">{carTitle}</p>
                    <p className="text-sm text-muted-foreground">
                      Stock #{stockNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Cash Price
                    </p>
                    <p className="mt-1 font-medium">{formatPrice(priceCash)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Visit Date
                    </p>
                    <p className="mt-1 font-medium">
                      {format(confirmation.date, 'PPPP')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Time Slot
                    </p>
                    <p className="mt-1 font-medium">
                      {formatTimeLabel(confirmation.time)}
                    </p>
                  </div>
                </div>

                {contactInfo.address && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Dealership Address
                    </p>
                    <p className="mt-1 text-sm">{contactInfo.address}</p>
                  </div>
                )}

                {confirmation.message && (
                  <div className="mt-4 border-t pt-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      Note
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {confirmation.message}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleDownloadCalendar}
              >
                <Download className="size-4" />
                Add to Calendar (.ics)
              </Button>
              <Button type="button" onClick={() => handleOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Schedule a Visit</DialogTitle>
              <DialogDescription>
                Pick an open day and available time slot for {carTitle}. Closed
                days and past dates are unavailable.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="visit-name">Full Name *</Label>
                <Input
                  id="visit-name"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Juan Dela Cruz"
                  aria-label="Full name"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="visit-email">Email *</Label>
                <Input
                  id="visit-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  aria-label="Email address"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="visit-phone">Phone *</Label>
                <Input
                  id="visit-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="09XX XXX XXXX"
                  aria-label="Phone number"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="visit-date-trigger">Preferred Date *</Label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          id="visit-date-trigger"
                          type="button"
                          variant="outline"
                          className={cn(
                            'w-full justify-between',
                            !selectedDate && 'text-muted-foreground'
                          )}
                          aria-label="Choose a visit date"
                        />
                      }
                    >
                      <span>
                        {selectedDate
                          ? format(selectedDate, 'PPP')
                          : 'Select a date'}
                      </span>
                      <CalendarDays className="size-4" />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                          setSelectedDate(date);
                          setTime('');
                          if (date) {
                            setCalendarOpen(false);
                          }
                        }}
                        disabled={isDateDisabled}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="visit-time">Preferred Time *</Label>
                  <Select
                    value={selectedTime}
                    onValueChange={(value) => setTime(value ?? '')}
                  >
                    <SelectTrigger
                      id="visit-time"
                      className="w-full"
                      aria-label="Choose a visit time"
                    >
                      <SelectValue
                        placeholder={
                          selectedDate ? 'Select a time slot' : 'Choose a date first'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent align="start">
                      {availableSlots.length > 0 ? (
                        availableSlots.map((slot) => (
                          <SelectItem key={slot.value} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__no_slots" disabled>
                          No slots available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {closedDays.length > 0 && (
                <div className="rounded-xl bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  Closed on: {closedDays.join(', ')}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="visit-message">Message (optional)</Label>
                <Textarea
                  id="visit-message"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Any specific concerns or questions?"
                  rows={2}
                  aria-label="Optional message"
                />
              </div>

              <DialogFooter>
                  <Button
                    type="submit"
                    disabled={isPending || !selectedDate || !selectedTime}
                    className="w-full sm:w-auto bg-primary-600 text-white hover:bg-primary-700 border-primary-600"
                  >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  <Clock3 className="size-4" />
                  Schedule Visit
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
