import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

/**
 * LogoMark — the Signal identity: a phone emitting a locate ping.
 * Phone body inherits `currentColor`; the radar arcs use the brand hue.
 * `pinging` adds the animated radar rings (hero / splash only).
 */
export function LogoMark({
  className,
  pinging = false,
}: {
  className?: string;
  pinging?: boolean;
}) {
  return (
    <span className={cn('relative inline-flex', className)}>
      {pinging && (
        <span
          aria-hidden
          className="radar-ping pointer-events-none absolute inset-[15%]"
        />
      )}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        className="relative h-full w-full"
        aria-hidden
      >
        {/* Locate ping arcs (brand) */}
        <g className="text-brand" stroke="currentColor" strokeLinecap="round">
          <path
            d="M22.5 8.5a7.5 7.5 0 0 1 0 15"
            strokeWidth="1.6"
            opacity="0.9"
          />
          <path
            d="M24.8 5.2a11 11 0 0 1 0 21.6"
            strokeWidth="1.4"
            opacity="0.45"
          />
        </g>
        {/* Phone body (currentColor) */}
        <rect
          x="6"
          y="4"
          width="12.5"
          height="24"
          rx="3.2"
          className="text-foreground"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        {/* Signal origin dot */}
        <circle cx="12.25" cy="21.5" r="1.7" className="fill-brand" />
        <path
          d="M10.4 8.5h3.7"
          className="text-muted-foreground"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

/**
 * Logo — mark + bilingual wordmark. `appName` is the single source of truth
 * in messages, so this stays correct across EN/AR without edits.
 */
export function Logo({
  className,
  markClassName,
  showWordmark = true,
  pinging = false,
}: {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  pinging?: boolean;
}) {
  const t = useTranslations();
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark className={cn('h-8 w-8', markClassName)} pinging={pinging} />
      {showWordmark && (
        <span className="font-display text-[0.95rem] font-semibold leading-none tracking-tight">
          {t('common.appName')}
        </span>
      )}
    </span>
  );
}
