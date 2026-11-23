import { restaurants } from './data/restaurants';

/*
 * Логотипы шести выдуманных ресторанов. Простые геометрические знаки на плашке
 * цвета бренда: читаются и на крупной карточке, и в чипе 24 px рядом с номером выдачи.
 * Цвета берутся из данных ресторана, поэтому бренд меняется в одном месте.
 */
const W = '#FFFFFF';

const marks: Record<string, (bg: string) => string> = {
  // Булка с котлетой и дымком
  dym: () => `
    <path d="M40 14c-5 5 5 9 0 15M54 14c-5 5 5 9 0 15" fill="none" stroke="${W}" stroke-width="4" stroke-linecap="round"/>
    <path d="M20 54c0-13 12-21 28-21s28 8 28 21z" fill="${W}"/>
    <rect x="18" y="58" width="60" height="7" rx="3.5" fill="${W}"/>
    <path d="M20 69h56c0 6-4 10-10 10H30c-6 0-10-4-10-10z" fill="${W}"/>`,
  // Солнце над миской рамена и палочки
  sanse: (bg) => `
    <circle cx="44" cy="42" r="15" fill="${W}"/>
    <path d="M62 14l14 34M70 12l12 32" stroke="${W}" stroke-width="4" stroke-linecap="round"/>
    <path d="M16 50h64c0 16-14 28-32 28S16 66 16 50z" fill="${W}" stroke="${bg}" stroke-width="4"/>`,
  // Кусок пиццы с толстой коркой
  korka: (bg) => `
    <path d="M18 28Q48 12 78 28L48 82z" fill="${W}"/>
    <path d="M22 31Q48 18 74 31" fill="none" stroke="${bg}" stroke-width="4"/>
    <circle cx="41" cy="42" r="5" fill="${bg}"/>
    <circle cx="56" cy="47" r="5" fill="${bg}"/>
    <circle cx="47" cy="60" r="4" fill="${bg}"/>`,
  // Ролл в лаваше в разрезе
  lavash: (bg) => `
    <g transform="rotate(-35 48 48)">
      <rect x="14" y="34" width="66" height="28" rx="14" fill="${W}"/>
      <circle cx="66" cy="48" r="14" fill="${W}" stroke="${bg}" stroke-width="3"/>
      <path d="M66 48m-7 0a7 7 0 1 0 7-7a4 4 0 1 0 4 4" fill="none" stroke="${bg}" stroke-width="3" stroke-linecap="round"/>
    </g>`,
  // Кофейное зерно
  zerno: (bg) => `
    <g transform="rotate(30 48 48)">
      <ellipse cx="48" cy="48" rx="19" ry="28" fill="${W}"/>
      <path d="M46 21c11 12-9 29 2 54" fill="none" stroke="${bg}" stroke-width="4" stroke-linecap="round"/>
    </g>`,
  // Лист с прожилкой
  listva: (bg) => `
    <path d="M22 74C22 42 44 22 76 22c0 32-20 52-54 52z" fill="${W}"/>
    <path d="M26 70L62 34M44 52h12M38 58v-12" fill="none" stroke="${bg}" stroke-width="4" stroke-linecap="round"/>`,
};

/** SVG-разметка логотипа 96×96. */
export function logoSvg(id: string): string {
  const r = restaurants.find((x) => x.id === id);
  if (!r) throw new Error(`Unknown restaurant ${id}`);
  const mark = marks[id]?.(r.brandColor) ?? '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" role="img" aria-label="${r.name}"><rect width="96" height="96" rx="24" fill="${r.brandColor}"/>${mark}</svg>`;
}

/** data: URI для <img src>. */
export const logoUri = (id: string): string => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoSvg(id))}`;
