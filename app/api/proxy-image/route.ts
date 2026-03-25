import { NextRequest } from 'next/server';

const ALLOWED_HOSTS = [
  'rotaryindiaapi.rosteronwheels.com',
  'rosteronwheels.com',
  'rotaryindia.org',
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) return new Response('Missing url', { status: 400 });

  try {
    const parsed = new URL(url);
    const allowed = ALLOWED_HOSTS.some(
      (h) => parsed.hostname === h || parsed.hostname.endsWith('.' + h)
    );
    if (!allowed) return new Response('Forbidden', { status: 403 });

    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return new Response('Not found', { status: 404 });

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response('Error', { status: 500 });
  }
}
