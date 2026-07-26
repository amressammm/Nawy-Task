import { API_URL } from '@/lib/api';

/**
 * Streams an apartment image from the API, which reads it from object storage.
 *
 * The proxy exists so images come from the same origin as the app: MinIO is
 * not published to the host, and pointing <img> at the API directly would mean
 * publishing another hostname to the browser and configuring CORS for it.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> },
): Promise<Response> {
  const { key } = await params;

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/uploads/${encodeURIComponent(key)}`);
  } catch {
    return new Response('Image unavailable', { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return new Response('Not found', { status: upstream.status === 404 ? 404 : 502 });
  }

  return new Response(upstream.body, {
    headers: {
      'Content-Type': upstream.headers.get('content-type') ?? 'application/octet-stream',
      // Keys are unique per upload and objects are never rewritten.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
