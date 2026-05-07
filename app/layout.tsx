import type { Metadata } from 'next';
import { Cairo, Space_Grotesk } from 'next/font/google';

import './globals.css';

import { cn } from '@/lib/utils';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
});

export const metadata: Metadata = {
  title: 'Mobili Mafqud Control Center',
  description: 'Operations dashboard for lost and stolen phone investigations.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={cn(spaceGrotesk.variable, cairo.variable)}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
