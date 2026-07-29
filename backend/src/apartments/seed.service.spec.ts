import { readFile } from 'node:fs/promises';
import { SeedService } from './seed.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

jest.mock('node:fs/promises', () => ({ readFile: jest.fn() }));

const readFileMock = readFile as jest.MockedFunction<typeof readFile>;

/**
 * Seeding runs on every boot, so the guards matter more than the happy path:
 * seeding twice would duplicate the demo data, and seeding a database that
 * already holds real listings would be worse than that.
 */
describe('SeedService', () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);

  let count: jest.Mock<Promise<number>, []>;
  // Typed by its argument so `seededRows` reads a real shape rather than `any`.
  let createMany: jest.Mock<Promise<{ count: number }>, [{ data: Record<string, unknown>[] }]>;
  let put: jest.Mock;
  let service: SeedService;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.SEED_ON_BOOT = 'true';

    count = jest.fn<Promise<number>, []>().mockResolvedValue(0);
    createMany = jest
      .fn<Promise<{ count: number }>, [{ data: Record<string, unknown>[] }]>()
      .mockResolvedValue({ count: 12 });
    put = jest.fn().mockResolvedValue('a3f9c1e0-4b2d-4c7a-9f1e-2d3c4b5a6f70.jpg');
    readFileMock.mockResolvedValue(jpeg);

    service = new SeedService(
      { apartment: { count, createMany } } as unknown as PrismaService,
      { put } as unknown as StorageService,
    );
  });

  afterEach(() => {
    delete process.env.SEED_ON_BOOT;
  });

  /** The rows handed to `createMany`, which takes `{ data }` rather than a bare array. */
  const seededRows = <T = Record<string, unknown>>(): T[] =>
    createMany.mock.calls[0][0].data as T[];

  it('seeds an empty database', async () => {
    await service.onApplicationBootstrap();
    expect(createMany).toHaveBeenCalled();
  });

  it('does nothing when the table already holds rows', async () => {
    count.mockResolvedValue(12);

    await service.onApplicationBootstrap();
    expect(createMany).not.toHaveBeenCalled();
  });

  it('does nothing unless SEED_ON_BOOT is exactly "true"', async () => {
    process.env.SEED_ON_BOOT = 'false';

    await service.onApplicationBootstrap();
    expect(count).not.toHaveBeenCalled();
    expect(createMany).not.toHaveBeenCalled();
  });

  it('does nothing when SEED_ON_BOOT is unset', async () => {
    delete process.env.SEED_ON_BOOT;

    await service.onApplicationBootstrap();
    expect(createMany).not.toHaveBeenCalled();
  });

  // Demo photos must travel the same path as one added through the form, or
  // the seeded rows are the only ones whose images were never validated.
  it('uploads each photo and stores the returned key, not a filename', async () => {
    await service.onApplicationBootstrap();

    const rows = seededRows<{ imageKey: string | null }>();
    expect(put).toHaveBeenCalledTimes(rows.length);
    expect(rows.every((row) => row.imageKey === 'a3f9c1e0-4b2d-4c7a-9f1e-2d3c4b5a6f70.jpg')).toBe(
      true,
    );
  });

  it('does not carry the source filename into the database', async () => {
    await service.onApplicationBootstrap();

    const rows = seededRows();
    expect(rows.every((row) => !('imageFile' in row))).toBe(true);
  });

  // A missing asset is not worth failing startup over — the app should come up
  // with a placeholder rather than crash-looping.
  it('seeds without a photo when the file cannot be read', async () => {
    readFileMock.mockRejectedValue(new Error('ENOENT'));

    await service.onApplicationBootstrap();

    const rows = seededRows<{ imageKey: string | null }>();
    expect(rows.every((row) => row.imageKey === null)).toBe(true);
  });

  it('seeds without a photo when the file is not a supported image', async () => {
    readFileMock.mockResolvedValue(Buffer.from('<svg/>'));

    await service.onApplicationBootstrap();

    const rows = seededRows<{ imageKey: string | null }>();
    expect(rows.every((row) => row.imageKey === null)).toBe(true);
    expect(put).not.toHaveBeenCalled();
  });
});
