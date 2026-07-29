import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { CreateApartmentDto } from './create-apartment.dto';
import { QueryApartmentsDto } from './query-apartments.dto';

/**
 * The DTOs are the API's entire input contract, so they are exercised through
 * the same two steps the global ValidationPipe performs — `plainToInstance`
 * with the declared types, then validation with `whitelist` and
 * `forbidNonWhitelisted` — and with the same options set in `main.ts`.
 *
 * Testing the classes directly rather than over HTTP keeps this a unit test,
 * but only because the options below are kept identical to the pipe's.
 */
function run<T extends object>(cls: new () => T, payload: object) {
  const dto = plainToInstance(cls, payload, { enableImplicitConversion: false });
  const errors = validateSync(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });

  return {
    dto,
    valid: errors.length === 0,
    /** Property names that failed, which is what the 400 response lists. */
    failed: errors.map((error) => error.property),
  };
}

const validBody = {
  unitName: 'Skyline Duplex',
  unitNumber: 'B4-1203',
  project: 'Mivida',
  description: 'Corner duplex with a garden view.',
  price: 7_500_000,
  bedrooms: 3,
  bathrooms: 2,
  areaSqm: 185,
  address: 'Mivida, New Cairo, Cairo',
};

describe('CreateApartmentDto', () => {
  it('accepts a well-formed body', () => {
    expect(run(CreateApartmentDto, validBody).valid).toBe(true);
  });

  it('accepts a body with a valid imageKey', () => {
    const body = { ...validBody, imageKey: 'a3f9c1e0-4b2d-4c7a-9f1e-2d3c4b5a6f70.jpg' };
    expect(run(CreateApartmentDto, body).valid).toBe(true);
  });

  it('treats imageKey as the only optional field', () => {
    const { imageKey: _omitted, ...required } = {
      ...validBody,
      imageKey: 'a3f9c1e0-4b2d-4c7a-9f1e-2d3c4b5a6f70.jpg',
    };
    expect(run(CreateApartmentDto, required).valid).toBe(true);
  });

  it.each(Object.keys(validBody))('rejects a body missing %s', (field) => {
    const { [field]: _removed, ...incomplete } = validBody as Record<string, unknown>;
    expect(run(CreateApartmentDto, incomplete).failed).toContain(field);
  });

  // The create DTO deliberately does not coerce, so a JSON body has to carry
  // real types. A numeric string here would otherwise pass and be stored.
  it('rejects a price sent as a string', () => {
    expect(run(CreateApartmentDto, { ...validBody, price: '7500000' }).failed).toContain('price');
  });

  it('rejects a fractional price', () => {
    expect(run(CreateApartmentDto, { ...validBody, price: 7_500_000.5 }).failed).toContain('price');
  });

  it.each([
    ['price', -1],
    ['price', 2_000_000_001],
    ['bedrooms', -1],
    ['bedrooms', 21],
    ['bathrooms', 21],
    ['areaSqm', 0],
    ['areaSqm', 10_001],
  ])('rejects %s outside its bounds (%i)', (field, value) => {
    expect(run(CreateApartmentDto, { ...validBody, [field]: value }).failed).toContain(field);
  });

  it('rejects an unknown field rather than dropping it silently', () => {
    const result = run(CreateApartmentDto, { ...validBody, isAdmin: true });
    expect(result.valid).toBe(false);
    expect(result.failed).toContain('isAdmin');
  });

  it.each([
    'not-a-key.jpg',
    'a3f9c1e0-4b2d-4c7a-9f1e-2d3c4b5a6f70.svg',
    '../../etc/passwd',
    'a3f9c1e0-4b2d-4c7a-9f1e-2d3c4b5a6f70.jpg/../evil',
    '',
  ])('rejects imageKey %j', (imageKey) => {
    expect(run(CreateApartmentDto, { ...validBody, imageKey }).failed).toContain('imageKey');
  });

  describe('string cleaning', () => {
    it('trims surrounding whitespace', () => {
      const { dto } = run(CreateApartmentDto, { ...validBody, unitName: '  Skyline Duplex  ' });
      expect(dto.unitName).toBe('Skyline Duplex');
    });

    // Without trimming, @IsNotEmpty() accepts "   " and a blank listing is
    // stored that search can never find.
    it('rejects a field that is only whitespace', () => {
      expect(run(CreateApartmentDto, { ...validBody, unitName: '   ' }).failed).toContain(
        'unitName',
      );
    });

    // Postgres rejects NUL in text outright, which would surface as a 500.
    it('strips NUL bytes', () => {
      const { dto } = run(CreateApartmentDto, { ...validBody, project: 'Miv\0ida' });
      expect(dto.project).toBe('Mivida');
    });

    it('leaves non-strings for the type validators to reject', () => {
      expect(run(CreateApartmentDto, { ...validBody, unitName: 42 }).failed).toContain('unitName');
    });

    it('enforces the declared maximum length', () => {
      expect(run(CreateApartmentDto, { ...validBody, unitName: 'x'.repeat(121) }).failed).toContain(
        'unitName',
      );
    });
  });
});

describe('QueryApartmentsDto', () => {
  it('applies the documented defaults when nothing is passed', () => {
    const { dto, valid } = run(QueryApartmentsDto, {});
    expect(valid).toBe(true);
    expect(dto).toMatchObject({ page: 1, limit: 9 });
  });

  // Everything in a query string is a string, so these must be converted.
  it('converts numeric strings, as they arrive from the query string', () => {
    const { dto, valid } = run(QueryApartmentsDto, { page: '3', limit: '25' });
    expect(valid).toBe(true);
    expect(dto).toMatchObject({ page: 3, limit: 25 });
  });

  it.each([
    ['page', '0'],
    ['page', '-1'],
    ['page', '10001'],
    ['page', '1.5'],
    ['page', 'abc'],
    ['limit', '0'],
    ['limit', '51'],
    ['limit', 'abc'],
  ])('rejects %s=%s', (field, value) => {
    expect(run(QueryApartmentsDto, { [field]: value }).failed).toContain(field);
  });

  it('accepts a search term and cleans it', () => {
    const { dto, valid } = run(QueryApartmentsDto, { search: '  mivida  ' });
    expect(valid).toBe(true);
    expect(dto.search).toBe('mivida');
  });

  it('rejects a term longer than the documented maximum', () => {
    expect(run(QueryApartmentsDto, { search: 'x'.repeat(101) }).failed).toContain('search');
  });

  it('rejects an unknown query parameter', () => {
    expect(run(QueryApartmentsDto, { sortBy: 'price' }).failed).toContain('sortBy');
  });
});
