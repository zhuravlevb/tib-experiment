import { Chip, Fab, Icon, Link, NavRight, f7 } from 'framework7-react';
import { cartCount, computeTotals, getRestaurant, logoUri, ALLERGEN_EMOJI, ALLERGEN_LABEL, DIET_EMOJI, DIET_LABEL, type Allergen, type DietTag } from '@tib/kiosk-core';
import { confirmCancel, go, rub, useKiosk, useT } from '@tib/kiosk-app';

/** Действия в Top app bar: доступность и отмена заказа. */
export function NavActions({ cancel = true }: { cancel?: boolean }) {
  const t = useT();
  return (
    <NavRight>
      <Link iconOnly aria-label={t('accessibility')} onClick={() => f7.panel.open('right')}>
        <Icon material="accessibility_new" />
      </Link>
      {cancel && (
        <Link iconOnly aria-label={t('cancelOrder')} onClick={confirmCancel}>
          <Icon material="close" />
        </Link>
      )}
    </NavRight>
  );
}

/** Extended FAB корзины: видна на всех экранах выбора. */
export function CartFab() {
  const t = useT();
  const cart = useKiosk((s) => s.cart);
  const guest = useKiosk((s) => s.guest);
  const applied = useKiosk((s) => s.applied);
  if (!cart.length) return null;
  const total = computeTotals(cart, guest, applied).total;
  return (
    <Fab slot="fixed" position="right-bottom" text={`${t('cart')} · ${cartCount(cart)} · ${rub(total)}`} onClick={() => go('cart')}>
      <Icon material="shopping_bag" />
    </Fab>
  );
}

/** Пиктограммы диет и аллергенов — всегда с подписью. */
export function DietChips({ tags, allergens }: { tags: DietTag[]; allergens: Allergen[] }) {
  const t = useT();
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {tags.map((d) => (
        <Chip key={d} text={`${DIET_EMOJI[d]} ${t(DIET_LABEL[d])}`} />
      ))}
      {allergens.map((a) => (
        <Chip key={a} outline text={`${ALLERGEN_EMOJI[a]} ${t(ALLERGEN_LABEL[a])}`} />
      ))}
    </div>
  );
}

/** Логотип бренда в медиа-слоте чипа. */
export function BrandChip({ id }: { id: string }) {
  return (
    <Chip text={getRestaurant(id).name}>
      <img slot="media" src={logoUri(id)} alt="" style={{ width: '100%', height: '100%', display: 'block' }} />
    </Chip>
  );
}
