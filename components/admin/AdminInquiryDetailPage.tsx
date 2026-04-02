'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ArrowLeft,
  CalendarDays,
  CarFront,
  Clock3,
  FileText,
  Loader2,
  Mail,
  Phone,
  Save,
  Send,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/admin/StatusBadge';
import {
  INQUIRY_STATUS_OPTIONS,
  INQUIRY_TYPE_OPTIONS,
} from '@/lib/constants';
import {
  useAdminInquiry,
  useSendReply,
  useUpdateInquiry,
  type AdminInquiryDetail,
} from '@/lib/hooks/use-admin';
import type { Car, InquiryStatus, InquiryType, MessageSender } from '@/lib/types';

const inquiryTypeStyles: Record<InquiryType, string> = {
  buyer_inquiry: 'bg-sky-100 text-sky-800',
  visit_request: 'bg-amber-100 text-amber-800',
  pre_qualification: 'bg-emerald-100 text-emerald-800',
  seller_thread: 'bg-violet-100 text-violet-800',
};

interface AdminInquiryDetailPageProps {
  inquiryId: string;
}

interface ConversationItem {
  id: string;
  sender: MessageSender;
  message: string;
  created_at: string;
}

function formatInquiryType(type: InquiryType) {
  return (
    INQUIRY_TYPE_OPTIONS.find((option) => option.value === type)?.label ??
    type.replace(/_/g, ' ')
  );
}

function InquiryTypeBadge({ type }: { type: InquiryType }) {
  return (
    <Badge
      className={inquiryTypeStyles[type] ?? 'bg-muted text-muted-foreground'}
    >
      {formatInquiryType(type)}
    </Badge>
  );
}

function formatCarSummary(car?: Car | null) {
  if (!car) return 'No linked car';

  return [car.year, car.make, car.model, car.variant]
    .filter(Boolean)
    .join(' ');
}

function formatEmploymentStatus(value?: string | null) {
  return value?.replace(/_/g, ' ') ?? 'Not provided';
}

function buildConversation(inquiry: AdminInquiryDetail): ConversationItem[] {
  const messages = [...(inquiry.messages ?? [])]
    .filter((message) => message.message.trim().length > 0)
    .sort(
      (left, right) =>
        new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
    );

  const conversation: ConversationItem[] = [];
  const initialMessage = inquiry.message?.trim();

  if (initialMessage) {
    conversation.push({
      id: `initial-${inquiry.id}`,
      sender: 'customer',
      message: initialMessage,
      created_at: inquiry.created_at,
    });
  }

  for (const message of messages) {
    const alreadyIncluded =
      message.sender === 'customer' &&
      initialMessage &&
      message.message.trim() === initialMessage &&
      message.created_at === inquiry.created_at;

    if (!alreadyIncluded) {
      conversation.push(message);
    }
  }

  return conversation.sort(
    (left, right) =>
      new Date(left.created_at).getTime() - new Date(right.created_at).getTime()
  );
}

function InquiryDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
        <CardContent className="space-y-4 px-6 py-6 sm:px-8">
          <Skeleton className="h-4 w-28 bg-white/20" />
          <Skeleton className="h-10 w-72 bg-white/20" />
          <Skeleton className="h-5 w-80 max-w-full bg-white/15" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="space-y-3 px-5 py-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-4 px-5 py-5">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-2xl" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function InquiryDetailView({ inquiry }: { inquiry: AdminInquiryDetail }) {
  const updateInquiry = useUpdateInquiry();
  const sendReply = useSendReply();
  const [statusValue, setStatusValue] = useState<InquiryStatus>(inquiry.status);
  const [replyMessage, setReplyMessage] = useState('');
  const [internalNotes, setInternalNotes] = useState(inquiry.internal_notes ?? '');

  const conversation = useMemo(() => buildConversation(inquiry), [inquiry]);
  const notesDirty = internalNotes !== (inquiry.internal_notes ?? '');
  const savingStatus = updateInquiry.isPending;

  async function handleStatusChange(nextStatus: InquiryStatus) {
    const previousStatus = statusValue;
    setStatusValue(nextStatus);

    try {
      await updateInquiry.mutateAsync({
        id: inquiry.id,
        data: { status: nextStatus },
      });
      toast.success('Inquiry status updated.');
    } catch {
      setStatusValue(previousStatus);
      toast.error('Failed to update inquiry status.');
    }
  }

  async function handleSaveNotes() {
    try {
      await updateInquiry.mutateAsync({
        id: inquiry.id,
        data: { internal_notes: internalNotes },
      });
      toast.success('Internal notes saved.');
    } catch {
      toast.error('Failed to save internal notes.');
    }
  }

  async function handleSendReply() {
    if (!replyMessage.trim()) {
      toast.error('Enter a reply before sending.');
      return;
    }

    try {
      await sendReply.mutateAsync({
        id: inquiry.id,
        message: replyMessage.trim(),
      });
      setReplyMessage('');
      toast.success('Reply sent.');
    } catch {
      toast.error('Failed to send reply.');
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 bg-[linear-gradient(135deg,rgba(30,58,95,0.98),rgba(25,47,77,0.92))] text-white shadow-xl ring-1 ring-primary-600/10">
        <CardContent className="space-y-5 px-6 py-6 sm:px-8 sm:py-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Button
                variant="ghost"
                className="w-fit text-white hover:bg-white/10 hover:text-white"
                render={<Link href="/admin/inbox" />}
              >
                <ArrowLeft className="size-4" />
                Back to Inbox
              </Button>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <InquiryTypeBadge type={inquiry.type} />
                  <StatusBadge
                    status={statusValue}
                    className="bg-white/15 text-white"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Conversation with {inquiry.name}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-white/70 sm:text-base">
                    Opened {formatDistanceToNow(new Date(inquiry.created_at), { addSuffix: true })}.
                  </p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-sm rounded-2xl bg-white/8 px-4 py-4 ring-1 ring-white/10">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-white/55">
                Inquiry Status
              </p>
              <div className="mt-3">
                <Select
                  value={statusValue}
                  onValueChange={(value) =>
                    handleStatusChange(value as InquiryStatus)
                  }
                >
                  <SelectTrigger className="w-full border-white/15 bg-white/10 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {INQUIRY_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="mt-2 text-sm text-white/70">
                {savingStatus ? 'Saving status...' : 'Status updates the CRM pipeline immediately.'}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/10">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 size-4 text-amber-300" />
                <div>
                  <p className="text-sm font-medium text-white">Email</p>
                  <p className="text-sm text-white/70">{inquiry.email}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/10">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 text-amber-300" />
                <div>
                  <p className="text-sm font-medium text-white">Phone</p>
                  <p className="text-sm text-white/70">
                    {inquiry.phone || 'No phone number provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/8 px-4 py-3 ring-1 ring-white/10">
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 size-4 text-amber-300" />
                <div>
                  <p className="text-sm font-medium text-white">Inquiry Type</p>
                  <p className="text-sm text-white/70">
                    {formatInquiryType(inquiry.type)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="space-y-4 px-5 py-5">
            <div className="flex items-center gap-2">
              <CarFront className="size-4 text-primary-600" />
              <h3 className="font-medium">Car Info</h3>
            </div>

            {inquiry.car ? (
              <div className="space-y-3">
                <div>
                  <p className="font-medium">{formatCarSummary(inquiry.car)}</p>
                  <p className="text-sm text-muted-foreground">
                    Stock #{inquiry.car.stock_number}
                  </p>
                </div>
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Price</p>
                    <p className="font-medium">
                      PHP {Math.round(inquiry.car.price_cash).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <div className="pt-1">
                      <StatusBadge status={inquiry.car.status} />
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  render={<Link href={`/admin/inventory/${inquiry.car.id}/edit`} />}
                >
                  Open Linked Car
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                This inquiry is not linked to an inventory listing.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="space-y-4 px-5 py-5">
            <div className="flex items-center gap-2">
              <UserRound className="size-4 text-primary-600" />
              <h3 className="font-medium">Pre-Qualification</h3>
            </div>

            {inquiry.pre_qualification ? (
              <div className="grid gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Applicant</p>
                  <p className="font-medium">
                    {inquiry.pre_qualification.full_name}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Employment</p>
                  <p className="font-medium capitalize">
                    {formatEmploymentStatus(
                      inquiry.pre_qualification.employment_status
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monthly Income</p>
                  <p className="font-medium">
                    {inquiry.pre_qualification.monthly_income_range ||
                      'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Employer / Business</p>
                  <p className="font-medium">
                    {inquiry.pre_qualification.employer_name ||
                      'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Employment Length</p>
                  <p className="font-medium">
                    {inquiry.pre_qualification.employment_length ||
                      'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Existing Car Loans</p>
                  <p className="font-medium">
                    {inquiry.pre_qualification.existing_car_loans ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Qualification Status</p>
                  <div className="pt-1">
                    <StatusBadge status={inquiry.pre_qualification.status} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No pre-qualification record is attached to this inquiry.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="space-y-4 px-5 py-5">
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 text-primary-600" />
              <h3 className="font-medium">Visit Info</h3>
            </div>

            {inquiry.preferred_visit_date || inquiry.preferred_visit_time ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Preferred Date</p>
                    <p className="font-medium">
                      {inquiry.preferred_visit_date
                        ? format(
                            new Date(inquiry.preferred_visit_date),
                            'EEEE, MMM d, yyyy'
                          )
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 size-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Preferred Time</p>
                    <p className="font-medium">
                      {inquiry.preferred_visit_time || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No visit schedule has been attached to this inquiry.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
        <Card className="shadow-sm">
          <CardContent className="space-y-4 px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">Conversation Thread</h3>
                <p className="text-sm text-muted-foreground">
                  Customer messages appear on the left. Admin replies stay on the right.
                </p>
              </div>
              <div className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {conversation.length} message{conversation.length === 1 ? '' : 's'}
              </div>
            </div>

            {conversation.length === 0 ? (
              <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-12 text-center text-sm text-muted-foreground">
                No messages yet for this inquiry.
              </div>
            ) : (
              <div className="space-y-4">
                {conversation.map((message) => {
                  const isAdmin = message.sender === 'admin';

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                          isAdmin
                            ? 'bg-primary text-primary-foreground'
                            : 'border bg-muted/30 text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em]">
                          <span>{isAdmin ? 'Admin' : 'Customer'}</span>
                          <span
                            className={
                              isAdmin
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'
                            }
                          >
                            {format(new Date(message.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardContent className="space-y-4 px-5 py-5">
              <div>
                <h3 className="font-medium">Reply</h3>
                <p className="text-sm text-muted-foreground">
                  Send a message back to the customer from the admin inbox.
                </p>
              </div>

              <Textarea
                rows={8}
                value={replyMessage}
                onChange={(event) => setReplyMessage(event.target.value)}
                placeholder="Write your reply to the customer."
              />

              <Button
                className="w-full"
                disabled={sendReply.isPending}
                onClick={handleSendReply}
              >
                {sendReply.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Send Reply
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="space-y-4 px-5 py-5">
              <div>
                <h3 className="font-medium">Internal Notes</h3>
                <p className="text-sm text-muted-foreground">
                  Notes here stay internal and are not visible to the customer.
                </p>
              </div>

              <Textarea
                rows={8}
                value={internalNotes}
                onChange={(event) => setInternalNotes(event.target.value)}
                placeholder="Add sales notes, follow-up reminders, or qualification context."
              />

              <Button
                variant="outline"
                className="w-full"
                disabled={!notesDirty || updateInquiry.isPending}
                onClick={handleSaveNotes}
              >
                {updateInquiry.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function AdminInquiryDetailPage({
  inquiryId,
}: AdminInquiryDetailPageProps) {
  const inquiryQuery = useAdminInquiry(inquiryId);

  if (inquiryQuery.isLoading && !inquiryQuery.data) {
    return <InquiryDetailSkeleton />;
  }

  if (inquiryQuery.isError || !inquiryQuery.data) {
    return (
      <div className="space-y-6">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="space-y-4 px-6 py-6">
            <p className="font-medium text-destructive">
              Failed to load inquiry details.
            </p>
            <p className="text-sm text-muted-foreground">
              Refresh the page or verify the admin inquiry detail endpoint response.
            </p>
            <Button variant="outline" render={<Link href="/admin/inbox" />}>
              <ArrowLeft className="size-4" />
              Back to Inbox
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <InquiryDetailView
      key={`${inquiryQuery.data.id}:${inquiryQuery.data.updated_at}:${inquiryQuery.data.internal_notes ?? ''}`}
      inquiry={inquiryQuery.data}
    />
  );
}
