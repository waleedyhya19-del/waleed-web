import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

function buildConnectSrc() {
  const connectSources = new Set(["'self'", 'https:', 'wss:', 'ws:']);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (apiUrl) {
    try {
      connectSources.add(new URL(apiUrl).origin);
    } catch {
      /* ignore */
    }
  }

  if (process.env.NODE_ENV === 'development') {
    connectSources.add('http://localhost:3000');
    connectSources.add('http://127.0.0.1:3000');
    connectSources.add('http://localhost:3001');
    connectSources.add('http://127.0.0.1:3001');
    connectSources.add('ws://localhost:3000');
    connectSources.add('ws://localhost:3001');
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
            value: `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https://fonts.gstatic.com; connect-src ${connectSrc}; frame-ancestors 'none';`,
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
