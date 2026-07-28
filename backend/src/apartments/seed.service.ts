import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { detectImageType } from '../storage/image-type';
import { StorageService } from '../storage/storage.service';
import { SEED_APARTMENTS, SeedApartment } from './seed-data';

/** Images shipped with the repo, copied into the image next to the compiled code. */
const SEED_ASSETS_DIR = join(__dirname, '..', '..', 'seed-assets');

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

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (process.env.SEED_ON_BOOT !== 'true') {
      return;
    }

    const existing = await this.prisma.apartment.count();
    if (existing > 0) {
      this.logger.log(`Skipping seed — ${existing} apartment(s) already present.`);
      return;
    }

    const data = await Promise.all(SEED_APARTMENTS.map((seed) => this.withUploadedImage(seed)));
    const { count } = await this.prisma.apartment.createMany({ data });

    this.logger.log(`Seeded ${count} demo apartments with images.`);
  }

  /**
   * Uploads the listing's image and swaps the filename for the stored key, so
   * demo data travels the same path as an apartment added through the form.
   *
   * A missing or unreadable file is not worth failing startup over — the
   * listing is simply seeded without a photo.
   */
  private async withUploadedImage({ imageFile, ...apartment }: SeedApartment) {
    try {
      const file = await readFile(join(SEED_ASSETS_DIR, imageFile));
      const type = detectImageType(file);

      if (!type) {
        throw new Error(`${imageFile} is not a supported image`);
      }

      return { ...apartment, imageKey: await this.storage.put(file, type.mime, type.extension) };
    } catch (error) {
      this.logger.warn(`Seeding ${imageFile} without an image: ${(error as Error).message}`);
      return { ...apartment, imageKey: null };
    }
  }
}
