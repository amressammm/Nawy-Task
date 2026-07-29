import { Transform } from 'class-transformer';

/**
 * Trims surrounding whitespace and strips NUL bytes from an incoming string.
 *
 * Both matter:
 *  - without trimming, `@IsNotEmpty()` happily accepts `"   "`, so a blank
 *    listing can be stored and then never found by search;
 *  - Postgres rejects NUL bytes in text outright, so an unfiltered one turns
 *    a search into a 500 rather than a normal empty result.
 */
export const CleanString = (): PropertyDecorator =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\0/g, '').trim() : value,
  );
