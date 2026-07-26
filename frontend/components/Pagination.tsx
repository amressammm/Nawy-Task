import Link from 'next/link';
import { listingHref } from '@/lib/listing-url';

/**
 * Plain links, so pagination needs no client-side JavaScript and each page is
 * a real, shareable URL.
 */
export function Pagination({
  page,
  totalPages,
  search,
}: {
  page: number;
  totalPages: number;
  search?: string;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const linkStyle =
    'rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-brand hover:text-brand';
  const disabledStyle =
    'rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted opacity-50';

  return (
    <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
      {page > 1 ? (
        <Link href={listingHref({ page: page - 1, search })} className={linkStyle} rel="prev">
          ← Previous
        </Link>
      ) : (
        <span className={disabledStyle} aria-disabled="true">
          ← Previous
        </span>
      )}

      <span className="text-sm text-muted">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link href={listingHref({ page: page + 1, search })} className={linkStyle} rel="next">
          Next →
        </Link>
      ) : (
        <span className={disabledStyle} aria-disabled="true">
          Next →
        </span>
      )}
    </nav>
  );
}
