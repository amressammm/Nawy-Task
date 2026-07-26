/** The API rejects terms longer than this, so the UI must not send them. */
export const MAX_SEARCH_LENGTH = 100;

/** The API's upper bound on `page`. */
export const MAX_PAGE = 10_000;

/**
 * Builds a listing URL. Single source of truth for the query string, shared by
 * the search box, the pagination links, and the "off the end" redirect, so
 * they can't disagree about how a search is encoded.
 */
export function listingHref({ page = 1, search }: { page?: number; search?: string }): string {
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (page > 1) query.set('page', String(page));

  const queryString = query.toString();
  return queryString ? `/?${queryString}` : '/';
}

/** A repeated query key (`?search=a&search=b`) arrives as an array. */
const firstValue = (value?: string | string[]): string | undefined =>
  Array.isArray(value) ? value[0] : value;

/**
 * Normalises raw search params into values the API is guaranteed to accept.
 *
 * Anything the API would reject with a 400 — an over-long term, a fractional
 * or out-of-range page, a repeated key — has to be clamped here. Otherwise the
 * rejection surfaces as a thrown fetch, and the whole listing (search box
 * included) is replaced by the error boundary, leaving no way to recover.
 */
export function parseListingParams(params: Record<string, string | string[] | undefined>): {
  term: string;
  page: number;
} {
  const term = (firstValue(params.search) ?? '').trim().slice(0, MAX_SEARCH_LENGTH);

  const requested = Number(firstValue(params.page));
  const page = Number.isFinite(requested)
    ? Math.min(Math.max(Math.floor(requested), 1), MAX_PAGE)
    : 1;

  return { term, page };
}
