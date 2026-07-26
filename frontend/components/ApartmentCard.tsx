import Image from 'next/image';
import Link from 'next/link';
import { NoPhoto } from '@/components/NoPhoto';
import { formatArea, formatPrice } from '@/lib/format';
import type { Apartment } from '@/lib/types';

export function ApartmentCard({ apartment }: { apartment: Apartment }) {
  return (
    <Link
      href={`/apartments/${apartment.id}`}
      className="group flex w-full flex-col overflow-hidden rounded-card border border-border bg-surface shadow-card transition-shadow hover:shadow-card-hover"
    >
      <div className="relative aspect-[4/3] bg-canvas">
        {apartment.imageKey ? (
          <Image
            src={`/media/${apartment.imageKey}`}
            alt={`${apartment.unitName} in ${apartment.project}`}
            fill
            sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <NoPhoto />
        )}
        <span className="absolute left-3 top-3 max-w-[60%] truncate rounded-md bg-surface/95 px-2 py-1 text-xs font-medium text-ink">
          {apartment.unitNumber}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h2 className="font-semibold leading-tight break-words">{apartment.unitName}</h2>
          <p className="mt-1 text-sm text-muted break-words">{apartment.project}</p>
        </div>

        <p className="text-lg font-semibold text-brand">{formatPrice(apartment.price)}</p>

        {/* The term is the label and the description is the value, not the
            reverse — otherwise a screen reader announces "3, bedrooms". */}
        <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-sm text-muted">
          <div>
            <dt className="sr-only">Bedrooms</dt>
            <dd>
              <span className="font-medium text-ink">{apartment.bedrooms}</span> bed
            </dd>
          </div>
          <div>
            <dt className="sr-only">Bathrooms</dt>
            <dd>
              <span className="font-medium text-ink">{apartment.bathrooms}</span> bath
            </dd>
          </div>
          <div>
            <dt className="sr-only">Area</dt>
            <dd className="font-medium text-ink">{formatArea(apartment.areaSqm)}</dd>
          </div>
        </dl>
      </div>
    </Link>
  );
}
