import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body style={{ display: 'grid', minHeight: '100vh', placeItems: 'center', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <h1>Not found</h1>
          <p>
            <Link href="/">Go home</Link>
          </p>
        </div>
      </body>
    </html>
  );
}
