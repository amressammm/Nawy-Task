import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NoPhoto } from '@/components/NoPhoto';
import { ServiceError } from '@/components/StatePanel';
import { getApartment } from '@/lib/api';
import { formatArea, formatPrice } from '@/lib/format';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  // Metadata generation runs outside the error boundary, so a throw here
  // produces a bare HTTP 500 instead of the styled error page. A title is
  // never worth that: degrade to a generic one and let the page report the
  // failure properly.
  const apartment = await getApartment(id).catch(() => null);

  return apartment
    ? { title: `${apartment.unitName} — ${apartment.project}` }
    : { title: 'Apartment — Nawy Apartments' };
}

export default async function ApartmentDetailsPage({ params }: Props) {
  const { id } = await params;

  let apartment;
  try {
    apartment = await getApartment(id);
  } catch {
    return <ServiceError />;
  }

  if (!apartment) {
    notFound();
  }

  const specs = [
    { label: 'Bedrooms', value: String(apartment.bedrooms) },
    { label: 'Bathrooms', value: String(apartment.bathrooms) },
    { label: 'Area', value: formatArea(apartment.areaSqm) },
    { label: 'Unit number', value: apartment.unitNumber },
  ];

  return (
    <article className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-muted transition-colors hover:text-brand">
        ← Back to listing
      </Link>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface lg:col-span-3">
          {apartment.imageUrl ? (
            <Image
              src={apartment.imageUrl}
              alt={`${apartment.unitName} in ${apartment.project}`}
              fill
              sizes="(min-width: 1024px) 40rem, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <NoPhoto label="No photo available" />
          )}
        </div>

        <div className="flex flex-col gap-5 lg:col-span-2">
          <div>
            <p className="text-sm font-medium text-brand">{apartment.project}</p>
            <h1 className="mt-1 break-words text-2xl font-semibold tracking-tight">{apartment.unitName}</h1>
            <p className="mt-2 text-sm text-muted">{apartment.address}</p>
          </div>

          <p className="text-3xl font-semibold">{formatPrice(apartment.price)}</p>

          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border">
            {specs.map((spec) => (
              <div key={spec.label} className="bg-surface p-4">
                <dt className="text-sm text-muted">{spec.label}</dt>
                <dd className="mt-1 break-words font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className="rounded-card border border-border bg-surface p-5 sm:p-6">
        <h2 className="font-semibold">About this unit</h2>
        <p className="mt-3 whitespace-pre-line break-words leading-relaxed text-muted">{apartment.description}</p>
      </section>
    </article>
  );
}
