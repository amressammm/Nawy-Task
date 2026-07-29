import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ApartmentsController, parseApartmentId } from './apartments.controller';
import { ApartmentsService } from './apartments.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { QueryApartmentsDto } from './dto/query-apartments.dto';

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

/**
 * The routes themselves: that each one hands the service what it was given and
 * returns what it got back, unchanged.
 *
 * The service is mocked, because what is being checked here is the wiring —
 * a controller that drops a query parameter, or swallows a service error and
 * answers 200, is a bug no service-level test can see.
 */
describe('ApartmentsController', () => {
  let apartments: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
  };
  let controller: ApartmentsController;

  const page = { data: [], total: 0, page: 1, limit: 9, totalPages: 1 };

  beforeEach(() => {
    apartments = {
      findAll: jest.fn().mockResolvedValue(page),
      findOne: jest.fn().mockResolvedValue({ id: 1 }),
      create: jest.fn().mockResolvedValue({ id: 2 }),
    };
    controller = new ApartmentsController(apartments as unknown as ApartmentsService);
  });

  describe('GET /apartments', () => {
    it('passes the whole validated query through to the service', async () => {
      const query = { search: 'mivida', page: 2, limit: 25 } as QueryApartmentsDto;

      await expect(controller.findAll(query)).resolves.toBe(page);
      expect(apartments.findAll).toHaveBeenCalledWith(query);
    });

    it('does not invent a filter the caller did not send', async () => {
      await controller.findAll({ page: 1, limit: 9 });
      expect(apartments.findAll).toHaveBeenCalledWith({ page: 1, limit: 9 });
    });
  });

  describe('GET /apartments/:id', () => {
    it('converts the id before the service sees it', async () => {
      await controller.findOne('42');
      expect(apartments.findOne).toHaveBeenCalledWith(42);
    });

    // The guard has to run before the service is reached, or a malformed id
    // becomes a database error instead of a 400. It throws synchronously,
    // before the promise the handler would have returned even exists.
    it('rejects a malformed id without calling the service', () => {
      expect(() => controller.findOne('abc')).toThrow(BadRequestException);
      expect(apartments.findOne).not.toHaveBeenCalled();
    });

    it('lets a not-found from the service surface as 404', async () => {
      apartments.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne('999')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('POST /apartments', () => {
    it('hands the body to the service and returns the created record', async () => {
      const dto = { unitName: 'Skyline Duplex' } as CreateApartmentDto;

      await expect(controller.create(dto)).resolves.toEqual({ id: 2 });
      expect(apartments.create).toHaveBeenCalledWith(dto);
    });
  });
});
