'use client';

import { Copy, MessageCircle, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getFacebookShareLink,
  getMessengerShareLink,
} from '@/lib/dealership-links';

function FacebookIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}

function shouldUseNativeShare() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  if (typeof navigator.share !== 'function') {
    return false;
  }

  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const compactViewport = window.matchMedia('(max-width: 768px)').matches;

  return coarsePointer || compactViewport;
}

interface CarShareButtonProps {
  title: string;
  url: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>['variant'];
  size?: React.ComponentProps<typeof Button>['size'];
  label?: string;
  ariaLabel?: string;
}

export function CarShareButton({
  title,
  url,
  className,
  variant = 'outline',
  size = 'icon',
  label,
  ariaLabel = 'Share this listing',
}: CarShareButtonProps) {
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied!');
    } catch {
      toast.error('Unable to copy the listing link.');
    }
  }

  async function handleNativeShare() {
    try {
      await navigator.share({ title, url });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      toast.error('Unable to open the share sheet.');
    }
  }

  function openShareWindow(shareUrl: string) {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  }

  const content = (
    <>
      <Share2 className="size-4" />
      {label}
    </>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant={variant}
            size={size}
            className={className}
            aria-label={ariaLabel}
            onClick={(event) => {
              if (!shouldUseNativeShare()) {
                return;
              }

              event.preventDefault();
              void handleNativeShare();
            }}
          />
        }
      >
        {content}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="w-48">
        <DropdownMenuItem onClick={copyLink}>
          <Copy className="size-4" />
          Copy Link
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openShareWindow(getFacebookShareLink(url))}
        >
          <FacebookIcon />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => openShareWindow(getMessengerShareLink(url))}
        >
          <MessageCircle className="size-4" />
          Share on Messenger
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
