'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createApartment } from '@/lib/api';

/**
 * `values` echoes what was submitted so the form can repopulate itself.
 * React resets an uncontrolled form once its action resolves, which would
 * otherwise wipe every field the moment one of them fails validation.
 */
export type FormState = { errors: string[]; values: Record<string, string> };

/** Empty optional fields are omitted rather than sent as "" or NaN. */
const text = (data: FormData, field: string): string => String(data.get(field) ?? '').trim();

const number = (data: FormData, field: string): number | undefined => {
  const raw = text(data, field);
  return raw === '' ? undefined : Number(raw);
};

/**
 * Submits the form to the API from the server, so the browser never needs to
 * reach the backend directly. The API stays the single source of validation —
 * its per-field messages are handed straight back to the form.
 */
export async function createApartmentAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = await createApartment({
    unitName: text(formData, 'unitName'),
    unitNumber: text(formData, 'unitNumber'),
    project: text(formData, 'project'),
    description: text(formData, 'description'),
    address: text(formData, 'address'),
    price: number(formData, 'price'),
    bedrooms: number(formData, 'bedrooms'),
    bathrooms: number(formData, 'bathrooms'),
    areaSqm: number(formData, 'areaSqm'),
    imageUrl: text(formData, 'imageUrl') || undefined,
  });

  if (!result.ok) {
    const values = Object.fromEntries(
      Array.from(formData.entries(), ([field, value]) => [field, String(value)]),
    );
    return { errors: result.errors, values };
  }

  // The new apartment must appear on a listing that is otherwise uncached.
  revalidatePath('/');
  // redirect() signals by throwing, so it has to stay outside any try/catch.
  redirect(`/apartments/${result.apartment.id}`);
}
