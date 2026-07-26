/**
 * The shared "nothing to show here" panel: empty results, 404, and errors all
 * use it, so the three states stay visually identical instead of drifting.
 */
/**
 * Shown when the API cannot be reached.
 *
 * Rendered inline by the pages rather than left to `app/error.tsx`, because a
 * server-side throw only reaches that boundary once the client has hydrated —
 * until then the response is a bare HTTP 500 with no layout at all.
 */
export function ServiceError() {
  return (
    <StatePanel
      level="h1"
      title="Apartments are unavailable right now"
      message="The apartments service could not be reached. It may still be starting up — please try again in a moment."
    />
  );
}

export function StatePanel({
  title,
  message,
  level = 'h2',
  children,
}: {
  title: string;
  message: string;
  /** `h1` when the panel is the whole page, `h2` when it sits under one. */
  level?: 'h1' | 'h2';
  children?: React.ReactNode;
}) {
  const Heading = level;

  return (
    <div className="rounded-card border border-border bg-surface px-6 py-16 text-center">
      <Heading className="font-semibold">{title}</Heading>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{message}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
