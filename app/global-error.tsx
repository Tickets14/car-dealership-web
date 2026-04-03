'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import './globals.css';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Application Error</title>
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen items-center justify-center px-4 py-16">
          <div className="w-full max-w-lg rounded-3xl border bg-background p-8 text-center shadow-sm">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-7" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight">
              Application Error
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A critical rendering error stopped this page from loading. Retry
              the request or return to the home page.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => reset()}>
                <RotateCcw className="size-4" />
                Try Again
              </Button>
              <Button variant="outline" render={<Link href="/" />}>
                <Home className="size-4" />
                Back Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
