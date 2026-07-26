/** Skeleton shown while the listing is fetched on the server. */
export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-border" />
      <div className="h-11 w-full animate-pulse rounded-lg bg-border" />
      <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <li
            key={index}
            className="overflow-hidden rounded-card border border-border bg-surface"
          >
            <div className="aspect-[4/3] animate-pulse bg-border" />
            <div className="flex flex-col gap-3 p-4">
              <div className="h-4 w-2/3 animate-pulse rounded bg-border" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-border" />
              <div className="h-5 w-1/2 animate-pulse rounded bg-border" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
