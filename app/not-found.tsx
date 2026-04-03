import Link from 'next/link';
import { Home, SearchX } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <SearchX className="size-7" />
        </div>
        <p className="mt-5 text-sm font-medium uppercase tracking-[0.18em] text-primary-600">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          The page or vehicle you requested doesn&apos;t exist anymore, or the
          link is no longer valid.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button render={<Link href="/cars" />}>Browse Cars</Button>
          <Button variant="outline" render={<Link href="/" />}>
            <Home className="size-4" />
            Back Home
          </Button>
        </div>
      </div>
    </div>
  );
}
