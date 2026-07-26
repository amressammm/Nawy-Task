import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Readable } from 'node:stream';
import { Client } from 'minio';

/** Image types accepted for upload, and the bytes each one actually starts with. */
const ALLOWED_TYPES = [
  { mime: 'image/jpeg', extension: 'jpg', matches: (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 },
  {
    mime: 'image/png',
    extension: 'png',
    matches: (b: Buffer) => b.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
  },
  {
    mime: 'image/webp',
    extension: 'webp',
    matches: (b: Buffer) =>
      b.subarray(0, 4).toString('ascii') === 'RIFF' &&
      b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
] as const;

/** Object keys are a UUID plus one of the allowed extensions, and nothing else. */
export const IMAGE_KEY_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp)$/;

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

  /**
   * Identifies an image by its leading bytes rather than its declared
   * Content-Type, which is only ever a claim by the client. These files are
   * served back from the app's own origin, so an SVG that slipped through
   * would be stored XSS — hence an allowlist of three raster formats and no
   * reliance on the filename or the header.
   */
  detectType(buffer: Buffer): (typeof ALLOWED_TYPES)[number] | undefined {
    return ALLOWED_TYPES.find((type) => type.matches(buffer));
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
      return {
        size: info.size,
        contentType: info.metaData?.['content-type'] ?? 'application/octet-stream',
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
