import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nawy Apartments',
  description: 'Browse apartments for sale and see the details of each unit.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Nawy<span className="text-brand"> Apartments</span>
            </Link>
            <Link href="/apartments/new" className="btn-primary">
              Add apartment
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 pb-12 sm:px-6 sm:py-8 sm:pb-16">
          {children}
        </main>
      </body>
    </html>
  );
}
