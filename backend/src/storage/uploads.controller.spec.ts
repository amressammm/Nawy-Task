import {
  BadRequestException,
  NotFoundException,
  StreamableFile,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { Readable } from 'node:stream';
import type { Response } from 'express';
import { UploadsController } from './uploads.controller';
import { StorageService } from './storage.service';

/**
 * The upload route is where a client's claims about a file meet the allowlist,
 * so these tests are about what gets refused and with which status — a 400 and
 * a 415 mean different things to whoever is calling.
 */
describe('UploadsController', () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const key = 'a3f9c1e0-4b2d-4c7a-9f1e-2d3c4b5a6f70.jpg';

  let storage: { put: jest.Mock; get: jest.Mock; stat: jest.Mock };
  let controller: UploadsController;

  const file = (buffer: Buffer, overrides = {}) =>
    ({
      buffer,
      mimetype: 'image/jpeg',
      originalname: 'photo.jpg',
      ...overrides,
    }) as Express.Multer.File;

  beforeEach(() => {
    storage = {
      put: jest.fn().mockResolvedValue(key),
      get: jest.fn().mockResolvedValue(Readable.from([Buffer.from('bytes')])),
      stat: jest.fn().mockResolvedValue({ size: 1234, contentType: 'image/jpeg' }),
    };
    controller = new UploadsController(storage as unknown as StorageService);
  });

  describe('POST /uploads', () => {
    it('stores a real image and returns its key', async () => {
      await expect(controller.upload(file(jpeg))).resolves.toEqual({ key });
      expect(storage.put).toHaveBeenCalledWith(jpeg, 'image/jpeg', 'jpg');
    });

    it('rejects a request with no file at all', async () => {
      await expect(controller.upload(undefined)).rejects.toBeInstanceOf(BadRequestException);
      expect(storage.put).not.toHaveBeenCalled();
    });

    // The declared mimetype and filename are both attacker-controlled; only
    // the bytes decide. An SVG stored here would be served from the app's own
    // origin, which makes it stored XSS.
    it('rejects an SVG dressed up as a JPEG, by content type and name', async () => {
      const svg = file(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg">'));

      await expect(controller.upload(svg)).rejects.toBeInstanceOf(UnsupportedMediaTypeException);
      expect(storage.put).not.toHaveBeenCalled();
    });

    it('rejects a text file renamed .jpg', async () => {
      await expect(controller.upload(file(Buffer.from('just text')))).rejects.toBeInstanceOf(
        UnsupportedMediaTypeException,
      );
    });

    it('distinguishes "no file" from "wrong kind of file"', async () => {
      await expect(controller.upload(undefined)).rejects.not.toBeInstanceOf(
        UnsupportedMediaTypeException,
      );
    });
  });

  describe('GET /uploads/:key', () => {
    // `set` is held separately rather than read back off the response, so the
    // assertions never detach a method from its object.
    const response = () => {
      const set = jest.fn();
      return { set, res: { set } as unknown as Response };
    };

    it('streams a stored image back', async () => {
      const result = await controller.download(key, response().res);
      expect(result).toBeInstanceOf(StreamableFile);
      expect(storage.get).toHaveBeenCalledWith(key);
    });

    it('sets the length and type it got from storage', async () => {
      const { set, res } = response();
      await controller.download(key, res);

      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({ 'Content-Type': 'image/jpeg', 'Content-Length': '1234' }),
      );
    });

    it('marks the response immutable, since keys are never reused', async () => {
      const { set, res } = response();
      await controller.download(key, res);

      expect(set).toHaveBeenCalledWith(
        expect.objectContaining({ 'Cache-Control': 'public, max-age=31536000, immutable' }),
      );
    });

    it('404s an unknown key', async () => {
      storage.stat.mockResolvedValue(null);
      await expect(controller.download(key, response().res)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    // A malformed key must be refused before it reaches storage, not after.
    it.each(['../../etc/passwd', 'not-a-key.jpg', `${key}/../evil`, '', 'a.jpg'])(
      'refuses the malformed key %j without touching storage',
      async (malformed) => {
        await expect(controller.download(malformed, response().res)).rejects.toBeInstanceOf(
          NotFoundException,
        );
        expect(storage.stat).not.toHaveBeenCalled();
        expect(storage.get).not.toHaveBeenCalled();
      },
    );
  });
});
