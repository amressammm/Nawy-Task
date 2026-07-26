'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { MAX_SEARCH_LENGTH, listingHref } from '@/lib/listing-url';

/**
 * Search box for the listing page.
 *
 * The term lives in the URL rather than in component state alone, so a search
 * is shareable and survives a refresh. Typing is debounced, and the page resets
 * to 1 because the old page number rarely exists in the new result set.
 *
 * `router.replace` rather than `push`: pushing would add one history entry per
 * debounced keystroke, so leaving the page would mean pressing Back a dozen
 * times.
 */
export function SearchBar({ initialTerm }: { initialTerm: string }) {
  const router = useRouter();
  const [term, setTerm] = useState(initialTerm);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const trimmed = term.trim();
    if (trimmed === initialTerm) {
      return;
    }

    const timer = setTimeout(() => {
      startTransition(() => router.replace(listingHref({ search: trimmed || undefined })));
    }, 300);

    return () => clearTimeout(timer);
  }, [term, initialTerm, router]);

  return (
    // A real GET form, so pressing Enter searches even before React has
    // hydrated (or with JavaScript disabled entirely). Once hydrated, the
    // debounced effect above takes over and filters as you type.
    <form action="/" role="search" className="relative">
      <label htmlFor="search" className="sr-only">
        Search apartments
      </label>
      <input
        id="search"
        name="search"
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        // Matches the API's limit: without it, a longer term is a 400 that
        // replaces this very input with an error page.
        maxLength={MAX_SEARCH_LENGTH}
        placeholder="Search by unit name, unit number, or project"
        className="w-full rounded-lg border border-border bg-surface py-2.5 pl-4 pr-24 text-base placeholder:text-muted focus:border-brand focus:outline-none"
      />
      {isPending && (
        <span
          role="status"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted"
        >
          Searching…
        </span>
      )}
    </form>
  );
}
