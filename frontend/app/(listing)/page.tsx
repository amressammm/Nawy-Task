import Link from 'next/link';
import { ApartmentCard } from '@/components/ApartmentCard';
import { Pagination } from '@/components/Pagination';
import { SearchBar } from '@/components/SearchBar';
import { ServiceError, StatePanel } from '@/components/StatePanel';
import { listApartments } from '@/lib/api';
import { parseListingParams } from '@/lib/listing-url';

/** Search and page both live in the URL, so this page is driven entirely by it. */
export default async function ListingPage({
  searchParams,
}: {
  // Deliberately not `{ search?: string }`: a repeated key arrives as an array,
  // and typing it away is what turns `?search=a&search=b` into a crash.
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { term, page } = parseListingParams(await searchParams);

  let result;
  try {
    result = await listApartments({ search: term, page });

    // A page past the end — a stale bookmark, or a search that shrank the result
    // set — would otherwise show "no apartments" beside a non-zero total. Fall
    // back to the last real page.
    //
    // Clamped with a second fetch rather than redirect(): the loading skeleton
    // starts streaming the response before a server component can set a 307, so
    // redirect() here would only work for clients running JavaScript.
    if (result.total > 0 && page > result.totalPages) {
      result = await listApartments({ search: term, page: result.totalPages });
    }
  } catch {
    return <ServiceError />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Apartments</h1>
        <p className="text-sm text-muted">
          {result.total === 0
            ? 'No apartments to show'
            : `${result.total} apartment${result.total === 1 ? '' : 's'} available`}
          {term && ` for “${term}”`}
        </p>
      </div>

      <SearchBar initialTerm={term} />

      {result.data.length === 0 ? (
        <StatePanel
          title={term ? `No apartments match “${term}”` : 'There are no apartments yet'}
          message={
            term
              ? 'Try a different unit name, unit number, or project.'
              : 'Add the first one to get started.'
          }
        >
          <Link href={term ? '/' : '/apartments/new'} className="btn-primary">
            {term ? 'Clear search' : 'Add apartment'}
          </Link>
        </StatePanel>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((apartment) => (
            <li key={apartment.id} className="flex">
              <ApartmentCard apartment={apartment} />
            </li>
          ))}
        </ul>
      )}

      <Pagination page={result.page} totalPages={result.totalPages} search={term || undefined} />
    </div>
  );
}
