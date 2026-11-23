import { photoResolver } from '@tib/kiosk-app';
import { CATEGORY_EMOJI, getRestaurant, logoUri, menu, type MenuItem } from '@tib/kiosk-core';

const files = import.meta.glob('../../../assets/**/*.{jpg,jpeg,webp,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const photo = photoResolver(files);

import credits from '../../../assets/food/credits.json';

/** Подпись к фото по условиям лицензии CC: автор и лицензия. */
export function photoCredit(item: MenuItem): string | null {
  const c = (credits as { file: string; creator: string | null; license: string; licenseCode?: string; credit?: string }[]).find((x) =>
    x.file.includes(`/${item.id}.`),
  );
  if (!c || !photo(item.image)) return null;
  return `Фото: ${c.creator ?? 'автор не указан'}, ${c.license}`;
}

/** Медиа для карточки: фото из assets или эмодзи на фоне цвета бренда. */
export function DishMedia({ item, height }: { item: MenuItem; height: number }) {
  const src = photo(item.image);
  const color = getRestaurant(item.restaurantId).brandColor;
  return src ? (
    <img src={src} alt="" style={{ width: '100%', height, objectFit: 'cover', display: 'block' }} />
  ) : (
    <div aria-hidden style={{ height, display: 'grid', placeItems: 'center', fontSize: height * 0.45, background: `${color}22` }}>
      {CATEGORY_EMOJI[item.categoryId] ?? '🍽️'}
    </div>
  );
}

/** Обложка ресторана: фото его первого блюда и логотип в углу; без фото — логотип на цвете бренда. */
export function RestaurantMedia({ id, height }: { id: string; height: number }) {
  const r = getRestaurant(id);
  const cover = menu.find((m) => m.restaurantId === id);
  const src = cover ? photo(cover.image) : null;
  return src ? (
    <div aria-hidden style={{ position: 'relative', height }}>
      <img src={src} alt="" style={{ width: '100%', height, objectFit: 'cover', display: 'block' }} />
      <img src={logoUri(id)} alt="" width={height * 0.3} height={height * 0.3} style={{ position: 'absolute', left: 12, bottom: 12, borderRadius: height * 0.07 }} />
    </div>
  ) : (
    <div aria-hidden style={{ height, display: 'grid', placeItems: 'center', background: r.brandColor }}>
      <img src={logoUri(id)} alt="" style={{ height: height * 0.62 }} />
    </div>
  );
}

/** Логотип ресторана: стоит рядом с каждым номером выдачи. */
export function Logo({ id, size }: { id: string; size: number }) {
  return <img src={logoUri(id)} alt={getRestaurant(id).name} width={size} height={size} style={{ display: 'block', borderRadius: size / 4, flex: 'none' }} />;
}
