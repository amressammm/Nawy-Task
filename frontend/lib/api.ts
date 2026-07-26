import type { Apartment, NewApartment, PaginatedApartments } from './types';

/**
 * All API calls happen on the Next server, never in the browser.
 *
 * That is why this is `API_URL` and not `NEXT_PUBLIC_API_URL`: inside compose
 * the API answers to `http://backend:4000`, a hostname that only resolves on
 * the Docker network. Calling it from the browser would fail, so pages fetch
 * during render and the create form posts through a server action. It also
 * means no CORS configuration is involved anywhere.
 */
const API_URL = process.env.API_URL ?? 'http://localhost:4000';

/** `no-store`: listings change as apartments are added, so never serve a cached page. */
const FETCH_OPTIONS = { cache: 'no-store' } as const;

export async function listApartments(params: {
  search?: string;
  page?: number;
}): Promise<PaginatedApartments> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.page && params.page > 1) query.set('page', String(params.page));

  const response = await fetch(`${API_URL}/apartments?${query}`, FETCH_OPTIONS);
  if (!response.ok) {
    throw new Error(`Could not load apartments (HTTP ${response.status})`);
  }
  return response.json();
}

/** Returns null when the id is unknown or malformed, so the page can render a 404. */
export async function getApartment(id: string): Promise<Apartment | null> {
  const response = await fetch(`${API_URL}/apartments/${encodeURIComponent(id)}`, FETCH_OPTIONS);

  if (response.status === 404 || response.status === 400) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Could not load apartment ${id} (HTTP ${response.status})`);
  }
  return response.json();
}

export type CreateResult =
  | { ok: true; apartment: Apartment }
  | { ok: false; errors: string[] };

/**
 * Creates an apartment, surfacing the API's per-field validation messages
 * rather than collapsing them into a generic failure.
 */
export async function createApartment(input: NewApartment): Promise<CreateResult> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/apartments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
      ...FETCH_OPTIONS,
    });
  } catch {
    // A connection failure must come back as a result, not an exception: an
    // exception unmounts the form and destroys everything the user typed.
    return {
      ok: false,
      errors: ['Could not reach the apartments service. Please try again in a moment.'],
    };
  }

  if (response.ok) {
    return { ok: true, apartment: await response.json() };
  }

  // Nest's ValidationPipe replies with { message: string[] }; other failures
  // use a single string.
  const body = await response.json().catch(() => null);
  const message = body?.message ?? `Request failed (HTTP ${response.status})`;

  return { ok: false, errors: Array.isArray(message) ? message : [message] };
}
