import { describe, expect, it } from 'vitest';
import { formatArea, formatPrice } from './format';

/**
 * Locale formatting is easy to change by accident — a stray option turns
 * "EGP 7,500,000" into "EGP 7,500,000.00" across every card on the page.
 *
 * Assertions avoid the character between the currency and the number:
 * Intl emits a non-breaking space there, and pinning it would make the test
 * fail on an ICU update without anything actually being wrong.
 */
describe('formatPrice', () => {
  it('groups thousands and shows no decimals', () => {
    expect(formatPrice(7_500_000)).toMatch(/^EGP\s7,500,000$/);
  });

  it('formats a small price', () => {
    expect(formatPrice(950)).toMatch(/^EGP\s950$/);
  });

  it('formats zero without falling back to an empty string', () => {
    expect(formatPrice(0)).toMatch(/^EGP\s0$/);
  });

  it('rounds away fractions rather than printing them', () => {
    expect(formatPrice(1_000_000.4)).toMatch(/^EGP\s1,000,000$/);
  });
});

describe('formatArea', () => {
  it('appends the unit', () => {
    expect(formatArea(185)).toBe('185 m²');
  });

  it('groups thousands', () => {
    expect(formatArea(1_250)).toBe('1,250 m²');
  });
});
