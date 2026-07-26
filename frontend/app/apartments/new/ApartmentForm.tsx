'use client';

import { useActionState } from 'react';
import { createApartmentAction, type FormState } from './actions';

const INITIAL_STATE: FormState = { errors: [], values: {} };

const inputStyle =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-base focus:border-brand focus:outline-none';

function Field({
  label,
  name,
  hint,
  children,
}: {
  label: string;
  name: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function ApartmentForm() {
  const [state, formAction, isPending] = useActionState(createApartmentAction, INITIAL_STATE);

  /**
   * React resets the form once the action resolves, restoring each input to
   * its `defaultValue` — so feeding the submitted values back in through
   * defaultValue is what keeps a rejected form filled in instead of wiping
   * everything the user typed.
   */
  const kept = (field: string) => state.values[field] ?? '';

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state.errors.length > 0 && (
        <div
          role="alert"
          className="rounded-lg border border-danger-border bg-danger-surface p-4 text-sm text-danger-ink"
        >
          <p className="font-medium">Please fix the following:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {state.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Unit name" name="unitName">
          <input
            id="unitName"
            name="unitName"
            defaultValue={kept('unitName')}
            required
            maxLength={120}
            className={inputStyle}
          />
        </Field>

        <Field label="Unit number" name="unitNumber">
          <input
            id="unitNumber"
            name="unitNumber"
            defaultValue={kept('unitNumber')}
            required
            maxLength={50}
            className={inputStyle}
          />
        </Field>

        <Field label="Project" name="project">
          <input
            id="project"
            name="project"
            defaultValue={kept('project')}
            required
            maxLength={120}
            className={inputStyle}
          />
        </Field>

        <Field label="Price" name="price" hint="Whole Egyptian pounds.">
          <input
            id="price"
            name="price"
            defaultValue={kept('price')}
            type="number"
            required
            min={0}
            max={2000000000}
            step={1}
            className={inputStyle}
          />
        </Field>

        <Field label="Bedrooms" name="bedrooms">
          <input
            id="bedrooms"
            name="bedrooms"
            defaultValue={kept('bedrooms')}
            type="number"
            required
            min={0}
            max={20}
            className={inputStyle}
          />
        </Field>

        <Field label="Bathrooms" name="bathrooms">
          <input
            id="bathrooms"
            name="bathrooms"
            defaultValue={kept('bathrooms')}
            type="number"
            required
            min={0}
            max={20}
            className={inputStyle}
          />
        </Field>

        <Field label="Area" name="areaSqm" hint="Built-up area in square metres.">
          <input
            id="areaSqm"
            name="areaSqm"
            defaultValue={kept('areaSqm')}
            type="number"
            required
            min={1}
            max={10000}
            className={inputStyle}
          />
        </Field>

        <Field label="Address" name="address">
          <input
            id="address"
            name="address"
            defaultValue={kept('address')}
            required
            maxLength={255}
            className={inputStyle}
          />
        </Field>
      </div>

      <Field label="Image URL" name="imageUrl" hint="Optional. Leave empty to use no photo.">
        <input
          id="imageUrl"
          name="imageUrl"
          defaultValue={kept('imageUrl')}
          type="url"
          maxLength={500}
          className={inputStyle}
        />
      </Field>

      <Field label="Description" name="description">
        <textarea
          id="description"
          name="description"
          defaultValue={kept('description')}
          required
          rows={5}
          maxLength={2000}
          className={inputStyle}
        />
      </Field>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary self-start"
      >
        {isPending ? 'Adding…' : 'Add apartment'}
      </button>
    </form>
  );
}
