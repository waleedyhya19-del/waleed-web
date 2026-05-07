'use client';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function LoadingCard({ className }: { className?: string }) {
  return <Skeleton className={cn('rounded-[1.75rem]', className)} />;
}

export function AuthPageSkeleton() {
  return (
    <div className="surface-card w-full max-w-lg border-0 p-6 shadow-none">
      <div className="space-y-4">
        <LoadingCard className="h-4 w-28 rounded-full" />
        <LoadingCard className="h-9 w-3/4" />
        <LoadingCard className="h-4 w-full" />
        <LoadingCard className="h-4 w-11/12" />
      </div>
      <div className="mt-8 space-y-4">
        <LoadingCard className="h-12 w-full rounded-2xl" />
        <LoadingCard className="h-12 w-full rounded-2xl" />
        <LoadingCard className="h-12 w-40 rounded-2xl" />
      </div>
    </div>
  );
}

export function DashboardOverviewSkeleton() {
  return (
    <div className="page-grid">
      <LoadingCard className="h-56 w-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingCard key={index} className="h-44 w-full" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <LoadingCard className="h-80 w-full" />
        <LoadingCard className="h-[34rem] w-full" />
      </div>
    </div>
  );
}

export function DirectoryPageSkeleton() {
  return (
    <div className="page-grid">
      <LoadingCard className="h-56 w-full" />
      <div className="space-y-4">
        <LoadingCard className="h-12 w-full rounded-2xl sm:w-80" />
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <LoadingCard key={index} className="h-28 w-full rounded-[1.5rem]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DetailPageSkeleton() {
  return (
    <div className="page-grid">
      <LoadingCard className="h-56 w-full" />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <LoadingCard className="h-80 w-full" />
        <LoadingCard className="h-80 w-full" />
      </div>
    </div>
  );
}

export function SettingsPageSkeleton() {
  return (
    <div className="page-grid">
      <LoadingCard className="h-56 w-full" />
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.9fr]">
        <LoadingCard className="h-96 w-full" />
        <LoadingCard className="h-96 w-full" />
      </div>
    </div>
  );
}
