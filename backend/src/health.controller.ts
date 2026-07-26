import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma/prisma.service';

/**
 * Readiness probe backing the compose healthcheck, which the frontend waits on.
 *
 * It queries the database rather than returning a literal: a process that is
 * up but cannot reach Postgres serves nothing but 500s, and reporting that as
 * healthy would release the frontend against a broken API.
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Readiness check (verifies database connectivity)' })
  @ApiOkResponse({ description: 'API and database are both reachable.' })
  @ApiServiceUnavailableResponse({ description: 'The database is not reachable.' })
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException('Database unavailable');
    }
    return { status: 'ok' };
  }
}
