import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

function buildConnectSrc() {
  const connectSources = new Set(["'self'", 'https:']);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    try {
      connectSources.add(new URL(apiUrl).origin);
    } catch {
      // Ignore relative URLs.
    }
  }

  if (process.env.NODE_ENV === 'development') {
    connectSources.add('http://localhost:3000');
    connectSources.add('http://127.0.0.1:3000');
    connectSources.add('http://localhost:3001');
    connectSources.add('http://127.0.0.1:3001');
  }

  return [...connectSources].join(' ');
}

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  async headers() {
    const connectSrc = buildConnectSrc();
    const scriptSrc = isDev
      ? `'self' 'unsafe-eval' 'unsafe-inline'`
      : `'self' 'unsafe-inline'`;

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src ${connectSrc};`,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
