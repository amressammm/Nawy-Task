/** Image types accepted for upload, and the bytes each one actually starts with. */
export const ALLOWED_TYPES = [
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

export type ImageType = (typeof ALLOWED_TYPES)[number];

/**
 * Identifies an image by its leading bytes rather than its declared
 * Content-Type, which is only ever a claim by the client. These files are
 * served back from the app's own origin, so an SVG that slipped through
 * would be stored XSS — hence an allowlist of three raster formats and no
 * reliance on the filename or the header.
 *
 * Returns undefined for anything else, which the caller turns into a 415.
 */
export function detectImageType(buffer: Buffer): ImageType | undefined {
  return ALLOWED_TYPES.find((type) => type.matches(buffer));
}
