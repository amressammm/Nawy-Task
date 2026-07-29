import { Readable } from 'node:stream';

const client = {
  bucketExists: jest.fn(),
  makeBucket: jest.fn(),
  putObject: jest.fn(),
  getObject: jest.fn(),
  statObject: jest.fn(),
  listObjectsV2: jest.fn(),
};

// The service constructs its own client in a field initialiser, so the module
// has to be replaced before it is imported.
jest.mock('minio', () => ({ Client: jest.fn(() => client) }));

import { IMAGE_KEY_PATTERN, StorageService } from './storage.service';

describe('StorageService', () => {
  let storage: StorageService;

  beforeEach(() => {
    jest.clearAllMocks();
    storage = new StorageService();
  });

  describe('onModuleInit', () => {
    it('creates the bucket when it is missing', async () => {
      client.bucketExists.mockResolvedValue(false);

      await storage.onModuleInit();
      expect(client.makeBucket).toHaveBeenCalled();
    });

    // Startup runs on every boot, so this must be idempotent or a restart
    // fails against an existing bucket.
    it('leaves an existing bucket alone', async () => {
      client.bucketExists.mockResolvedValue(true);

      await storage.onModuleInit();
      expect(client.makeBucket).not.toHaveBeenCalled();
    });
  });

  describe('put', () => {
    it('returns a key matching the pattern reads are validated against', async () => {
      client.putObject.mockResolvedValue(undefined);

      const key = await storage.put(Buffer.from('bytes'), 'image/jpeg', 'jpg');
      expect(key).toMatch(IMAGE_KEY_PATTERN);
    });

    // Filenames collide and are attacker-controlled input in a path.
    it('never reuses a key, even for identical uploads', async () => {
      client.putObject.mockResolvedValue(undefined);
      const buffer = Buffer.from('identical');

      const first = await storage.put(buffer, 'image/jpeg', 'jpg');
      const second = await storage.put(buffer, 'image/jpeg', 'jpg');

      expect(first).not.toBe(second);
    });

    it('stores the declared content type alongside the object', async () => {
      client.putObject.mockResolvedValue(undefined);
      const buffer = Buffer.from('bytes');

      await storage.put(buffer, 'image/png', 'png');

      expect(client.putObject).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringMatching(/\.png$/),
        buffer,
        buffer.length,
        { 'Content-Type': 'image/png' },
      );
    });
  });

  describe('stat', () => {
    it('reports the size and stored content type', async () => {
      client.statObject.mockResolvedValue({
        size: 53175,
        metaData: { 'content-type': 'image/jpeg' },
      });

      await expect(storage.stat('k.jpg')).resolves.toEqual({
        size: 53175,
        contentType: 'image/jpeg',
      });
    });

    // The value is echoed into a response header, and MinIO types metadata as
    // `any` — so anything that is not a string must not reach the client.
    it.each([[undefined], [null], [42], [{ nested: true }]])(
      'falls back to a safe content type when metadata holds %p',
      async (declared) => {
        client.statObject.mockResolvedValue({ size: 1, metaData: { 'content-type': declared } });

        await expect(storage.stat('k.jpg')).resolves.toMatchObject({
          contentType: 'application/octet-stream',
        });
      },
    );

    it('returns null rather than throwing for a missing object', async () => {
      client.statObject.mockRejectedValue(new Error('NoSuchKey'));

      await expect(storage.stat('missing.jpg')).resolves.toBeNull();
    });
  });

  describe('get', () => {
    it('hands back the stream from storage', async () => {
      const stream = Readable.from([Buffer.from('bytes')]);
      client.getObject.mockResolvedValue(stream);

      await expect(storage.get('k.jpg')).resolves.toBe(stream);
    });
  });

  describe('isEmpty', () => {
    it('is true when the bucket yields nothing', async () => {
      client.listObjectsV2.mockReturnValue(Readable.from([]));
      await expect(storage.isEmpty()).resolves.toBe(true);
    });

    it('is false as soon as one object exists', async () => {
      client.listObjectsV2.mockReturnValue(Readable.from([{ name: 'k.jpg' }]));
      await expect(storage.isEmpty()).resolves.toBe(false);
    });
  });
});
