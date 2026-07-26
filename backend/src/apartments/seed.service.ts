import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SEED_APARTMENTS } from './seed-data';

/**
 * Populates demo listings on startup so a fresh `docker compose up` lands on a
 * working app rather than an empty page.
 *
 * Runs only when SEED_ON_BOOT=true and only when the table is empty, so it is
 * safe across restarts and never overwrites real data.
 */
@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_ON_BOOT !== 'true') {
      return;
    }

    const existing = await this.prisma.apartment.count();
    if (existing > 0) {
      this.logger.log(`Skipping seed — ${existing} apartment(s) already present.`);
      return;
    }

    const { count } = await this.prisma.apartment.createMany({ data: SEED_APARTMENTS });
    this.logger.log(`Seeded ${count} demo apartments.`);
  }
}
