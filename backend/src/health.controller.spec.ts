import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma/prisma.service';

/**
 * Compose gates the frontend on this endpoint, so a health check that reports
 * "ok" while the database is unreachable would release the frontend against an
 * API that can only serve 500s. Both directions are worth pinning.
 */
describe('HealthController', () => {
  const controllerWith = (queryRaw: jest.Mock) =>
    new HealthController({ $queryRaw: queryRaw } as unknown as PrismaService);

  it('reports ok when the database answers', async () => {
    const queryRaw = jest.fn().mockResolvedValue([{ '?column?': 1 }]);

    await expect(controllerWith(queryRaw).check()).resolves.toEqual({ status: 'ok' });
    expect(queryRaw).toHaveBeenCalled();
  });

  // A literal `{ status: 'ok' }` would pass this file and still be wrong, so
  // the query has to actually be made.
  it('reports unavailable when the database throws', async () => {
    const queryRaw = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(controllerWith(queryRaw).check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('does not leak the driver error to the caller', async () => {
    const queryRaw = jest.fn().mockRejectedValue(new Error('password authentication failed'));

    await expect(controllerWith(queryRaw).check()).rejects.toThrow('Database unavailable');
  });
});
