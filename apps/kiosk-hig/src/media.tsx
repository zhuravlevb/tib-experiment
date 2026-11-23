import { photoResolver } from '@tib/kiosk-app';
import { CATEGORY_EMOJI, getRestaurant, logoUri, type MenuItem } from '@tib/kiosk-core';

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

export function RestaurantMedia({ id, height }: { id: string; height: number }) {
  const r = getRestaurant(id);
  const src = photo(`restaurants/${id}.jpg`);
  return src ? (
    <img src={src} alt="" style={{ width: '100%', height, objectFit: 'cover', display: 'block' }} />
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

import { IonThumbnail } from '@ionic/react';

/** Логотип в системном слоте миниатюры строки списка. */
export function LogoThumb({ id, size }: { id: string; size: number }) {
  return (
    <IonThumbnail slot="start" style={{ '--size': `${size}px`, '--border-radius': `${size / 4.5}px` } as React.CSSProperties}>
      <img src={logoUri(id)} alt={getRestaurant(id).name} />
    </IonThumbnail>
  );
}

/** Миниатюра блюда в строке списка. */
export function DishThumb({ item, size }: { item: MenuItem; size: number }) {
  return (
    <IonThumbnail slot="start" style={{ '--size': `${size}px`, '--border-radius': '10px', overflow: 'hidden', borderRadius: 10 } as React.CSSProperties}>
      <DishMedia item={item} height={size} />
    </IonThumbnail>
  );
}
