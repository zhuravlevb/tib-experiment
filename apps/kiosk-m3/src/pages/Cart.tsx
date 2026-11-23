import { Block, BlockTitle, Button, Link, List, ListItem, Navbar, Page, Stepper } from 'framework7-react';
import { computeTotals, getItem, linePrice, type CartLine, type OptionGroup } from '@tib/kiosk-core';
import { backTo, go, kiosk, openItem, rub, setTint, useKiosk, useT } from '@tib/kiosk-app';
import { DishMedia } from '../media';
import { BrandChip, NavActions } from './parts';

/** Подпись выбранных опций строки: «M, Овсяное, Сироп карамель» */
export function useLineSummary() {
  const t = useT();
  return (line: CartLine) => {
    const item = getItem(line.itemId);
    const names = (groups: OptionGroup[], sel: CartLine['selections']) =>
      groups.flatMap((g) => (sel[g.id] ?? []).map((id) => g.options.find((o) => o.id === id)).filter(Boolean).map((o) => t(o!.name)));
    const parts = names(item.groups, line.selections);
    if (line.combo && item.combo) parts.push(`${t('makeCombo')}: ${names(item.combo.groups, line.comboSelections).join(', ')}`);
    return parts.join(', ');
  };
}

export default function Cart() {
  const t = useT();
  const cart = useKiosk((s) => s.cart);
  const totals = computeTotals(cart, null, []);
  const summary = useLineSummary();

  return (
    <Page onPageBeforeIn={() => setTint(null)}>
      <Navbar title={t('cart')} backLink>
        <NavActions />
      </Navbar>
      {cart.length === 0 && <Block>{t('cartEmpty')}</Block>}
      {totals.groups.map((g) => (
        <div key={g.restaurant.id}>
          <BlockTitle style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <BrandChip id={g.restaurant.id} />
            <span>{rub(g.subtotal)}</span>
          </BlockTitle>
          <List mediaList strong inset>
            {g.lines.map((line) => (
              <ListItem key={line.id} title={t(getItem(line.itemId).name)} text={summary(line)} after={rub(linePrice(line))}>
                <div slot="media" style={{ width: 72, borderRadius: 16, overflow: 'hidden' }}>
                  <DishMedia item={getItem(line.itemId)} height={72} />
                </div>
                <div slot="footer" style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
                  <Stepper small round fill value={line.qty} min={0} max={20} onStepperChange={(v: number) => kiosk.getState().setQty(line.id, v)} />
                  <Link onClick={() => openItem(line.itemId, line.id)}>{t('edit')}</Link>
                  <Link color="red" onClick={() => kiosk.getState().setQty(line.id, 0)}>{t('remove')}</Link>
                </div>
              </ListItem>
            ))}
          </List>
        </div>
      ))}
      <List strong inset>
        <ListItem title={t('total')} after={rub(totals.total)} />
      </List>
      <Block>
        <Button large tonal onClick={() => backTo('restaurants')}>{t('addMore')}</Button>
        <Button large fill style={{ marginTop: 12 }} disabled={!cart.length} onClick={() => go('loyalty')}>
          {t('checkout')} · {rub(totals.total)}
        </Button>
      </Block>
    </Page>
  );
}
