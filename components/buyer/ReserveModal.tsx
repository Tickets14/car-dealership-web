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

interface ReserveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
  carTitle: string;
}

export function ReserveModal({
  open,
  onOpenChange,
  carId,
  carTitle,
}: ReserveModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

  const { mutate, isPending } = useCreateInquiry();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(
      {
        name,
        email,
        phone,
        subject: `Reservation Request: ${carTitle}`,
        message: message || `I would like to reserve the ${carTitle}.`,
        carId,
      },
      {
        onSuccess: () => {
          toast.success('Reservation request sent! We will contact you shortly.');
          onOpenChange(false);
          setName('');
          setEmail('');
          setPhone('');
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
          <DialogTitle>Reserve This Car</DialogTitle>
          <DialogDescription>
            Submit your details to reserve the {carTitle}. Our team will contact
            you to confirm availability and next steps.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="reserve-name">Full Name *</Label>
            <Input
              id="reserve-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Dela Cruz"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reserve-email">Email *</Label>
            <Input
              id="reserve-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reserve-phone">Phone *</Label>
            <Input
              id="reserve-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09XX XXX XXXX"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reserve-message">Message (optional)</Label>
            <Textarea
              id="reserve-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Any questions or special requests?"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-primary-600 text-white hover:bg-primary-700 border-primary-600">
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Submit Reservation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
