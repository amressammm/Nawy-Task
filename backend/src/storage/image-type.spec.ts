import { detectImageType } from './image-type';

/**
 * The upload allowlist is a security control, not a convenience: these files
 * are served back from the app's own origin, so an SVG that slipped through
 * would be stored XSS. The cases below are the ways a client can lie.
 */
describe('detectImageType', () => {
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
  const png = Buffer.concat([
    Buffer.from('89504e470d0a1a0a', 'hex'),
    Buffer.from([0x00, 0x00, 0x00, 0x0d]),
  ]);
  const webp = Buffer.concat([
    Buffer.from('RIFF', 'ascii'),
    Buffer.from([0x24, 0x00, 0x00, 0x00]),
    Buffer.from('WEBP', 'ascii'),
  ]);

  it.each([
    ['jpeg', jpeg, 'image/jpeg', 'jpg'],
    ['png', png, 'image/png', 'png'],
    ['webp', webp, 'image/webp', 'webp'],
  ])('identifies %s by its signature', (_name, buffer, mime, extension) => {
    expect(detectImageType(buffer)).toMatchObject({ mime, extension });
  });

  it('rejects an SVG, whatever it is named', () => {
    expect(
      detectImageType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg">')),
    ).toBeUndefined();
  });

  it('rejects plain text', () => {
    expect(detectImageType(Buffer.from('not an image at all'))).toBeUndefined();
  });

  it('rejects an empty buffer rather than throwing', () => {
    expect(detectImageType(Buffer.alloc(0))).toBeUndefined();
  });

  it('rejects a buffer too short to hold any signature', () => {
    expect(detectImageType(Buffer.from([0xff]))).toBeUndefined();
  });

  // RIFF is also the container for WAV and AVI, so the first four bytes alone
  // are not enough — the format tag at offset 8 is what makes it an image.
  it('rejects a RIFF container that is not WEBP', () => {
    const wav = Buffer.concat([
      Buffer.from('RIFF', 'ascii'),
      Buffer.from([0x24, 0x00, 0x00, 0x00]),
      Buffer.from('WAVE', 'ascii'),
    ]);
    expect(detectImageType(wav)).toBeUndefined();
  });

  it('rejects a PNG signature with a single byte corrupted', () => {
    const corrupted = Buffer.from(png);
    corrupted[3] = 0x00;
    expect(detectImageType(corrupted)).toBeUndefined();
  });
});
