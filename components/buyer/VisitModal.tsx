'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateInquiry } from '@/lib/hooks/use-inquiries';
import { Loader2 } from 'lucide-react';

interface VisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
  carTitle: string;
}

export function VisitModal({
  open,
  onOpenChange,
  carId,
  carTitle,
}: VisitModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');

  const { mutate, isPending } = useCreateInquiry();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      {
        name,
        email,
        phone,
        subject: `Visit Request: ${carTitle}`,
        message: [
          `I would like to schedule a visit to see the ${carTitle}.`,
          date && `Preferred date: ${date}`,
          time && `Preferred time: ${time}`,
          message && `Note: ${message}`,
        ]
          .filter(Boolean)
          .join('\n'),
        carId,
      },
      {
        onSuccess: () => {
          toast.success('Visit request sent! We will confirm your schedule.');
          onOpenChange(false);
          setName('');
          setEmail('');
          setPhone('');
          setDate('');
          setTime('');
          setMessage('');
        },
        onError: () => {
          toast.error('Failed to send request. Please try again.');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule a Visit</DialogTitle>
          <DialogDescription>
            Book a time to see the {carTitle} in person. We&apos;ll confirm your
            appointment within 24 hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="visit-name">Full Name *</Label>
            <Input
              id="visit-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Dela Cruz"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="visit-email">Email *</Label>
            <Input
              id="visit-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="visit-phone">Phone *</Label>
            <Input
              id="visit-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09XX XXX XXXX"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="visit-date">Preferred Date *</Label>
              <Input
                id="visit-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visit-time">Preferred Time</Label>
              <Input
                id="visit-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="visit-message">Message (optional)</Label>
            <Textarea
              id="visit-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Any specific concerns or questions?"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-primary-600 text-white hover:bg-primary-700 border-primary-600">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Schedule Visit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
