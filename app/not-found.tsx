import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="surface-card max-w-lg border-0 p-8 text-center">
        <p className="section-kicker">404</p>
        <h1 className="mt-3 text-4xl font-semibold">Page Not Found</h1>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          The page you requested does not exist or may have moved.
        </p>
        <Link href="/" className="mt-6 inline-flex">
          <Button className="rounded-2xl">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
