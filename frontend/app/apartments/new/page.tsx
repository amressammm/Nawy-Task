import type { Metadata } from 'next';
import Link from 'next/link';
import { ApartmentForm } from './ApartmentForm';

export const metadata: Metadata = { title: 'Add an apartment — Nawy Apartments' };

export default function NewApartmentPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-muted transition-colors hover:text-brand">
        ← Back to listing
      </Link>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add an apartment</h1>
        <p className="mt-1 text-sm text-muted">
          The listing appears immediately after it is saved.
        </p>
      </div>

      <div className="rounded-card border border-border bg-surface p-5 sm:p-6">
        <ApartmentForm />
      </div>
    </div>
  );
}
