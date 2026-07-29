import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { Client } from 'minio';
import { ALLOWED_TYPES } from './image-type';

/**
 * Object keys are a UUID plus one of the allowed extensions, and nothing else —
 * the format `put()` below mints, which is why the two live together.
 *
 * The alternation is built from the allowlist rather than written out, so a
 * format added there cannot be left out here — which would make every upload of
 * the new type unreadable.
 */
export const IMAGE_KEY_PATTERN = new RegExp(
  `^[0-9a-f-]{36}\\.(${ALLOWED_TYPES.map((type) => type.extension).join('|')})$`,
);

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private readonly bucket = process.env.MINIO_BUCKET ?? 'apartment-images';

  private readonly client = new Client({
    endPoint: process.env.MINIO_ENDPOINT ?? 'minio',
    port: Number(process.env.MINIO_PORT ?? 9000),
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY ?? 'nawyminio',
    secretKey: process.env.MINIO_SECRET_KEY ?? 'nawyminio',
  });

  /** Creates the bucket on first boot, the same way the database is migrated on first boot. */
  async onModuleInit(): Promise<void> {
    if (await this.client.bucketExists(this.bucket)) {
      return;
    }

    await this.client.makeBucket(this.bucket);
    this.logger.log(`Created bucket "${this.bucket}".`);
  }

  async put(buffer: Buffer, contentType: string, extension: string): Promise<string> {
    // A generated key, never the uploaded filename: filenames collide, and
    // they are attacker-controlled input in a path.
    const key = `${randomUUID()}.${extension}`;

    await this.client.putObject(this.bucket, key, buffer, buffer.length, {
      'Content-Type': contentType,
    });

    return key;
  }

  get(key: string): Promise<Readable> {
    return this.client.getObject(this.bucket, key);
  }

  async stat(key: string): Promise<{ size: number; contentType: string } | null> {
    try {
      const info = await this.client.statObject(this.bucket, key);

      // MinIO types object metadata as `any`, and this value is echoed back as
      // a response header — so check the type rather than only nullishness.
      const declared: unknown = info.metaData?.['content-type'];

      return {
        size: info.size,
        contentType: typeof declared === 'string' ? declared : 'application/octet-stream',
      };
    } catch {
      return null;
    }
  }

  async isEmpty(): Promise<boolean> {
    for await (const _ of this.client.listObjectsV2(this.bucket)) {
      return false;
    }
    return true;
  }
}
