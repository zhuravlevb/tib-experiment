const rub = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});

/** Цены в прототипах — целые рубли. */
export const formatRub = (value: number): string => rub.format(value);

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));
