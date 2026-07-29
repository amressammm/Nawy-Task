import { describe, expect, it } from 'vitest';
import { listingHref, parseListingParams, MAX_PAGE, MAX_SEARCH_LENGTH } from './listing-url';

/**
 * These two functions are the whole contract between the URL bar and the API.
 *
 * `parseListingParams` in particular is a guard, not a convenience: the listing
 * page renders its own search box, so a value the API would reject with a 400
 * surfaces as a thrown fetch and the error boundary replaces the entire page —
 * search box included, leaving the user no way to undo what they typed. Every
 * case below is a URL a user can actually produce by editing the address bar
 * or following a stale link.
 */
describe('listingHref', () => {
  it('is a bare path when there is nothing to encode', () => {
    expect(listingHref({})).toBe('/');
  });

  it('omits page=1, since it is the default', () => {
    expect(listingHref({ page: 1 })).toBe('/');
  });

  it('includes a page beyond the first', () => {
    expect(listingHref({ page: 3 })).toBe('/?page=3');
  });

  it('includes a search term', () => {
    expect(listingHref({ search: 'mivida' })).toBe('/?search=mivida');
  });

  it('orders search before page, so links are stable strings', () => {
    expect(listingHref({ search: 'mivida', page: 2 })).toBe('/?search=mivida&page=2');
  });

  it('drops an empty term rather than emitting search=', () => {
    expect(listingHref({ search: '' })).toBe('/');
  });

  it('percent-encodes characters that would otherwise break the query string', () => {
    expect(listingHref({ search: 'a&b=c d' })).toBe('/?search=a%26b%3Dc+d');
  });

  it('encodes a term that is itself a URL', () => {
    expect(listingHref({ search: 'http://x/?a=1' })).not.toContain('?a=1');
  });
});

describe('parseListingParams', () => {
  it('defaults to the first page and no term', () => {
    expect(parseListingParams({})).toEqual({ term: '', page: 1 });
  });

  it('reads a normal term and page', () => {
    expect(parseListingParams({ search: 'mivida', page: '2' })).toEqual({
      term: 'mivida',
      page: 2,
    });
  });

  it('trims a padded term', () => {
    expect(parseListingParams({ search: '  mivida  ' }).term).toBe('mivida');
  });

  // Express and Next hand over an array when a key repeats. Passing that on
  // would make the API 400.
  it('takes the first value when a key is repeated', () => {
    expect(parseListingParams({ search: ['a', 'b'], page: ['2', '3'] })).toEqual({
      term: 'a',
      page: 2,
    });
  });

  it('truncates a term longer than the API accepts', () => {
    const term = parseListingParams({ search: 'x'.repeat(500) }).term;
    expect(term).toHaveLength(MAX_SEARCH_LENGTH);
  });

  it.each([
    ['0', 1],
    ['-5', 1],
    ['abc', 1],
    ['', 1],
    ['1.9', 1],
    ['2.9', 2],
    ['999999', MAX_PAGE],
    ['1e6', MAX_PAGE],
  ])('clamps page=%j to %i rather than letting the API reject it', (raw, expected) => {
    expect(parseListingParams({ page: raw }).page).toBe(expected);
  });

  it('never returns a page the API would refuse', () => {
    for (const raw of ['0', '-1', 'NaN', 'Infinity', '10001', '1.5', '']) {
      const { page } = parseListingParams({ page: raw });
      expect(Number.isInteger(page)).toBe(true);
      expect(page).toBeGreaterThanOrEqual(1);
      expect(page).toBeLessThanOrEqual(MAX_PAGE);
    }
  });
});

describe('the two together', () => {
  // A link the app generates must survive being read back, or pagination
  // silently drifts.
  it.each([
    { search: 'mivida', page: 4 },
    { search: 'a&b', page: 1 },
    { search: '100% off', page: 2 },
    { page: 7 },
    {},
  ])('round-trips %j', (input) => {
    const url = new URL(listingHref(input), 'http://localhost');
    const params = Object.fromEntries(url.searchParams.entries());

    expect(parseListingParams(params)).toEqual({
      term: input.search ?? '',
      page: input.page ?? 1,
    });
  });
});
