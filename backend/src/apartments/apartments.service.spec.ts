import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ApartmentsService } from './apartments.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { QueryApartmentsDto } from './dto/query-apartments.dto';

/**
 * The listing query, tested through the `where` object it hands to Prisma
 * rather than against a database.
 *
 * That is the level where the mistakes actually live — an unescaped `%` turns
 * a search into "match everything", and a wrong `skip` silently shows the
 * wrong page. Both look fine in a browser against twelve seeded rows.
 */
describe('ApartmentsService.findAll', () => {
  let service: ApartmentsService;
  // Typed by their argument, so the assertions below read the real shape
  // instead of poking at `any`.
  let findMany: jest.Mock<Promise<unknown[]>, [Prisma.ApartmentFindManyArgs]>;
  let count: jest.Mock<Promise<number>, [Prisma.ApartmentCountArgs]>;

  /** Mirrors the defaults the DTO applies, so a test states only what it varies. */
  const query = (overrides: Partial<QueryApartmentsDto> = {}): QueryApartmentsDto => ({
    page: 1,
    limit: 9,
    ...overrides,
  });

  /** The `where` that reached `findMany`. */
  const whereSentToFindMany = (): Prisma.ApartmentWhereInput => findMany.mock.calls[0][0].where!;

  beforeEach(() => {
    findMany = jest.fn<Promise<unknown[]>, [Prisma.ApartmentFindManyArgs]>().mockResolvedValue([]);
    count = jest.fn<Promise<number>, [Prisma.ApartmentCountArgs]>().mockResolvedValue(0);

    service = new ApartmentsService({ apartment: { findMany, count } } as unknown as PrismaService);
  });

  describe('search term', () => {
    it('does not narrow at all when no term is given', async () => {
      await service.findAll(query());
      expect(whereSentToFindMany()).toEqual({});
    });

    it('treats an empty term as no term', async () => {
      await service.findAll(query({ search: '' }));
      expect(whereSentToFindMany()).toEqual({});
    });

    it('matches the term against all three searchable columns, case-insensitively', async () => {
      await service.findAll(query({ search: 'mivida' }));

      const match = { contains: 'mivida', mode: Prisma.QueryMode.insensitive };
      expect(whereSentToFindMany()).toEqual({
        OR: [{ unitName: match }, { unitNumber: match }, { project: match }],
      });
    });

    // `contains` compiles to ILIKE '%term%' with the term passed through
    // verbatim, so these three characters have to be neutralised or the user
    // is writing the pattern.
    it.each([
      ['%', '\\%', 'a wildcard that would otherwise match every row'],
      ['_', '\\_', 'a single-character wildcard'],
      ['\\', '\\\\', 'the escape character itself'],
    ])('escapes %j in the term (%s)', async (raw, escaped) => {
      await service.findAll(query({ search: raw }));

      const or = whereSentToFindMany().OR as Prisma.ApartmentWhereInput[];
      expect((or[0].unitName as Prisma.StringFilter).contains).toBe(escaped);
    });

    it('escapes every metacharacter in a mixed term', async () => {
      await service.findAll(query({ search: '100%_off\\now' }));

      const or = whereSentToFindMany().OR as Prisma.ApartmentWhereInput[];
      expect((or[0].unitName as Prisma.StringFilter).contains).toBe('100\\%\\_off\\\\now');
    });

    it('leaves ordinary punctuation alone', async () => {
      await service.findAll(query({ search: "B4-1203 (Sky's)" }));

      const or = whereSentToFindMany().OR as Prisma.ApartmentWhereInput[];
      expect((or[0].unitName as Prisma.StringFilter).contains).toBe("B4-1203 (Sky's)");
    });

    it('gives the count the same filter as the page', async () => {
      await service.findAll(query({ search: 'mivida' }));

      expect(count.mock.calls[0][0].where).toEqual(whereSentToFindMany());
    });
  });

  describe('pagination', () => {
    it.each([
      [1, 9, 0],
      [2, 9, 9],
      [3, 9, 18],
      [4, 25, 75],
    ])('page %i at limit %i skips %i rows', async (page, limit, skip) => {
      await service.findAll(query({ page, limit }));

      expect(findMany).toHaveBeenCalledWith(expect.objectContaining({ skip, take: limit }));
    });

    it('sorts by id as well as createdAt, so paging cannot repeat a row', async () => {
      await service.findAll(query());

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        }),
      );
    });

    it.each([
      [0, 9, 1],
      [1, 9, 1],
      [12, 9, 2],
      [18, 9, 2],
      [19, 9, 3],
    ])('reports %i results at limit %i as %i page(s)', async (total, limit, totalPages) => {
      count.mockResolvedValue(total);

      const result = await service.findAll(query({ limit }));
      expect(result.totalPages).toBe(totalPages);
    });

    it('echoes the page and limit it was asked for', async () => {
      const result = await service.findAll(query({ page: 2, limit: 5 }));
      expect(result).toMatchObject({ page: 2, limit: 5 });
    });
  });
});

describe('ApartmentsService.findOne', () => {
  const serviceWith = (apartment: unknown) =>
    new ApartmentsService({
      apartment: { findUnique: jest.fn().mockResolvedValue(apartment) },
    } as unknown as PrismaService);

  it('returns the apartment when it exists', async () => {
    const row = { id: 1, unitName: 'Skyline Duplex' };
    await expect(serviceWith(row).findOne(1)).resolves.toBe(row);
  });

  it('throws 404 rather than returning null', async () => {
    await expect(serviceWith(null).findOne(999)).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe('ApartmentsService.create', () => {
  it('stores the validated dto as-is and returns the created row', async () => {
    const created = { id: 7, unitName: 'Skyline Duplex' };
    const create = jest.fn().mockResolvedValue(created);
    const service = new ApartmentsService({
      apartment: { create },
    } as unknown as PrismaService);

    const dto = { unitName: 'Skyline Duplex', price: 7_500_000 } as CreateApartmentDto;

    await expect(service.create(dto)).resolves.toBe(created);
    // Passed straight through: the DTO has already rejected anything the
    // column cannot hold, so re-shaping it here could only lose a field.
    expect(create).toHaveBeenCalledWith({ data: dto });
  });
});
