'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  distance = 36,
}: ScrollRevealProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let context: gsap.Context | undefined;

    async function runAnimation() {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (prefersReducedMotion || !rootRef.current) {
        return;
      }

      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        gsap.fromTo(
          rootRef.current,
          {
            autoAlpha: 0,
            y: distance,
          },
          {
            autoAlpha: 1,
            y: 0,
            delay,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: rootRef.current,
              start: 'top 86%',
            },
          }
        );
      }, rootRef);
    }

    void runAnimation();

    return () => context?.revert();
  }, [delay, distance]);

  return (
    <div ref={rootRef} className={cn('opacity-0', className)}>
      {children}
    </div>
  );
}
