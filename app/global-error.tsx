'use client';

import { useEffect } from 'react';

import { errorToast } from '@/components/shared/error-toast';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    errorToast({
      error,
      fallbackMessage: 'A fatal application error occurred.',
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-10 sm:px-6">
          <div className="surface-card-muted w-full rounded-[1.75rem] border border-destructive/15 p-8 text-center">
            <h1 className="text-2xl font-semibold">Application Error</h1>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              A fatal application error occurred. Try again, and if it persists,
              use the reference shown in any error toast to trace the request.
            </p>
            <div className="mt-6 flex justify-center">
              <Button type="button" className="rounded-2xl" onClick={reset}>
                Try again
              </Button>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
