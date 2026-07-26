'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createApartment, uploadImage } from '@/lib/api';

/**
 * `values` echoes what was submitted so the form can repopulate itself.
 * React resets an uncontrolled form once its action resolves, which would
 * otherwise wipe every field the moment one of them fails validation.
 */
export type FormState = { errors: string[]; values: Record<string, string> };

/**
 * The text fields, echoed back so a rejected form keeps what was typed.
 * Files are skipped: a browser will not let a file input be pre-filled, so the
 * user does have to pick the photo again.
 */
const keptValues = (data: FormData): Record<string, string> =>
  Object.fromEntries(
    Array.from(data.entries())
      .filter(([, value]) => typeof value === 'string')
      .map(([field, value]) => [field, String(value)]),
  );

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
  // The photo is stored first, because creating the apartment needs the key it
  // returns. An upload with no apartment behind it is a stray object; an
  // apartment pointing at a key that was never stored would be a broken image.
  const file = formData.get('image');
  let imageKey: string | undefined;

  if (file instanceof File && file.size > 0) {
    const upload = await uploadImage(file);
    if (!upload.ok) {
      return { errors: [upload.error], values: keptValues(formData) };
    }
    imageKey = upload.key;
  }

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
    imageKey,
  });

  if (!result.ok) {
    return { errors: result.errors, values: keptValues(formData) };
  }

  // The new apartment must appear on a listing that is otherwise uncached.
  revalidatePath('/');
  // redirect() signals by throwing, so it has to stay outside any try/catch.
  redirect(`/apartments/${result.apartment.id}`);
}
