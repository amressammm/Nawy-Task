/** Placeholder for apartments added without an image URL. */
export function NoPhoto({ label = 'No photo' }: { label?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 bg-canvas text-muted">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-8 w-8 opacity-60"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="8.5" cy="9.5" r="1.5" />
        <path d="m3 16 4.5-4.5a2 2 0 0 1 2.8 0L15 16" />
        <path d="m14 15 1.5-1.5a2 2 0 0 1 2.8 0L21 16" />
      </svg>
      <span className="text-sm">{label}</span>
    </div>
  );
}
