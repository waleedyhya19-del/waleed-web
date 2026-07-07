import { cn } from '@/lib/utils/cn';

/**
 * RadarLoader — the Signal loading state: a sweeping radar disc.
 * Replaces generic spinners so loading feels on-brand ("scanning…").
 */
export function RadarLoader({
  className,
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn('radar-sweep inline-block shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand" />
    </span>
  );
}
