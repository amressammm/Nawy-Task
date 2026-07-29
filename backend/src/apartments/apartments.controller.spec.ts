import { BadRequestException } from '@nestjs/common';
import { parseApartmentId } from './apartments.controller';

/**
 * Route ids are parsed by hand rather than by a pipe, because the global
 * ValidationPipe coerces primitive params with `Number()` before any
 * param-level pipe could object. These cases are what `Number()` would have
 * let through.
 */
describe('parseApartmentId', () => {
  it('accepts a plain decimal id', () => {
    expect(parseApartmentId('42')).toBe(42);
  });

  it('accepts the largest id the column can hold', () => {
    expect(parseApartmentId('2147483647')).toBe(2147483647);
  });

  it('accepts a padded id, since Postgres would too', () => {
    expect(parseApartmentId('007')).toBe(7);
  });

  // Every one of these is a number to `Number()`, which is exactly the problem:
  // "0x2" would silently become 2 and fetch the wrong apartment.
  it.each(['0x2', '1e3', '5.', '1.0', ' 1', '1 ', '+1', 'abc', '', 'null', 'Infinity'])(
    'rejects %j, which Number() would have accepted or mangled',
    (raw) => {
      expect(() => parseApartmentId(raw)).toThrow(BadRequestException);
    },
  );

  it('rejects 0, since ids start at 1', () => {
    expect(() => parseApartmentId('0')).toThrow(BadRequestException);
  });

  // Past int4 the value reaches Postgres and fails there as a 500 instead of
  // a clean 4xx, so the bound has to be checked here.
  it('rejects an id one past the int4 ceiling', () => {
    expect(() => parseApartmentId('2147483648')).toThrow(BadRequestException);
  });

  it('rejects a wildly out-of-range id', () => {
    expect(() => parseApartmentId('99999999999999999999')).toThrow(BadRequestException);
  });

  it('explains which bound was missed', () => {
    expect(() => parseApartmentId('0')).toThrow(/between 1 and 2147483647/);
    expect(() => parseApartmentId('abc')).toThrow(/positive integer/);
  });
});
