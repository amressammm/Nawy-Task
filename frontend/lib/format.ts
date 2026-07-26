const priceFormatter = new Intl.NumberFormat('en-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
});

/** e.g. 12500000 -> "EGP 12,500,000" */
export const formatPrice = (price: number): string => priceFormatter.format(price);

/** e.g. 185 -> "185 m²" */
export const formatArea = (areaSqm: number): string => `${areaSqm.toLocaleString('en')} m²`;
